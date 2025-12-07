
import { dbService } from './db';
import { PlantTemplate, PlantDiscussion } from '../types';
import { COMMON_PLANTS } from '../constants';

export const libraryService = {
    
    async getAllPlants(): Promise<PlantTemplate[]> {
        const custom = await dbService.getAll<PlantTemplate>('custom_plants');
        // Merge. Custom overrides Common if names match (simplified by using unique IDs in real logic, but here we just list all)
        // Actually, custom plants usually have different IDs (custom_...), so we just concat.
        return [...custom, ...COMMON_PLANTS];
    },

    async getPlant(id: string): Promise<PlantTemplate | undefined> {
        // Check Custom
        const custom = await dbService.get<PlantTemplate>('custom_plants', id);
        if (custom) return custom;
        // Check Common
        return COMMON_PLANTS.find(p => p.id === id);
    },

    /**
     * If editing a common plant, we clone it to custom_plants and return that.
     */
    async savePlant(plant: PlantTemplate): Promise<PlantTemplate> {
        // If it's a common plant (short ID), clone it to a new custom ID
        if (!plant.id.startsWith('custom_') && !plant.id.startsWith('uuid_')) { // Assuming common IDs are like 'p1', 'p2'
             const newPlant = {
                 ...plant,
                 id: `custom_${crypto.randomUUID()}`
             };
             await dbService.put('custom_plants', newPlant as any);
             return newPlant;
        } else {
            // Already custom, just update
            await dbService.put('custom_plants', plant as any);
            return plant;
        }
    },

    // --- Discussions ---

    async getDiscussions(plantName: string): Promise<PlantDiscussion[]> {
        const all = await dbService.getAllByIndex<PlantDiscussion>('plant_discussions', 'plantName', plantName);
        return all.sort((a, b) => b.createdAt - a.createdAt);
    },

    async addDiscussion(plantName: string, content: string, userId: string): Promise<void> {
        const post: PlantDiscussion = {
            id: crypto.randomUUID(),
            plantName,
            userId,
            userName: 'Me', // In real app, fetch from profile
            content,
            likes: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        await dbService.put('plant_discussions', post);
    }
};
