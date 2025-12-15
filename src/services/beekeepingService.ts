
import { dbService } from './db';
import { Hive, HiveInspection, HiveProduction, UserProfile } from '../types';
import { beekeepingAI } from './beekeepingAI';

export const beekeepingService = {
    async getHives(): Promise<Hive[]> {
        return await dbService.getAll<Hive>('hives');
    },

    async getHive(id: string): Promise<Hive | undefined> {
        return await dbService.get<Hive>('hives', id);
    },

    async addHive(hive: Hive): Promise<void> {
        await dbService.put('hives', hive);
        
        // Initial Task
        const profile = await dbService.get<UserProfile>('user_profile', 'main_user');
        if (profile) {
            const schedule = beekeepingAI.getInspectionSchedule(undefined);
            await dbService.put('tasks', {
                id: crypto.randomUUID(),
                title: `Inspect Hive: ${hive.name}`,
                description: `First inspection for new hive. ${schedule.reason}`,
                category: 'apiary',
                season: 'spring',
                dueDate: schedule.date,
                priority: 'medium',
                completed: false,
                isRecurring: false,
                recurrencePattern: 'none',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            });
        }
    },

    async updateHive(hive: Hive): Promise<void> {
        await dbService.put('hives', { ...hive, updatedAt: Date.now(), syncStatus: 'pending' });
    },

    async getInspections(hiveId: string): Promise<HiveInspection[]> {
        const logs = await dbService.getAllByIndex<HiveInspection>('hive_inspections', 'hiveId', hiveId);
        return logs.sort((a, b) => b.date - a.date);
    },

    async addInspection(log: HiveInspection): Promise<void> {
        await dbService.put('hive_inspections', log);
        
        // Schedule next inspection task
        const schedule = beekeepingAI.getInspectionSchedule(log);
        const hive = await this.getHive(log.hiveId);
        
        if (hive) {
            await dbService.put('tasks', {
                id: crypto.randomUUID(),
                title: `Inspect Hive: ${hive.name}`,
                description: schedule.reason,
                category: 'apiary',
                season: 'spring',
                dueDate: schedule.date,
                priority: log.miteCount && log.miteCount > 3 ? 'high' : 'medium',
                completed: false,
                isRecurring: false,
                recurrencePattern: 'none',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            });
        }
    },

    async getProduction(hiveId: string): Promise<HiveProduction[]> {
        const logs = await dbService.getAllByIndex<HiveProduction>('hive_production', 'hiveId', hiveId);
        return logs.sort((a, b) => b.date - a.date);
    },

    async addProduction(prod: HiveProduction): Promise<void> {
        await dbService.put('hive_production', prod);
    },

    async getApiaryStats(): Promise<{ totalHives: number, honeyYTD: number }> {
        const hives = await this.getHives();
        const active = hives.filter(h => h.status === 'active');
        const prod = await dbService.getAll<HiveProduction>('hive_production');
        
        const honey = prod
            .filter(p => p.product === 'honey' && new Date(p.date).getFullYear() === new Date().getFullYear())
            .reduce((sum, p) => sum + p.quantity, 0);

        return {
            totalHives: active.length,
            honeyYTD: parseFloat(honey.toFixed(1))
        };
    }
};
