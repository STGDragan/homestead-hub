

import { dbService } from './db';
import { PlantTemplate, PlantDiscussion, AnimalTemplate } from '../types';
import { COMMON_PLANTS, COMMON_ANIMALS } from '../constants';

export const libraryService = {
    
    /**
     * Initialize System Library (Admin Managed)
     * Seeds the `system_plants` store from the hardcoded constant if empty.
     */
    async initSystemPlants() {
        const existing = await dbService.getAll<PlantTemplate>('system_plants');
        if (existing.length === 0) {
            console.log("Seeding system plant library...");
            for (const plant of COMMON_PLANTS) {
                // Ensure IDs are consistent for seeding
                await dbService.put('system_plants', plant);
            }
        }
    },

    /**
     * Initialize System Animal Library
     */
    async initSystemAnimals() {
        const existing = await dbService.getAll<AnimalTemplate>('system_animals');
        if (existing.length === 0) {
            console.log("Seeding system animal library...");
            for (const animal of COMMON_ANIMALS) {
                await dbService.put('system_animals', animal);
            }
        }
    },

    /**
     * Get ALL plants (System + User Custom)
     */
    async getAllPlants(): Promise<PlantTemplate[]> {
        const system = await dbService.getAll<PlantTemplate>('system_plants');
        const custom = await dbService.getAll<PlantTemplate>('custom_plants');
        
        // If system is empty (first load before seed completes), fallback to constant
        const base = system.length > 0 ? system : COMMON_PLANTS;
        
        return [...base, ...custom];
    },

    async getPlant(id: string): Promise<PlantTemplate | undefined> {
        // 1. Check Custom
        const custom = await dbService.get<PlantTemplate>('custom_plants', id);
        if (custom) return custom;
        
        // 2. Check System Store
        const system = await dbService.get<PlantTemplate>('system_plants', id);
        if (system) return system;

        // 3. Fallback Constant (for safety)
        return COMMON_PLANTS.find(p => p.id === id);
    },

    /**
     * Save a user-custom plant
     */
    async savePlant(plant: PlantTemplate): Promise<PlantTemplate> {
        // If it's a common/system plant (not custom), we must clone it to custom_plants
        if (!plant.id.startsWith('custom_')) { 
             const newPlant = {
                 ...plant,
                 id: `custom_${crypto.randomUUID()}`
             };
             await dbService.put('custom_plants', newPlant as any);
             return newPlant;
        } else {
            // Update existing custom plant
            await dbService.put('custom_plants', plant as any);
            return plant;
        }
    },

    // --- Animal Methods ---

    async getSystemAnimals(): Promise<AnimalTemplate[]> {
        const system = await dbService.getAll<AnimalTemplate>('system_animals');
        return system.length > 0 ? system : COMMON_ANIMALS;
    },

    async saveSystemAnimal(animal: AnimalTemplate): Promise<void> {
        await dbService.put('system_animals', animal);
    },

    async deleteSystemAnimal(id: string): Promise<void> {
        await dbService.delete('system_animals', id);
    },

    // --- Admin Functions (Plants) ---

    /**
     * Get only System plants (for Admin Console)
     */
    async getSystemPlants(): Promise<PlantTemplate[]> {
        return await dbService.getAll<PlantTemplate>('system_plants');
    },

    /**
     * Save/Update a System plant (Admin only)
     */
    async saveSystemPlant(plant: PlantTemplate): Promise<void> {
        await dbService.put('system_plants', plant);
    },

    async deleteSystemPlant(id: string): Promise<void> {
        await dbService.delete('system_plants', id);
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
