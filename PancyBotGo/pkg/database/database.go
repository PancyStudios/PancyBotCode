// Package database provides MongoDB database connection and data management.
// It includes a DataManager with caching capabilities for efficient data access.
package database

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/logger"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// QueuedOperation represents a pending database operation
type QueuedOperation struct {
	CollectionName string
	Query          bson.M
	Operation      string // "set" or "delete"
	Data           interface{}
}

// Database manages the MongoDB connection and data managers
type Database struct {
	client            *mongo.Client
	db                *mongo.Database
	IsConnected       bool
	writeQueue        []QueuedOperation
	reconnectTicker   *time.Ticker
	stopReconnect     chan struct{}
	mu                sync.RWMutex
	queueMu           sync.Mutex
	collections       map[string]*mongo.Collection
}

var (
	database *Database
	dbOnce   sync.Once
)

// Init initializes the global database instance
func Init(mongoURL, dbName string) (*Database, error) {
	var err error
	dbOnce.Do(func() {
		database = NewDatabase()
		err = database.Connect(mongoURL, dbName)
	})
	return database, err
}

// Get returns the global database instance
func Get() *Database {
	return database
}

// NewDatabase creates a new Database instance
func NewDatabase() *Database {
	return &Database{
		IsConnected:   false,
		writeQueue:    make([]QueuedOperation, 0),
		stopReconnect: make(chan struct{}),
		collections:   make(map[string]*mongo.Collection),
	}
}

// Connect establishes a connection to MongoDB
func (d *Database) Connect(mongoURL, dbName string) error {
	d.mu.Lock()
	defer d.mu.Unlock()

	if d.IsConnected {
		return nil
	}

	logger.System("Intentando conectar a la base de datos...", "DB")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	clientOpts := options.Client().
		ApplyURI(mongoURL).
		SetServerSelectionTimeout(5 * time.Second)

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		logger.Critical("Fallo al conectar con la base de datos.", "DB")
		d.handleDisconnection(mongoURL, dbName)
		return err
	}

	// Ping to verify connection
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		logger.Critical("Fallo al verificar conexión con la base de datos.", "DB")
		d.handleDisconnection(mongoURL, dbName)
		return err
	}

	d.client = client
	d.db = client.Database(dbName)
	d.IsConnected = true

	logger.Success("Conectado exitosamente a la base de datos.", "DB")

	// Stop reconnection attempts if active
	if d.reconnectTicker != nil {
		d.reconnectTicker.Stop()
		d.reconnectTicker = nil
	}

	// Sync any queued operations
	go d.syncOfflineWrites()

	return nil
}

// handleDisconnection starts reconnection attempts
func (d *Database) handleDisconnection(mongoURL, dbName string) {
	if !d.IsConnected {
		return
	}
	d.IsConnected = false
	logger.Warn("Se perdió la conexión con la base de datos. Activando modo offline.", "DB")

	if d.reconnectTicker == nil {
		d.reconnectTicker = time.NewTicker(15 * time.Second)
		go func() {
			for {
				select {
				case <-d.reconnectTicker.C:
					logger.Info("Intentando reconectar a la base de datos...", "DB")
					if err := d.Connect(mongoURL, dbName); err == nil {
						return
					}
				case <-d.stopReconnect:
					return
				}
			}
		}()
	}
}

// Disconnect closes the database connection
func (d *Database) Disconnect() error {
	d.mu.Lock()
	defer d.mu.Unlock()

	if d.reconnectTicker != nil {
		d.reconnectTicker.Stop()
	}
	close(d.stopReconnect)

	if d.client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		err := d.client.Disconnect(ctx)
		if err != nil {
			return err
		}
		d.IsConnected = false
		logger.Warn("La base de datos ha sido desconectada", "DB")
	}
	return nil
}

// Ping measures the database response time
func (d *Database) Ping() (time.Duration, error) {
	d.mu.RLock()
	defer d.mu.RUnlock()

	if !d.IsConnected || d.client == nil {
		return 0, fmt.Errorf("not connected to database")
	}

	start := time.Now()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := d.client.Ping(ctx, readpref.Primary())
	return time.Since(start), err
}

// GetStatus returns the database connection status
func (d *Database) GetStatus() (string, bool) {
	d.mu.RLock()
	defer d.mu.RUnlock()

	if d.client == nil {
		return "🔴 | Desconectado", false
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	err := d.client.Ping(ctx, readpref.Primary())
	if err != nil {
		return "🔴 | Desconectado", false
	}
	return "🟢 | En linea", true
}

// GetCollection returns a MongoDB collection
func (d *Database) GetCollection(name string) *mongo.Collection {
	d.mu.RLock()
	if col, exists := d.collections[name]; exists {
		d.mu.RUnlock()
		return col
	}
	d.mu.RUnlock()

	d.mu.Lock()
	defer d.mu.Unlock()

	if d.db == nil {
		return nil
	}

	col := d.db.Collection(name)
	d.collections[name] = col
	return col
}

// AddToWriteQueue adds an operation to the offline write queue
func (d *Database) AddToWriteQueue(op QueuedOperation) {
	d.queueMu.Lock()
	defer d.queueMu.Unlock()
	d.writeQueue = append(d.writeQueue, op)
}

// syncOfflineWrites syncs queued operations with the database
func (d *Database) syncOfflineWrites() {
	d.queueMu.Lock()
	if len(d.writeQueue) == 0 {
		d.queueMu.Unlock()
		return
	}

	logger.System(fmt.Sprintf("Sincronizando %d operaciones pendientes con la DB...", len(d.writeQueue)), "DB-Sync")

	operations := make([]QueuedOperation, len(d.writeQueue))
	copy(operations, d.writeQueue)
	d.writeQueue = make([]QueuedOperation, 0)
	d.queueMu.Unlock()

	failedOps := make([]QueuedOperation, 0)

	for _, op := range operations {
		col := d.GetCollection(op.CollectionName)
		if col == nil {
			logger.Error(fmt.Sprintf("Colección '%s' no encontrada durante la sincronización.", op.CollectionName), "DB-Sync")
			continue
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)

		var err error
		if op.Operation == "set" {
			opts := options.Update().SetUpsert(true)
			_, err = col.UpdateOne(ctx, op.Query, bson.M{"$set": op.Data}, opts)
		} else if op.Operation == "delete" {
			_, err = col.DeleteOne(ctx, op.Query)
		}

		cancel()

		if err != nil {
			logger.Error(fmt.Sprintf("Error al sincronizar operación para '%s'. La operación se volverá a encolar.", op.CollectionName), "DB-Sync")
			failedOps = append(failedOps, op)
		}
	}

	if len(failedOps) > 0 {
		d.queueMu.Lock()
		d.writeQueue = append(d.writeQueue, failedOps...)
		d.queueMu.Unlock()
		logger.Warn(fmt.Sprintf("%d operaciones no pudieron sincronizarse y se reintentarán.", len(failedOps)), "DB-Sync")
	} else {
		logger.Success("Sincronización completada exitosamente.", "DB-Sync")
	}
}

// Client returns the underlying MongoDB client
func (d *Database) Client() *mongo.Client {
	return d.client
}

// DB returns the underlying MongoDB database
func (d *Database) DB() *mongo.Database {
	return d.db
}

// generateCacheKey creates a unique key from a query for caching
func generateCacheKey(collectionName string, query bson.M) string {
	data, _ := json.Marshal(query)
	return fmt.Sprintf("%s:%s", collectionName, string(data))
}
