// Package mqtt provides MQTT communication capabilities for the bot.
// It supports publish/subscribe patterns with request/response functionality.
package mqtt

import (
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/logger"
	"github.com/google/uuid"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

// MqttRequest represents an MQTT request message
type MqttRequest struct {
	CorrelationID string      `json:"correlationId"`
	Payload       interface{} `json:"payload,omitempty"`
}

// MqttResponse represents an MQTT response message
type MqttResponse struct {
	CorrelationID string      `json:"correlationId"`
	Data          interface{} `json:"data"`
	Error         string      `json:"error,omitempty"`
}

// MqttCommunicator handles MQTT communication
type MqttCommunicator struct {
	client           mqtt.Client
	responseHandlers map[string]func(MqttResponse)
	mu               sync.RWMutex
	clientID         string
}

var (
	communicator *MqttCommunicator
	once         sync.Once
)

// Init initializes the global MQTT communicator
func Init(host, port, username, password, clientID string) *MqttCommunicator {
	once.Do(func() {
		communicator = NewMqttCommunicator(host, port, username, password, clientID)
	})
	return communicator
}

// Get returns the global MQTT communicator
func Get() *MqttCommunicator {
	return communicator
}

// NewMqttCommunicator creates a new MQTT communicator
func NewMqttCommunicator(host, port, username, password, clientID string) *MqttCommunicator {
	mc := &MqttCommunicator{
		responseHandlers: make(map[string]func(MqttResponse)),
		clientID:         clientID,
	}

	uniqueID := fmt.Sprintf("%s_%s", clientID, uuid.New().String())

	opts := mqtt.NewClientOptions().
		AddBroker(fmt.Sprintf("tcp://%s:%s", host, port)).
		SetClientID(uniqueID).
		SetUsername(username).
		SetPassword(password).
		SetAutoReconnect(true).
		SetConnectRetry(true).
		SetConnectRetryInterval(5 * time.Second).
		SetOnConnectHandler(func(c mqtt.Client) {
			logger.Success(fmt.Sprintf("Conectado al broker MQTT como %s", clientID), "MQTT")
		}).
		SetConnectionLostHandler(func(c mqtt.Client, err error) {
			logger.Error(fmt.Sprintf("Conexión MQTT perdida: %v", err), "MQTT")
		})

	mc.client = mqtt.NewClient(opts)

	token := mc.client.Connect()
	if token.Wait() && token.Error() != nil {
		logger.Error(fmt.Sprintf("Error de conexión MQTT: %v", token.Error()), "MQTT")
	}

	return mc
}

// Destroy closes the MQTT connection
func (mc *MqttCommunicator) Destroy() {
	if mc.client != nil && mc.client.IsConnected() {
		mc.client.Disconnect(250)
		logger.System("Conexión MQTT cerrada exitosamente.", "MQTT")
	} else {
		logger.Warn("El cliente MQTT no estaba conectado, no se necesita cerrar.", "MQTT")
	}
}

// IsConnected returns true if connected to the broker
func (mc *MqttCommunicator) IsConnected() bool {
	return mc.client != nil && mc.client.IsConnected()
}

// Publish sends a message to a topic
func (mc *MqttCommunicator) Publish(topic string, payload interface{}) error {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	token := mc.client.Publish(topic, 0, false, jsonData)
	token.Wait()
	return token.Error()
}

// Request sends a request and waits for a response
func (mc *MqttCommunicator) Request(topic string, payload interface{}, timeout time.Duration) (interface{}, error) {
	correlationID := uuid.New().String()
	requestTopic := fmt.Sprintf("pancy/request/%s", topic)
	responseTopic := fmt.Sprintf("pancy/response/%s/%s", topic, correlationID)

	responseChan := make(chan MqttResponse, 1)
	errChan := make(chan error, 1)

	// Set up response handler
	mc.mu.Lock()
	mc.responseHandlers[correlationID] = func(response MqttResponse) {
		responseChan <- response
	}
	mc.mu.Unlock()

	// Clean up handler when done
	defer func() {
		mc.mu.Lock()
		delete(mc.responseHandlers, correlationID)
		mc.mu.Unlock()
		mc.client.Unsubscribe(responseTopic)
	}()

	// Subscribe to response topic
	token := mc.client.Subscribe(responseTopic, 0, func(c mqtt.Client, msg mqtt.Message) {
		var response MqttResponse
		if err := json.Unmarshal(msg.Payload(), &response); err != nil {
			errChan <- err
			return
		}

		mc.mu.RLock()
		handler, exists := mc.responseHandlers[response.CorrelationID]
		mc.mu.RUnlock()

		if exists {
			handler(response)
		}
	})

	if token.Wait() && token.Error() != nil {
		return nil, token.Error()
	}

	// Send request
	request := MqttRequest{
		CorrelationID: correlationID,
		Payload:       payload,
	}

	if err := mc.Publish(requestTopic, request); err != nil {
		return nil, err
	}

	// Wait for response or timeout
	select {
	case response := <-responseChan:
		if response.Error != "" {
			return nil, fmt.Errorf("%s", response.Error)
		}
		return response.Data, nil
	case err := <-errChan:
		return nil, err
	case <-time.After(timeout):
		return nil, fmt.Errorf("la petición a '%s' ha expirado (timeout)", topic)
	}
}

// RequestHandler is a function type for handling MQTT requests
type RequestHandler func(payload map[string]interface{}) (interface{}, error)

// On registers a handler for a request topic
func (mc *MqttCommunicator) On(requestTopic string, callback RequestHandler) {
	topic := fmt.Sprintf("pancy/request/%s", requestTopic)

	token := mc.client.Subscribe(topic, 0, func(c mqtt.Client, msg mqtt.Message) {
		var request MqttRequest
		if err := json.Unmarshal(msg.Payload(), &request); err != nil {
			logger.Error(fmt.Sprintf("Error parsing MQTT request: %v", err), "MQTT")
			return
		}

		// Extract actual topic from received topic
		receivedTopic := msg.Topic()
		actualTopic := strings.TrimPrefix(receivedTopic, "pancy/request/")
		responseTopic := fmt.Sprintf("pancy/response/%s/%s", actualTopic, request.CorrelationID)

		var response MqttResponse

		// Convert payload to map
		payloadMap := make(map[string]interface{})
		if request.Payload != nil {
			if pm, ok := request.Payload.(map[string]interface{}); ok {
				payloadMap = pm
			}
		}
		payloadMap["_topic"] = actualTopic

		// Execute callback
		data, err := callback(payloadMap)
		if err != nil {
			response = MqttResponse{
				CorrelationID: request.CorrelationID,
				Data:          nil,
				Error:         err.Error(),
			}
		} else {
			response = MqttResponse{
				CorrelationID: request.CorrelationID,
				Data:          data,
			}
		}

		// Send response
		mc.Publish(responseTopic, response)
	})

	if token.Wait() && token.Error() != nil {
		logger.Error(fmt.Sprintf("Error subscribing to topic %s: %v", topic, token.Error()), "MQTT")
	}
}

// Subscribe subscribes to a topic with a message handler
func (mc *MqttCommunicator) Subscribe(topic string, handler func(topic string, payload []byte)) error {
	token := mc.client.Subscribe(topic, 0, func(c mqtt.Client, msg mqtt.Message) {
		handler(msg.Topic(), msg.Payload())
	})
	token.Wait()
	return token.Error()
}

// Unsubscribe unsubscribes from a topic
func (mc *MqttCommunicator) Unsubscribe(topic string) error {
	token := mc.client.Unsubscribe(topic)
	token.Wait()
	return token.Error()
}

// topicMatch checks if a received topic matches a pattern (with wildcards)
// '+' matches exactly one topic level
// '#' matches zero or more topic levels and must be the last character
func topicMatch(pattern, topic string) bool {
	patternParts := strings.Split(pattern, "/")
	topicParts := strings.Split(topic, "/")

	patternLen := len(patternParts)
	topicLen := len(topicParts)

	for i := 0; i < patternLen; i++ {
		// '#' wildcard matches zero or more remaining levels
		if patternParts[i] == "#" {
			return true // # matches everything that follows (including nothing)
		}

		// If we've run out of topic parts but pattern still has parts (not #)
		if i >= topicLen {
			return false
		}

		// '+' matches exactly one topic level
		if patternParts[i] == "+" {
			continue
		}

		// Exact match required
		if patternParts[i] != topicParts[i] {
			return false
		}
	}

	// Pattern exhausted, topic must also be exhausted for a match
	return patternLen == topicLen
}
