
import { dbService } from './db';
import { OrchardTree, TreeLog, TreeYield, UserProfile } from '../types';
import { orchardAI } from './orchardAI';

export const orchardService = {
    
    async getTrees(): Promise<OrchardTree[]> {
        return await dbService.getAll<OrchardTree>('orchard_trees');
    },

    async getTree(id: string): Promise<OrchardTree | undefined> {
        return await dbService.get<OrchardTree>('orchard_trees', id);
    },

    async addTree(tree: OrchardTree): Promise<void> {
        await dbService.put('orchard_trees', tree);
        
        // Trigger AI Task Generation
        const profile = await dbService.get<UserProfile>('user_profile', 'main_user');
        if (profile) {
            const tasks = orchardAI.generateSeasonalTasks(tree, profile);
            for (const t of tasks) {
                await dbService.put('tasks', t);
            }
        }
    },

    async updateTree(tree: OrchardTree): Promise<void> {
        await dbService.put('orchard_trees', { ...tree, updatedAt: Date.now(), syncStatus: 'pending' });
    },

    async deleteTree(id: string): Promise<void> {
        await dbService.delete('orchard_trees', id);
    },

    // --- Logs ---

    async getLogs(treeId: string): Promise<TreeLog[]> {
        const logs = await dbService.getAllByIndex<TreeLog>('tree_logs', 'treeId', treeId);
        return logs.sort((a, b) => b.date - a.date);
    },

    async addLog(log: TreeLog): Promise<void> {
        await dbService.put('tree_logs', log);
    },

    // --- Yields ---

    async getYields(treeId: string): Promise<TreeYield[]> {
        const yields = await dbService.getAllByIndex<TreeYield>('tree_yields', 'treeId', treeId);
        return yields.sort((a, b) => b.harvestDate - a.harvestDate);
    },

    async addYield(y: TreeYield): Promise<void> {
        await dbService.put('tree_yields', y);
    },

    async getOrchardStats(): Promise<{ totalTrees: number, yieldYTD: number }> {
        const trees = await this.getTrees();
        const activeTrees = trees.filter(t => t.status !== 'dead' && t.status !== 'removed');
        
        const allYields = await dbService.getAll<TreeYield>('tree_yields');
        const currentYear = new Date().getFullYear();
        
        // Sum weights for current year (simple sum, ignores mixed units for MVP)
        const yieldYTD = allYields
            .filter(y => new Date(y.harvestDate).getFullYear() === currentYear)
            .reduce((sum, y) => sum + y.weight, 0);

        return {
            totalTrees: activeTrees.length,
            yieldYTD: parseFloat(yieldYTD.toFixed(1))
        };
    }
};
