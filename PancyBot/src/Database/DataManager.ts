import {Collection} from 'discord.js';
import {FilterQuery, Model} from 'mongoose';
import {Database} from './index';

export interface DataManagerOptions {
    maxCacheSize?: number;
}

export class DataManager<T> {
    public model: Model<T>;
    private cache: Collection<string, T>;
    private dbInstance: Database;
    private readonly options: DataManagerOptions;

    constructor(model: Model<T>, dbInstance: Database, options: DataManagerOptions = { maxCacheSize: 1000 }) {
        this.model = model;
        this.dbInstance = dbInstance;
        this.cache = new Collection<string, T>();
        this.options = options;
    }

    private generateCacheKey(query: FilterQuery<T>): string {
        const plainQuery = query as { [key: string]: any };
        const sortedQuery = Object.keys(plainQuery).sort().reduce(
            (obj, key) => {
                obj[key] = plainQuery[key];
                return obj;
            }, {} as { [key: string]: any }
        );
        return `${this.model.modelName}:${JSON.stringify(sortedQuery)}`;
    }

    async get(query: FilterQuery<T>): Promise<T | null> {
        const cacheKey = this.generateCacheKey(query);

        if (this.cache.has(cacheKey)) {
            const cachedDoc = this.cache.get(cacheKey)!;
            this.cache.delete(cacheKey);
            this.cache.set(cacheKey, cachedDoc);
            return cachedDoc;
        }

        if (this.dbInstance.isConnected) {
            try {
                const doc = await this.model.findOne(query).lean<T>();
                if (doc) {
                    this.cache.set(cacheKey, doc);
                    if (this.options.maxCacheSize !== -1 && this.cache.size > this.options.maxCacheSize) {
                        this.cache.delete(this.cache.firstKey()!);
                    }
                }
                return doc;
            } catch (error) {
                console.warn(`Fallo al leer de la DB (${this.model.modelName}), intentando desde caché...`, 'DataManager');
                return null;
            }
        } else {
            return null;
        }
    }

    async set(query: FilterQuery<T>, data: Partial<T>): Promise<T | null> {
        const cacheKey = this.generateCacheKey(query);

        if (this.dbInstance.isConnected) {
            try {
                const updatedDoc = await this.model.findOneAndUpdate(
                    query,
                    { $set: data },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                ).lean<T>();
                this.cache.set(cacheKey, updatedDoc);
                if (this.options.maxCacheSize !== -1 && this.cache.size > this.options.maxCacheSize) {
                    this.cache.delete(this.cache.firstKey()!);
                }
                return updatedDoc;
            } catch (error) {
                console.error(`Error en 'set' con DB conectada. Encolando por seguridad.`, 'DataManager');
                // CORRECCIÓN (TS2353): Pasamos `query` como se espera.
                this.dbInstance.addToWriteQueue({ modelName: this.model.modelName, query, operation: 'set', data });
                return null;
            }
        } else {
            console.warn(`DB offline. Encolando escritura para '${this.model.modelName}'`, 'DataManager');
            this.dbInstance.addToWriteQueue({ modelName: this.model.modelName, query, operation: 'set', data });
            return null;
        }
    }

    async delete(query: FilterQuery<T>): Promise<void> {
        const cacheKey = this.generateCacheKey(query);
        this.cache.delete(cacheKey);

        if (this.dbInstance.isConnected) {
            try {
                await this.model.deleteOne(query);
            } catch (error) {
                console.error(`Error en 'delete' con DB conectada. Encolando por seguridad.`, 'DataManager');
                this.dbInstance.addToWriteQueue({ modelName: this.model.modelName, query, operation: 'delete' });
            }
        } else {
            console.warn(`DB offline. Encolando eliminación para '${this.model.modelName}'`, 'DataManager');
            this.dbInstance.addToWriteQueue({ modelName: this.model.modelName, query, operation: 'delete' });
        }
    }

    async primeCache(): Promise<void> {
        console.system(`Caché para '${this.model.modelName}' preparada (tamaño máx: ${this.options.maxCacheSize}). Se llenará bajo demanda.`, 'DataManager');
    }
}