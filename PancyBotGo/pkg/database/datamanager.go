// Package database provides the DataManager for cached database operations.
package database

import (
	"container/list"
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/PancyStudios/PancyBotCode/PancyBotGo/pkg/logger"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// DataManagerOptions contains configuration for a DataManager
type DataManagerOptions struct {
	MaxCacheSize int
}

// DataManager provides cached access to a MongoDB collection
type DataManager[T any] struct {
	collection   *mongo.Collection
	dbInstance   *Database
	cache        map[string]*list.Element
	cacheList    *list.List
	options      DataManagerOptions
	mu           sync.RWMutex
}

// cacheEntry holds a cached value with its key
type cacheEntry[T any] struct {
	key   string
	value *T
}

// DefaultDataManagerOptions returns default options for DataManager
func DefaultDataManagerOptions() DataManagerOptions {
	return DataManagerOptions{
		MaxCacheSize: 1000,
	}
}

// NewDataManager creates a new DataManager for a collection
func NewDataManager[T any](collectionName string, db *Database, opts ...DataManagerOptions) *DataManager[T] {
	options := DefaultDataManagerOptions()
	if len(opts) > 0 {
		options = opts[0]
	}

	return &DataManager[T]{
		collection: db.GetCollection(collectionName),
		dbInstance: db,
		cache:      make(map[string]*list.Element),
		cacheList:  list.New(),
		options:    options,
	}
}

// generateCacheKey creates a unique key from a query
func (dm *DataManager[T]) generateCacheKey(query bson.M) string {
	// Sort keys for consistent key generation
	data, _ := json.Marshal(query)
	collName := ""
	if dm.collection != nil {
		collName = dm.collection.Name()
	}
	return fmt.Sprintf("%s:%s", collName, string(data))
}

// Get retrieves a document from cache or database
func (dm *DataManager[T]) Get(query bson.M) (*T, error) {
	cacheKey := dm.generateCacheKey(query)

	// Check cache first
	dm.mu.RLock()
	if elem, exists := dm.cache[cacheKey]; exists {
		// Move to front (LRU)
		dm.mu.RUnlock()
		dm.mu.Lock()
		dm.cacheList.MoveToFront(elem)
		entry := elem.Value.(*cacheEntry[T])
		dm.mu.Unlock()
		return entry.value, nil
	}
	dm.mu.RUnlock()

	// Not in cache, fetch from database
	if !dm.dbInstance.IsConnected || dm.collection == nil {
		return nil, fmt.Errorf("database not connected")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var result T
	err := dm.collection.FindOne(ctx, query).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		logger.Warn(fmt.Sprintf("Fallo al leer de la DB (%s), intentando desde caché...", dm.collection.Name()), "DataManager")
		return nil, err
	}

	// Add to cache
	dm.mu.Lock()
	defer dm.mu.Unlock()

	entry := &cacheEntry[T]{key: cacheKey, value: &result}
	elem := dm.cacheList.PushFront(entry)
	dm.cache[cacheKey] = elem

	// Evict if over capacity
	if dm.options.MaxCacheSize > 0 && dm.cacheList.Len() > dm.options.MaxCacheSize {
		oldest := dm.cacheList.Back()
		if oldest != nil {
			oldEntry := oldest.Value.(*cacheEntry[T])
			delete(dm.cache, oldEntry.key)
			dm.cacheList.Remove(oldest)
		}
	}

	return &result, nil
}

// GetAll retrieves all documents matching a query from the database
func (dm *DataManager[T]) GetAll(query bson.M) ([]*T, error) {
	if !dm.dbInstance.IsConnected || dm.collection == nil {
		return nil, fmt.Errorf("database not connected")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := dm.collection.Find(ctx, query)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []*T
	for cursor.Next(ctx) {
		var doc T
		if err := cursor.Decode(&doc); err != nil {
			continue
		}
		results = append(results, &doc)
	}

	return results, cursor.Err()
}

// Set updates or inserts a document in the database and cache
func (dm *DataManager[T]) Set(query bson.M, data interface{}) (*T, error) {
	cacheKey := dm.generateCacheKey(query)

	if !dm.dbInstance.IsConnected || dm.collection == nil {
		// Queue for later
		logger.Warn(fmt.Sprintf("DB offline. Encolando escritura para '%s'", dm.collection.Name()), "DataManager")
		dm.dbInstance.AddToWriteQueue(QueuedOperation{
			CollectionName: dm.collection.Name(),
			Query:          query,
			Operation:      "set",
			Data:           data,
		})
		return nil, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.FindOneAndUpdate().
		SetUpsert(true).
		SetReturnDocument(options.After)

	var result T
	err := dm.collection.FindOneAndUpdate(ctx, query, bson.M{"$set": data}, opts).Decode(&result)
	if err != nil {
		logger.Error("Error en 'set' con DB conectada. Encolando por seguridad.", "DataManager")
		dm.dbInstance.AddToWriteQueue(QueuedOperation{
			CollectionName: dm.collection.Name(),
			Query:          query,
			Operation:      "set",
			Data:           data,
		})
		return nil, err
	}

	// Update cache
	dm.mu.Lock()
	defer dm.mu.Unlock()

	entry := &cacheEntry[T]{key: cacheKey, value: &result}

	if elem, exists := dm.cache[cacheKey]; exists {
		elem.Value = entry
		dm.cacheList.MoveToFront(elem)
	} else {
		elem := dm.cacheList.PushFront(entry)
		dm.cache[cacheKey] = elem

		// Evict if over capacity
		if dm.options.MaxCacheSize > 0 && dm.cacheList.Len() > dm.options.MaxCacheSize {
			oldest := dm.cacheList.Back()
			if oldest != nil {
				oldEntry := oldest.Value.(*cacheEntry[T])
				delete(dm.cache, oldEntry.key)
				dm.cacheList.Remove(oldest)
			}
		}
	}

	return &result, nil
}

// Delete removes a document from the database and cache
func (dm *DataManager[T]) Delete(query bson.M) error {
	cacheKey := dm.generateCacheKey(query)

	// Remove from cache first
	dm.mu.Lock()
	if elem, exists := dm.cache[cacheKey]; exists {
		dm.cacheList.Remove(elem)
		delete(dm.cache, cacheKey)
	}
	dm.mu.Unlock()

	if !dm.dbInstance.IsConnected || dm.collection == nil {
		logger.Warn(fmt.Sprintf("DB offline. Encolando eliminación para '%s'", dm.collection.Name()), "DataManager")
		dm.dbInstance.AddToWriteQueue(QueuedOperation{
			CollectionName: dm.collection.Name(),
			Query:          query,
			Operation:      "delete",
		})
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := dm.collection.DeleteOne(ctx, query)
	if err != nil {
		logger.Error("Error en 'delete' con DB conectada. Encolando por seguridad.", "DataManager")
		dm.dbInstance.AddToWriteQueue(QueuedOperation{
			CollectionName: dm.collection.Name(),
			Query:          query,
			Operation:      "delete",
		})
		return err
	}

	return nil
}

// ClearCache clears the entire cache
func (dm *DataManager[T]) ClearCache() {
	dm.mu.Lock()
	defer dm.mu.Unlock()

	dm.cache = make(map[string]*list.Element)
	dm.cacheList = list.New()
}

// CacheSize returns the current cache size
func (dm *DataManager[T]) CacheSize() int {
	dm.mu.RLock()
	defer dm.mu.RUnlock()
	return dm.cacheList.Len()
}

// PrimeCache logs that the cache is ready (caches are filled on demand)
func (dm *DataManager[T]) PrimeCache() {
	collName := ""
	if dm.collection != nil {
		collName = dm.collection.Name()
	}
	logger.System(fmt.Sprintf("Caché para '%s' preparada (tamaño máx: %d). Se llenará bajo demanda.", collName, dm.options.MaxCacheSize), "DataManager")
}
