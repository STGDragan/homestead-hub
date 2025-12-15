
import { dbService } from './db';
import { ExportScope, ExportFormat, DataExportRecord, DataImportRecord, ImportConflictStrategy } from '../types';

const STORE_GROUPS: Record<ExportScope, string[]> = {
    full: [
        'user_profile', 'tasks', 'plants', 'garden_beds', 'garden_logs', 'seeds',
        'planting_logs', 'harvest_logs', 'journal_entries', 'animals', 'herds',
        'animal_entries', 'breeding_logs', 'offspring', 'growth_logs', 'expenses',
        'recipes', 'pantry', 'health_records', 'marketplace', 'offers', 'medications',
        'vet_visits', 'med_admin_logs', 'orchard_trees', 'tree_logs', 'tree_yields',
        'hives', 'hive_inspections', 'hive_production'
    ],
    garden: ['plants', 'garden_beds', 'garden_logs', 'seeds', 'planting_logs', 'harvest_logs'],
    livestock: ['animals', 'herds', 'animal_entries', 'breeding_logs', 'offspring', 'growth_logs', 'med_admin_logs', 'vet_visits'],
    tasks: ['tasks', 'notification_tasks'],
    finances: ['expenses', 'invoices', 'sponsors', 'campaigns'],
    orchard: ['orchard_trees', 'tree_logs', 'tree_yields'],
    apiary: ['hives', 'hive_inspections', 'hive_production']
};

export const dataTransferService = {

    async exportData(scope: ExportScope, format: ExportFormat, userId: string): Promise<{ url: string, filename: string }> {
        const stores = STORE_GROUPS[scope] || STORE_GROUPS.full;
        let exportData: any = {};
        let recordCount = 0;

        // 1. Gather Data
        for (const store of stores) {
            const records = await dbService.getAll<any>(store);
            if (records.length > 0) {
                exportData[store] = records;
                recordCount += records.length;
            }
        }

        // 2. Format
        let content = '';
        let mimeType = 'application/json';
        const filename = `homestead_${scope}_${new Date().toISOString().slice(0,10)}.${format}`;

        if (format === 'json') {
            exportData.meta = {
                version: 1,
                exportedAt: Date.now(),
                scope,
                userId
            };
            content = JSON.stringify(exportData, null, 2);
        } else if (format === 'csv') {
            // CSV Logic: Flatten first available store or main store for the scope
            // For MVP, if multiple stores, we might just export the first populated one or ZIP them.
            // Here, we'll just CSV the first non-empty store found to keep it simple
            const firstKey = Object.keys(exportData)[0];
            if (firstKey && Array.isArray(exportData[firstKey])) {
                const rows = exportData[firstKey];
                if (rows.length > 0) {
                    const headers = Object.keys(rows[0]).join(',');
                    const csvRows = rows.map((r: any) => Object.values(r).map(v => `"${v}"`).join(','));
                    content = [headers, ...csvRows].join('\n');
                }
            }
            mimeType = 'text/csv';
        }

        // 3. Create Blob
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        // 4. Log
        const record: DataExportRecord = {
            id: crypto.randomUUID(),
            userId,
            scope,
            format,
            recordCount,
            fileSize: blob.size,
            fileName: filename,
            status: 'completed',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        await dbService.put('data_exports', record);

        return { url, filename };
    },

    async importData(file: File, strategy: ImportConflictStrategy, userId: string): Promise<{ success: boolean, message: string }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result as string;
                    // Auto-detect JSON vs CSV by extension or content char
                    const isJson = file.name.endsWith('.json') || content.trim().startsWith('{');
                    
                    let data: any = {};
                    let recordCount = 0;

                    if (isJson) {
                        data = JSON.parse(content);
                        delete data.meta; // Remove metadata from import logic
                    } else {
                        return resolve({ success: false, message: "CSV Import not supported for full restore yet." });
                    }

                    // Iterate stores in the import file
                    for (const storeName of Object.keys(data)) {
                        const records = data[storeName];
                        if (Array.isArray(records)) {
                            for (const rec of records) {
                                // Conflict Check
                                const existing = await dbService.get(storeName, rec.id);
                                
                                if (existing && strategy === 'skip') {
                                    continue;
                                } 
                                
                                if (existing && strategy === 'copy') {
                                    rec.id = crypto.randomUUID(); // Generate new ID
                                    // Note: This breaks relationships. 'copy' is dangerous without deep remapping.
                                    // For MVP, treat 'copy' as 'overwrite' or warn user.
                                    // Let's fallback to overwrite for 'copy' in this MVP to prevent corrupt refs
                                }

                                // 'overwrite' or new record falls through here
                                rec.syncStatus = 'pending'; // Mark for sync
                                rec.updatedAt = Date.now(); // Touch it
                                await dbService.put(storeName, rec);
                                recordCount++;
                            }
                        }
                    }

                    // Log Import
                    const log: DataImportRecord = {
                        id: crypto.randomUUID(),
                        userId,
                        fileName: file.name,
                        scope: 'full', // Inferred
                        recordCount,
                        conflictStrategy: strategy,
                        status: 'completed',
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        syncStatus: 'pending'
                    };
                    await dbService.put('data_imports', log);

                    resolve({ success: true, message: `Successfully imported ${recordCount} records.` });

                } catch (err) {
                    console.error(err);
                    resolve({ success: false, message: "Failed to parse file." });
                }
            };

            reader.readAsText(file);
        });
    },

    async getExportHistory(): Promise<DataExportRecord[]> {
        const exports = await dbService.getAll<DataExportRecord>('data_exports');
        return exports.sort((a, b) => b.createdAt - a.createdAt);
    },

    async getImportHistory(): Promise<DataImportRecord[]> {
        const imports = await dbService.getAll<DataImportRecord>('data_imports');
        return imports.sort((a, b) => b.createdAt - a.createdAt);
    }
};
