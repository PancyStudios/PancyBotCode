// ----------- Modules -------------
import {connect, connection, FilterQuery, Model} from 'mongoose';
import {DataManager} from './DataManager';
// ---------- Schemas ----------
import {antiRF, Guild} from './Schemas/BotDataBase';
import {premiumGuildModel, premiumModel} from './Schemas/premium';
import {warns} from "./Schemas/Warns"; // Corregido: sin alias innecesario
import {TempbanModel} from './Schemas/Tempbans';
import {Embeds} from './Schemas/Embeds';
// ---------- Types ----------
import {GuildDataFirst} from './Type/Security';
import {UserData} from './Type/User';
import {Premium, PremiumGuild} from './Type/Premium';
import {WarnsDb} from './Type/Warns'; // Corregido: Usa la interfaz correcta del Schema
import {TempbanOptions} from './Type/Tempan';
import {EmbedDb} from './Type/Embeds';

interface QueuedOperation {
    modelName: string;
    query: FilterQuery<any>;
    operation: 'set' | 'delete';
    data?: any;
}

export class Database {
    public isConnected: boolean = false;
    private writeQueue: QueuedOperation[] = [];
    private reconnectInterval: NodeJS.Timeout | null = null;
    private models: { [key: string]: Model<any> } = {};

    public guilds: DataManager<GuildDataFirst>;
    public users: DataManager<UserData>;
    public embeds: DataManager<EmbedDb>;
    public premiumGuilds: DataManager<PremiumGuild>;
    public premiumUsers: DataManager<Premium>;
    public tempbans: DataManager<TempbanOptions>;
    public warns: DataManager<WarnsDb>;

    constructor() {
        // Registra los modelos para poder acceder a ellos por nombre
        this.models['Guild'] = Guild;
        this.models['AntiRF'] = antiRF;
        this.models['Embeds'] = Embeds;
        this.models['premium_guilds'] = premiumGuildModel;
        this.models['premium'] = premiumModel;
        this.models['tempbans'] = TempbanModel;
        this.models['Warns'] = warns;

        // --- CONFIGURACIÓN DE CACHÉ ---
        this.guilds = new DataManager(Guild, this, { maxCacheSize: 1000 });
        this.users = new DataManager(antiRF, this,  { maxCacheSize: 2500 });
        this.embeds = new DataManager(Embeds, this,  { maxCacheSize: 500 });
        this.premiumGuilds = new DataManager(premiumGuildModel, this,  { maxCacheSize: 200 });
        this.premiumUsers = new DataManager(premiumModel, this,  { maxCacheSize: 200 });
        this.tempbans = new DataManager(TempbanModel, this,  { maxCacheSize: 100 });
        this.warns = new DataManager(warns,  this, { maxCacheSize: 500 });

        this.connect();

        // Listeners para eventos de desconexión
        connection.on('disconnected', () => this.handleDisconnection());
        connection.on('error', (error) => {
            console.error('Error en la conexión con MongoDB:', 'DB');
            this.handleDisconnection();
        });
    }

    private async connect() {
        if (this.isConnected) return;
        try {
            console.system('Intentando conectar a la base de datos...', 'DB');
            await connect(process.env.mongodbUrl, {
                tls: false,
                dbName: 'PancyBot',
                serverSelectionTimeoutMS: 5000,
            });

            this.isConnected = true;
            console.success('Conectado exitosamente a la base de datos.', 'DB');

            if (this.reconnectInterval) {
                clearInterval(this.reconnectInterval);
                this.reconnectInterval = null;
            }

            await this.primeAllCaches();
            await this.syncOfflineWrites();

        } catch (err) {
            console.critical('Fallo al conectar con la base de datos.', 'DB');
            this.handleDisconnection();
        }
    }

    private handleDisconnection() {
        if (!this.isConnected) return;
        this.isConnected = false;
        console.warn('Se perdió la conexión con la base de datos. Activando modo offline.', 'DB');

        if (!this.reconnectInterval) {
            this.reconnectInterval = setInterval(() => {
                console.info('Intentando reconectar a la base de datos...', 'DB');
                this.connect();
            }, 15000);
        }
    }

    private async primeAllCaches() {
        console.system('Inicializando cachés (se llenarán bajo demanda)...', 'DB');
        await Promise.all([
            this.guilds.primeCache(),
            this.users.primeCache(),
            this.embeds.primeCache(),
            this.premiumGuilds.primeCache(),
            this.premiumUsers.primeCache(),
            this.tempbans.primeCache(),
            this.warns.primeCache(),
        ]);
        console.success('Todas las cachés han sido inicializadas.', 'DB');
    }

    public addToWriteQueue(operation: QueuedOperation) {
        this.writeQueue.push(operation);
    }

    private async syncOfflineWrites() {
        if (this.writeQueue.length === 0) {
            return;
        }

        console.system(`Sincronizando ${this.writeQueue.length} operaciones pendientes con la DB...`, 'DB-Sync');

        const operationsToSync = [...this.writeQueue];
        this.writeQueue = [];

        for (const op of operationsToSync) {
            const model = this.models[op.modelName];
            if (!model) {
                console.error(`Modelo '${op.modelName}' no encontrado durante la sincronización.`, 'DB-Sync');
                continue;
            }

            try {
                if (op.operation === 'set') {
                    await model.findOneAndUpdate(op.query, { $set: op.data }, { upsert: true });
                } else if (op.operation === 'delete') {
                    await model.deleteOne(op.query);
                }
            } catch (error) {
                console.error(`Error al sincronizar operación para '${op.modelName}'. La operación se volverá a encolar.`, 'DB-Sync');
                this.writeQueue.push(op);
            }
        }

        if (this.writeQueue.length === 0) {
            console.success('Sincronización completada exitosamente.', 'DB-Sync');
        } else {
            console.warn(`${this.writeQueue.length} operaciones no pudieron sincronizarse y se reintentarán.`, 'DB-Sync');
        }
    }

    public async disconnect() {
        await connection.destroy();
        console.warn('La base de datos ha sido desconectada', 'DB');
    }

    public async ping() {
        const start = Date.now()
        await connection.db.admin().ping()
        return Date.now() - start
    }

    public getStatusDB () {
        var StringStatus: string
        var isOnline = false
        switch (connection.readyState) {
            case 0:
                StringStatus = '🔴 | Desconectado'
            break;
            case 1:
                StringStatus = '🟢 | En linea'
                isOnline = true
            break;
            case 2:
                StringStatus = '🟡 | Conectando'
            break;
            case 3:
                StringStatus = '🟠 | Desconectando'
            break;
            default:
                StringStatus = '🟣 | Unknown'
            break;
        }
        return {
            StringStatus,
            isOnline
        }
    }
}
