
import { dbService } from './db';
import { SyncQueueItem, ConflictLog, SyncStatusMeta } from '../types';

/**
 * SyncEngine
 * Handles offline queue processing, remote delta pulling, and conflict detection.
 */
export const syncEngine = {

    // --- Mock Remote Storage (Simulates Server) ---
    getRemoteStorage(): Record<string, any[]> {
        try {
            const stored = localStorage.getItem('mock_remote_db');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error("Failed to parse mock remote DB, resetting.", e);
            localStorage.removeItem('mock_remote_db');
            return {};
        }
    },

    saveRemoteStorage(data: Record<string, any[]>) {
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

        const remoteDB = this.getRemoteStorage();

        for (const item of pending) {
            try {
                // Simulate Remote Write
                if (!remoteDB[item.storeName]) remoteDB[item.storeName] = [];
                const collection = remoteDB[item.storeName];

                if (item.operation === 'delete') {
                    const idx = collection.findIndex((r: any) => r.id === item.recordId);
                    if (idx !== -1) collection.splice(idx, 1);
                } else {
                    // Create or Update
                    const idx = collection.findIndex((r: any) => r.id === item.recordId);
                    if (idx !== -1) {
                        // Conflict Check could happen here on real server
                        collection[idx] = { ...item.payload, syncStatus: 'synced', updatedAt: Date.now() };
                    } else {
                        collection.push({ ...item.payload, syncStatus: 'synced', updatedAt: Date.now() });
                    }
                }

                // Update Local Queue Status
                item.status = 'processing'; // Transient state
                // Note: In real app, we delete from queue only after confirmed success. 
                // For this demo, we delete to keep queue clean.
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
            } catch (e) {
                console.error("Sync error", e);
                item.status = 'failed';
                item.retryCount++;
                item.error = String(e);
                await dbService.put('sync_queue', item, 'sync');
                errors++;
            }
        }

        this.saveRemoteStorage(remoteDB);
        return { processed, errors };
    },

    /**
     * Pull changes from "remote" and merge to local.
     */
    async pullChanges(): Promise<{ pulled: number, conflicts: number }> {
        if (!navigator.onLine) return { pulled: 0, conflicts: 0 };

        const remoteDB = this.getRemoteStorage();
        let pulled = 0;
        let conflicts = 0;

        for (const storeName of Object.keys(remoteDB)) {
            const remoteRecords = remoteDB[storeName];
            
            for (const remoteRecord of remoteRecords) {
                const localRecord = await dbService.get<any>(storeName, remoteRecord.id);

                // 1. New Record
                if (!localRecord) {
                    await dbService.put(storeName, remoteRecord, 'sync');
                    pulled++;
                    continue;
                }

                // 2. Existing Record - Check versions
                if (remoteRecord.updatedAt > localRecord.updatedAt) {
                    // Check if local has pending changes (Conflict)
                    if (localRecord.syncStatus === 'pending') {
                        // CONFLICT DETECTED
                        await this.logConflict(storeName, localRecord, remoteRecord);
                        conflicts++;
                    } else {
                        // Safe to overwrite (Remote is newer and local is clean)
                        await dbService.put(storeName, remoteRecord, 'sync');
                        pulled++;
                    }
                }
            }
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

    /**
     * Force a full sync cycle.
     */
    async runSyncCycle() {
        console.log("Starting Sync Cycle...");
        const pushResult = await this.pushChanges();
        const pullResult = await this.pullChanges();
        console.log("Sync Complete:", { pushResult, pullResult });
        return { ...pushResult, ...pullResult };
    },

    /**
     * Helper to simulate a remote change for demo purposes.
     */
    async simulateRemoteUpdate(storeName: string, recordId: string, newData: any) {
        const remoteDB = this.getRemoteStorage();
        if (!remoteDB[storeName]) remoteDB[storeName] = [];
        
        const idx = remoteDB[storeName].findIndex((r: any) => r.id === recordId);
        const updated = { ...newData, id: recordId, updatedAt: Date.now() + 10000, syncStatus: 'synced' }; // Future timestamp to force update
        
        if (idx >= 0) remoteDB[storeName][idx] = updated;
        else remoteDB[storeName].push(updated);
        
        this.saveRemoteStorage(remoteDB);
        console.log("Simulated remote update for", recordId);
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
            // Remove any pending queue items for this record to stop overwrite
            const queue = await dbService.getAllByIndex<SyncQueueItem>('sync_queue', 'status', 'pending');
            const item = queue.find(q => q.recordId === conflict.recordId);
            if (item) await dbService.delete('sync_queue', item.id, 'sync');
        } else {
            // Local wins - effectively touch the local record to resync it later
            const local = await dbService.get<any>(conflict.storeName, conflict.recordId);
            if (local) {
                local.updatedAt = Date.now();
                await dbService.put(conflict.storeName, local); // Trigger queue add
            }
        }

        conflict.resolved = true;
        conflict.resolvedAt = Date.now();
        conflict.resolution = resolution;
        await dbService.put('conflict_log', conflict, 'sync');
    }
};
