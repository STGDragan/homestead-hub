
import { dbService } from './db';
import { SyncQueueItem, ConflictLog } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * SyncEngine
 * Handles offline queue processing, remote delta pulling, and conflict detection.
 * Supports both Mock Mode (LocalStorage) and Real Cloud (Supabase).
 */
export const syncEngine = {

    // --- Mock Remote Storage (Simulates Server) ---
    getMockRemoteStorage(): Record<string, any[]> {
        try {
            const stored = localStorage.getItem('mock_remote_db');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error("Failed to parse mock remote DB, resetting.", e);
            localStorage.removeItem('mock_remote_db');
            return {};
        }
    },

    saveMockRemoteStorage(data: Record<string, any[]>) {
        try {
            localStorage.setItem('mock_remote_db', JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save remote storage", e);
        }
    },

    /**
     * Push pending local changes to "remote".
     */
    async pushChanges(): Promise<{ processed: number, errors: number }> {
        if (!navigator.onLine) return { processed: 0, errors: 0 };

        const pending = await dbService.getAllByIndex<SyncQueueItem>('sync_queue', 'status', 'pending');
        // Sort by timestamp to maintain order
        pending.sort((a, b) => a.timestamp - b.timestamp);

        let processed = 0;
        let errors = 0;

        // Load mock DB if needed
        const mockDB = !isSupabaseConfigured ? this.getMockRemoteStorage() : null;

        for (const item of pending) {
            try {
                if (isSupabaseConfigured) {
                    // --- REAL SUPABASE SYNC ---
                    // We use a generic 'app_data' table to store all collections
                    
                    const { error } = await supabase
                        .from('app_data')
                        .upsert({
                            collection: item.storeName,
                            id: item.recordId,
                            data: item.payload,
                            updated_at: Date.now(),
                            deleted: item.operation === 'delete',
                            // user_id is handled by RLS defaults usually, or auth context
                        }, { onConflict: 'collection,id' });

                    if (error) throw error;

                } else {
                    // --- MOCK SYNC ---
                    if (!mockDB) throw new Error("Mock DB init failed");
                    
                    if (!mockDB[item.storeName]) mockDB[item.storeName] = [];
                    const collection = mockDB[item.storeName];

                    if (item.operation === 'delete') {
                        const idx = collection.findIndex((r: any) => r.id === item.recordId);
                        if (idx !== -1) collection.splice(idx, 1);
                    } else {
                        // Create or Update
                        const idx = collection.findIndex((r: any) => r.id === item.recordId);
                        if (idx !== -1) {
                            collection[idx] = { ...item.payload, syncStatus: 'synced', updatedAt: Date.now() };
                        } else {
                            collection.push({ ...item.payload, syncStatus: 'synced', updatedAt: Date.now() });
                        }
                    }
                }

                // Update Local Queue Status
                await dbService.delete('sync_queue', item.id, 'sync'); 
                
                // Update Local Entity syncStatus to 'synced'
                if (item.operation !== 'delete') {
                    const localEntity = await dbService.get<any>(item.storeName, item.recordId);
                    if (localEntity) {
                        localEntity.syncStatus = 'synced';
                        await dbService.put(item.storeName, localEntity, 'sync');
                    }
                }

                processed++;
            } catch (e: any) {
                console.error("Sync error", e.message);
                item.status = 'failed';
                item.retryCount++;
                item.error = String(e.message || e);
                await dbService.put('sync_queue', item, 'sync');
                errors++;
            }
        }

        if (mockDB) this.saveMockRemoteStorage(mockDB);
        
        return { processed, errors };
    },

    /**
     * Pull changes from "remote" and merge to local.
     */
    async pullChanges(): Promise<{ pulled: number, conflicts: number }> {
        if (!navigator.onLine) return { pulled: 0, conflicts: 0 };

        let pulled = 0;
        let conflicts = 0;

        try {
            if (isSupabaseConfigured) {
                // --- REAL SUPABASE PULL ---
                const lastSync = parseInt(localStorage.getItem('homestead_last_pull') || '0');
                
                // Fetch all changed records since last sync
                const { data, error } = await supabase
                    .from('app_data')
                    .select('*')
                    .gt('updated_at', lastSync);

                if (error) {
                    console.warn("Pull failed (Supabase Error):", error.message);
                    return { pulled: 0, conflicts: 0 };
                }

                if (data) {
                    for (const row of data) {
                        const storeName = row.collection;
                        const remoteRecord = row.data;
                        const isDeleted = row.deleted;

                        // If deleted remotely
                        if (isDeleted) {
                            await dbService.delete(storeName, row.id, 'sync');
                            pulled++;
                            continue;
                        }

                        // Upsert local
                        const localRecord = await dbService.get<any>(storeName, row.id);
                        
                        if (!localRecord) {
                            await dbService.put(storeName, remoteRecord, 'sync');
                            pulled++;
                            continue;
                        }

                        // Conflict check
                        if (remoteRecord.updatedAt > localRecord.updatedAt) {
                            if (localRecord.syncStatus === 'pending') {
                                await this.logConflict(storeName, localRecord, remoteRecord);
                                conflicts++;
                            } else {
                                await dbService.put(storeName, remoteRecord, 'sync');
                                pulled++;
                            }
                        }
                    }
                    
                    // Update pointer
                    localStorage.setItem('homestead_last_pull', Date.now().toString());
                }

            } else {
                // --- MOCK PULL ---
                const remoteDB = this.getMockRemoteStorage();
                for (const storeName of Object.keys(remoteDB)) {
                    const remoteRecords = remoteDB[storeName];
                    for (const remoteRecord of remoteRecords) {
                        const localRecord = await dbService.get<any>(storeName, remoteRecord.id);

                        if (!localRecord) {
                            await dbService.put(storeName, remoteRecord, 'sync');
                            pulled++;
                            continue;
                        }

                        if (remoteRecord.updatedAt > localRecord.updatedAt) {
                            if (localRecord.syncStatus === 'pending') {
                                await this.logConflict(storeName, localRecord, remoteRecord);
                                conflicts++;
                            } else {
                                await dbService.put(storeName, remoteRecord, 'sync');
                                pulled++;
                            }
                        }
                    }
                }
            }
        } catch (e: any) {
            console.error("Pull Sync Exception:", e);
            // Swallow error to prevent app crash
        }
        
        return { pulled, conflicts };
    },

    async logConflict(storeName: string, local: any, remote: any) {
        const conflict: ConflictLog = {
            id: crypto.randomUUID(),
            storeName,
            recordId: local.id,
            localVersion: local,
            remoteVersion: remote,
            detectedAt: Date.now(),
            resolved: false
        };
        await dbService.put('conflict_log', conflict, 'sync');
    },

    async runSyncCycle() {
        console.log("Starting Sync Cycle...");
        try {
            const pushResult = await this.pushChanges();
            const pullResult = await this.pullChanges();
            console.log("Sync Complete:", { pushResult, pullResult });
            return { ...pushResult, ...pullResult };
        } catch(e) {
            console.error("Sync Cycle Failed:", e);
            return { processed: 0, errors: 1, pulled: 0, conflicts: 0 };
        }
    },

    async simulateRemoteUpdate(storeName: string, recordId: string, newData: any) {
        if (!isSupabaseConfigured) {
            const remoteDB = this.getMockRemoteStorage();
            if (!remoteDB[storeName]) remoteDB[storeName] = [];
            
            const idx = remoteDB[storeName].findIndex((r: any) => r.id === recordId);
            const updated = { ...newData, id: recordId, updatedAt: Date.now() + 10000, syncStatus: 'synced' }; 
            
            if (idx >= 0) remoteDB[storeName][idx] = updated;
            else remoteDB[storeName].push(updated);
            
            this.saveMockRemoteStorage(remoteDB);
            console.log("Simulated mock remote update");
        }
    },

    async getQueueStats(): Promise<{ pending: number, failed: number }> {
        const all = await dbService.getAll<SyncQueueItem>('sync_queue');
        return {
            pending: all.filter(i => i.status === 'pending').length,
            failed: all.filter(i => i.status === 'failed').length
        };
    },

    async resolveConflict(conflictId: string, resolution: 'local_wins' | 'remote_wins') {
        const conflict = await dbService.get<ConflictLog>('conflict_log', conflictId);
        if (!conflict) return;

        if (resolution === 'remote_wins') {
            await dbService.put(conflict.storeName, conflict.remoteVersion, 'sync');
            const queue = await dbService.getAllByIndex<SyncQueueItem>('sync_queue', 'status', 'pending');
            const item = queue.find(q => q.recordId === conflict.recordId);
            if (item) await dbService.delete('sync_queue', item.id, 'sync');
        } else {
            const local = await dbService.get<any>(conflict.storeName, conflict.recordId);
            if (local) {
                local.updatedAt = Date.now();
                await dbService.put(conflict.storeName, local);
            }
        }

        conflict.resolved = true;
        conflict.resolvedAt = Date.now();
        conflict.resolution = resolution;
        await dbService.put('conflict_log', conflict, 'sync');
    }
};
