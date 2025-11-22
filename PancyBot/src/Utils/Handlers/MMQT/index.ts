/*
 * =================================================================
 * /src/utils/MqttCommunicator.ts (NUEVO ARCHIVO - LÓGICA COMPARTIDA)
 * =================================================================
 *
 * Esta clase maneja la lógica de comunicación MQTT. Puede ser usada
 * tanto por el Bot como por la API.
 */
import mqtt, { MqttClient } from 'mqtt';
import { randomUUID } from 'crypto';

interface MqttRequest {
    correlationId: string;
    payload?: any;
}

interface MqttResponse {
    correlationId: string;
    data: any;
    error?: string;
}

export class MqttCommunicator {
    private client: MqttClient;
    private responseHandlers: Map<string, (response: MqttResponse) => void> = new Map();

    constructor(clientId: string) {
        this.client = mqtt.connect({
            host: process.env.MQTT_Host,
            port: 1883,
            username: process.env.MQTT_User,
            password: process.env.MQTT_Password,
            clientId: `${clientId}_${randomUUID()}`,
            protocol: 'mqtt',
        });

        this.client.on('connect', () => {
            console.success(`Conectado al broker MQTT como ${clientId}`, 'MQTT');
        });

        this.client.on('error', (error) => {
            console.error(`Error de conexión MQTT:`, 'MQTT');
            console.error(error, 'MQTT');
        });
    }

    // --- MÉTODO PARA CERRAR LA CONEXIÓN ---
    public destroy(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.client || !this.client.connected) {
                console.warn('El cliente MQTT no estaba conectado, no se necesita cerrar.', 'MQTT');
                return resolve();
            }
            this.client.end(true, () => { // El 'true' fuerza el cierre sin procesar mensajes pendientes
                console.system('Conexión MQTT cerrada exitosamente.', 'MQTT');
                resolve();
            });
        });
    }

    // --- Métodos para la API (el que pide) ---

    public publish(topic: string, payload: any): void {
        this.client.publish(topic, JSON.stringify(payload));
    }

    public async request(topic: string, payload: any, timeout = 5000): Promise<any> {
        const correlationId = randomUUID();
        const requestTopic = `pancy/request/${topic}`;
        const responseTopic = `pancy/response/${topic}/${correlationId}`;

        return new Promise((resolve, reject) => {
            // Un manejador temporal para esta petición específica
            const handler = (response: MqttResponse) => {
                clearTimeout(timeoutId);
                this.client.unsubscribe(responseTopic);
                this.responseHandlers.delete(correlationId);
                if (response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response.data);
                }
            };

            const timeoutId = setTimeout(() => {
                this.client.unsubscribe(responseTopic);
                this.responseHandlers.delete(correlationId);
                reject(new Error(`La petición a '${topic}' ha expirado (timeout).`));
            }, timeout);

            this.responseHandlers.set(correlationId, handler);
            this.client.subscribe(responseTopic, (err) => {
                if (err) return reject(err);

                const request: MqttRequest = { correlationId, payload };
                this.client.publish(requestTopic, JSON.stringify(request));
            });

            // Listener general de respuestas
            this.client.on('message', (topic, message) => {
                if (topic.startsWith('pancy/response/')) {
                    const response: MqttResponse = JSON.parse(message.toString());
                    if (this.responseHandlers.has(response.correlationId)) {
                        this.responseHandlers.get(response.correlationId)(response);
                    }
                }
            });
        });
    }

    // --- Métodos para el Bot (el que responde) ---

    public on(requestTopic: string, callback: (payload: any) => Promise<any>) {
        const topic = `pancy/request/${requestTopic}`;
        this.client.subscribe(topic);

        this.client.on('message', async (receivedTopic, message) => {
            if (receivedTopic !== topic) return;

            const request: MqttRequest = JSON.parse(message.toString());
            const responseTopic = `pancy/response/${requestTopic}/${request.correlationId}`;
            let response: MqttResponse;

            try {
                const data = await callback(request.payload);
                response = { correlationId: request.correlationId, data };
            } catch (error) {
                response = { correlationId: request.correlationId, data: null, error: error.message };
            }

            this.client.publish(responseTopic, JSON.stringify(response));
        });
    }
}
