

import { BaseEntity, SyncQueueItem } from '../types';

const DB_NAME = "homestead_db";
const DB_VERSION = 31; // Bumped for System Animal Library

class DBService {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return; // Server-side safety
      }
      
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error("IndexedDB error:", event);
        reject(request.error);
      };

      request.onsuccess = (event) => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        const stores = [
            'user_profile', 'tasks', 'plants', 'garden_beds', 'garden_logs', 
            'garden_photos', 'seeds', 'planting_logs', 'harvest_logs', 
            'journal_entries', 'rotation_records', 'animals', 'herds', 
            'animal_entries', 'breeding_logs', 'offspring', 'growth_logs', 
            'production_logs', 'feed_logs', 'medical_logs', 'loss_logs', 
            'expenses', 'recipes', 'pantry', 'health_records', 
            'marketplace', 'offers', 'recommendations_ai_store', 'trait_profiles',
            'notification_tasks', 'alert_logs', 'vet_contacts', 'custom_plants',
            'medications', 'prescriptions', 'med_admin_logs', 
            'vet_visits', 'medical_records', 'withdrawal_flags',
            'report_schedules', 'report_runs', 'export_archives', 'consent_logs', 'audit_logs',
            'subscriptions', 'invoices', 'sponsors', 'campaigns', 'ad_events',
            'auth_users', 'auth_devices', 'mfa_devices', 'security_audit_logs',
            'message_threads', 'messages', 'notifications', 'notification_preferences',
            'ai_recommendations', 'ai_feedback', 'ai_settings',
            'subscription_plans', 'trial_codes', 'subscription_logs', 'feature_access_cache',
            'sync_queue', 'conflict_log', 'sync_status', 'version_history',
            'data_exports', 'data_imports',
            'integrations', 'integration_logs', 'sensor_devices', 'sensor_readings',
            'orchard_trees', 'tree_logs', 'tree_yields',
            'hives', 'hive_inspections', 'hive_production',
            'help_articles', 'plant_discussions',
            // Admin Managed Libraries
            'system_plants', 'system_animals'
        ];

        stores.forEach(name => {
            if (!db.objectStoreNames.contains(name)) {
                const store = db.createObjectStore(name, { keyPath: 'id' });
                // Common indices
                if (['plants', 'garden_logs', 'garden_photos', 'rotation_records', 'harvest_logs'].includes(name)) {
                    store.createIndex('bedId', 'bedId', { unique: false });
                }
                if (['animals', 'animal_entries', 'production_logs', 'feed_logs'].includes(name)) {
                    store.createIndex('herdId', 'herdId', { unique: false });
                    store.createIndex('herdGroupId', 'herdGroupId', { unique: false });
                }
                if (name === 'auth_users') {
                    store.createIndex('email', 'email', { unique: true });
                }
                if (name === 'auth_devices') {
                    store.createIndex('userId', 'userId', { unique: false });
                }
                if (name === 'mfa_devices') {
                    store.createIndex('userId', 'userId', { unique: false });
                }
                if (name === 'security_audit_logs') {
                    store.createIndex('userId', 'userId', { unique: false });
                }
                if (name === 'campaigns') {
                    store.createIndex('status', 'status', { unique: false });
                }
                if (name === 'messages') {
                    store.createIndex('threadId', 'threadId', { unique: false });
                }
                if (name === 'notifications') {
                    store.createIndex('userId', 'userId', { unique: false });
                    store.createIndex('read', 'read', { unique: false });
                }
                if (name === 'notification_preferences') {
                    store.createIndex('userId', 'userId', { unique: true });
                }
                if (name === 'ai_recommendations') {
                    store.createIndex('userId', 'userId', { unique: false });
                    store.createIndex('isDismissed', 'isDismissed', { unique: false });
                }
                if (name === 'ai_feedback') {
                    store.createIndex('recommendationId', 'recommendationId', { unique: false });
                }
                if (name === 'subscriptions') {
                    store.createIndex('userId', 'userId', { unique: false });
                }
                if (name === 'trial_codes') {
                    store.createIndex('code', 'code', { unique: true });
                }
                if (name === 'subscription_logs') {
                    store.createIndex('userId', 'userId', { unique: false });
                }
                if (name === 'sync_queue') {
                    store.createIndex('status', 'status', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
                if (name === 'conflict_log') {
                    store.createIndex('resolved', 'resolved', { unique: false });
                }
                if (name === 'integration_logs') {
                    store.createIndex('integrationId', 'integrationId', { unique: false });
                }
                if (name === 'sensor_devices') {
                    store.createIndex('integrationId', 'integrationId', { unique: false });
                }
                if (name === 'sensor_readings') {
                    store.createIndex('sensorId', 'sensorId', { unique: false });
                }
                if (name === 'tree_logs' || name === 'tree_yields') {
                    store.createIndex('treeId', 'treeId', { unique: false });
                }
                if (name === 'hive_inspections' || name === 'hive_production') {
                    store.createIndex('hiveId', 'hiveId', { unique: false });
                }
                if (name === 'help_articles') {
                    store.createIndex('categoryId', 'categoryId', { unique: false });
                }
                if (name === 'plant_discussions') {
                    store.createIndex('plantName', 'plantName', { unique: false });
                }
            } else {
                // Indices for existing stores can be checked here if needed
                const store = request.transaction!.objectStore(name);
                if (name === 'sync_queue' && !store.indexNames.contains('status')) {
                    store.createIndex('status', 'status', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
                if (name === 'help_articles' && !store.indexNames.contains('categoryId')) {
                    store.createIndex('categoryId', 'categoryId', { unique: false });
                }
                if (name === 'plant_discussions' && !store.indexNames.contains('plantName')) {
                    store.createIndex('plantName', 'plantName', { unique: false });
                }
            }
        });
      };
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      if (!store.indexNames.contains(indexName)) {
          const request = store.getAll();
          request.onsuccess = () => {
              // Fallback filter
              const res = request.result.filter((item: any) => item[indexName] === value);
              resolve(res);
          };
          return;
      }

      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T | undefined> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        if (!store.indexNames.contains(indexName)) {
            // simplified fallback
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result.find((i:any) => i[indexName] === value));
            return;
        }
        const index = store.index(indexName);
        const request = index.get(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
  }

  /**
   * Transactional PUT that also writes to the sync_queue.
   * @param source If 'sync', skips writing to the queue (avoid loop).
   */
  async put<T extends { id: string }>(storeName: string, item: T, source?: 'sync'): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const stores = [storeName];
      if (source !== 'sync') stores.push('sync_queue');

      const transaction = db.transaction(stores, 'readwrite');
      
      // 1. Write Record
      const mainStore = transaction.objectStore(storeName);
      mainStore.put(item);

      // 2. Write Sync Log (if not from sync)
      if (source !== 'sync') {
          const queueStore = transaction.objectStore('sync_queue');
          const syncItem: SyncQueueItem = {
              id: crypto.randomUUID(),
              storeName,
              recordId: item.id,
              operation: 'update', // Treat put as update/upsert
              payload: item,
              timestamp: Date.now(),
              status: 'pending',
              retryCount: 0
          };
          queueStore.put(syncItem);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async delete(storeName: string, id: string, source?: 'sync'): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const stores = [storeName];
      if (source !== 'sync') stores.push('sync_queue');

      const transaction = db.transaction(stores, 'readwrite');
      
      const mainStore = transaction.objectStore(storeName);
      mainStore.delete(id);

      if (source !== 'sync') {
          const queueStore = transaction.objectStore('sync_queue');
          const syncItem: SyncQueueItem = {
              id: crypto.randomUUID(),
              storeName,
              recordId: id,
              operation: 'delete',
              payload: { id }, // Minimal payload for delete
              timestamp: Date.now(),
              status: 'pending',
              retryCount: 0
          };
          queueStore.put(syncItem);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const dbService = new DBService();
