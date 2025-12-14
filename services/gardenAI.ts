
// services/gardenAI.ts
import { PlantTemplate, UserProfile, GardenBed, Plant, Task, Season } from '../types';
import { COMMON_PLANTS, BENEFICIAL_PLANTS } from '../constants';

/**
 * GardenAIService
 * 
 * Provides offline-first recommendations based on user profile, zone, and experience.
 * Uses heuristic matching since we cannot rely on external APIs in offline mode.
 */

export interface RecommendationReason {
    type: 'zone' | 'experience' | 'goal' | 'companion' | 'season';
    message: string;
}

export interface ScoredPlant extends PlantTemplate {
    score: number;
    reasons: RecommendationReason[];
}

export interface AutoFillOptions {
    includePollinators?: boolean;
    includeCompanions?: boolean;
}

export const gardenAIService = {

    /**
     * Get estimated Last Frost Date for a given zone.
     * Uses simplified average dates for the Northern Hemisphere.
     * Returns a Date object for the current calendar year.
     */
    getFrostDate(zone: string): Date {
        const year = new Date().getFullYear();
        const zoneNum = parseInt(zone.replace(/[^0-9]/g, '')) || 6;
        
        let month = 3; // April (0-indexed)
        let day = 20;

        // Simplified lookup map
        const zoneDates: Record<number, {m: number, d: number}> = {
            1: {m: 5, d: 15}, // June 15
            2: {m: 4, d: 20}, // May 20
            3: {m: 4, d: 15}, // May 15
            4: {m: 4, d: 1},  // May 1
            5: {m: 3, d: 20}, // Apr 20
            6: {m: 3, d: 10}, // Apr 10
            7: {m: 2, d: 30}, // Mar 30
            8: {m: 2, d: 15}, // Mar 15
            9: {m: 1, d: 20}, // Feb 20
            10: {m: 0, d: 30}, // Jan 30
            11: {m: 0, d: 1},  // Jan 1
        };

        if (zoneDates[zoneNum]) {
            month = zoneDates[zoneNum].m;
            day = zoneDates[zoneNum].d;
        }

        return new Date(year, month, day);
    },

    /**
     * Calculate planting window based on frost date and plant constraints.
     * Automatically adjusts year if the window has passed.
     */
    getPlantingSchedule(plant: PlantTemplate, zone: string): { startDate: Date, method: string, advice: string } {
        const today = new Date();
        const currentYear = today.getFullYear();
        const frostDate = this.getFrostDate(zone); // Default to this year
        const offsetWeeks = plant.weeksRelativeToFrost || 0;
        
        // Calculate initial start date for THIS year
        let startDate = new Date(frostDate);
        startDate.setDate(frostDate.getDate() + (offsetWeeks * 7));

        const method = plant.plantingMethod || 'direct';
        const effectiveMethod = method === 'both' ? 'transplant' : method;

        // Determine "Action Date" (earliest action required)
        // If transplanting, action starts ~6 weeks before the outdoor start date
        // If direct sowing, action is the start date itself
        let actionDate = new Date(startDate);
        if (effectiveMethod === 'transplant') {
            actionDate.setDate(actionDate.getDate() - 42); // 6 weeks prior
        }

        // Logic: If the action date is in the past (with 30 day grace period), push to NEXT year
        // Example: It's Dec 2024. Tomato action date was Mar 2024. We want Mar 2025.
        // Grace period allows users to catch up if they are just a few weeks late.
        if (actionDate.getTime() < (today.getTime() - (30 * 24 * 60 * 60 * 1000))) {
            startDate.setFullYear(currentYear + 1);
        }

        let advice = '';
        const dateStr = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

        if (method === 'transplant') {
            if (offsetWeeks < 0) {
                advice = `Transplant out around ${dateStr}. Start seeds indoors 6-8 weeks prior.`;
            } else {
                advice = `Transplant outside around ${dateStr} (after frost).`;
            }
        } else if (method === 'both') {
             advice = `Direct sow or transplant around ${dateStr}.`;
        } else {
            // Direct sow
            if (offsetWeeks < 0) {
                advice = `Direct sow around ${dateStr} (cool tolerant).`;
            } else {
                advice = `Direct sow around ${dateStr} (warm soil needed).`;
            }
        }

        return { startDate, method, advice };
    },

    getSeasonFromDate(date: Date): Season {
        const month = date.getMonth(); // 0-11
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    },

    /**
     * Generate a list of suggested tasks for a newly added plant.
     * Dates are automatically adjusted for the next viable season.
     */
    generateSuggestedTasks(plant: Plant, template: PlantTemplate, profile: UserProfile): Task[] {
        const tasks: Task[] = [];
        
        // This gets the correct year's schedule (current or next)
        const { startDate: anchorDate, method } = this.getPlantingSchedule(template, profile.hardinessZone);
        
        const varietyStr = template.defaultVariety ? `(${template.defaultVariety})` : '';
        const effectiveMethod = method === 'both' ? 'transplant' : method;
        const depth = template.plantingDepth || 'standard depth';
        const spacing = template.spacing;

        if (effectiveMethod === 'transplant') {
            // 1. Start Seeds (6 weeks before anchor date)
            const seedDate = new Date(anchorDate);
            seedDate.setDate(seedDate.getDate() - 42); // -6 weeks
            
            tasks.push({
                id: crypto.randomUUID(),
                title: `Start Seeds: ${template.name}`,
                description: `Start ${template.name} ${varietyStr} seeds indoors. Plant ${depth}. Maintain moisture and warmth.`,
                season: this.getSeasonFromDate(seedDate),
                category: 'garden',
                dueDate: seedDate.getTime(),
                completed: false,
                priority: 'high',
                isRecurring: false,
                recurrencePattern: 'none',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            });

            // 2. Harden Off (1 week before anchor)
            const hardenDate = new Date(anchorDate);
            hardenDate.setDate(hardenDate.getDate() - 7);
            
            tasks.push({
                id: crypto.randomUUID(),
                title: `Harden Off: ${template.name}`,
                description: `Begin hardening off ${template.name} seedlings. Move outdoors for increasing hours over 7 days to acclimate to sun and wind.`,
                season: this.getSeasonFromDate(hardenDate),
                category: 'garden',
                dueDate: hardenDate.getTime(),
                completed: false,
                priority: 'medium',
                isRecurring: false,
                recurrencePattern: 'none',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            });

            // 3. Transplant (Anchor Date)
            tasks.push({
                id: crypto.randomUUID(),
                title: `Transplant: ${template.name}`,
                description: `Transplant ${template.name} ${varietyStr} into the garden. Space plants ${spacing} inches apart. Water deeply immediately after planting to settle roots.`,
                season: this.getSeasonFromDate(anchorDate),
                category: 'garden',
                dueDate: anchorDate.getTime(),
                completed: false,
                priority: 'high',
                isRecurring: false,
                recurrencePattern: 'none',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            });

        } else {
            // Direct Sow
            tasks.push({
                id: crypto.randomUUID(),
                title: `Sow Seeds: ${template.name}`,
                description: `Direct sow ${template.name} ${varietyStr} in the garden. Plant seeds ${depth}. Thin to ${spacing} inches apart once seedlings are established.`,
                season: this.getSeasonFromDate(anchorDate),
                category: 'garden',
                dueDate: anchorDate.getTime(),
                completed: false,
                priority: 'high',
                isRecurring: false,
                recurrencePattern: 'none',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            });
        }

        // FERTILIZER TASKS
        if (template.fertilizerType && template.fertilizerFrequencyWeeks && template.fertilizerFrequencyWeeks > 0) {
            const harvestDays = template.daysToMaturity;
            const freqDays = template.fertilizerFrequencyWeeks * 7;
            // Start 2 weeks after planting
            let currentOffset = 14; 
            
            while (currentOffset < harvestDays) {
                const fertDate = new Date(anchorDate);
                fertDate.setDate(fertDate.getDate() + currentOffset);
                
                tasks.push({
                    id: crypto.randomUUID(),
                    title: `Fertilize: ${template.name}`,
                    description: `Apply fertilizer: ${template.fertilizerType}. Ensure soil is moist before application to avoid root burn. (${currentOffset} days since planting)`,
                    season: this.getSeasonFromDate(fertDate),
                    category: 'garden',
                    dueDate: fertDate.getTime(),
                    completed: false,
                    priority: 'medium',
                    isRecurring: false,
                    recurrencePattern: 'none',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    syncStatus: 'pending'
                });
                
                currentOffset += freqDays;
            }
        }

        // Harvest Task
        const harvestDate = new Date(anchorDate);
        harvestDate.setDate(harvestDate.getDate() + template.daysToMaturity);
        
        tasks.push({
            id: crypto.randomUUID(),
            title: `Harvest: ${template.name}`,
            description: `Expected harvest window for ${template.name}. Check for ripeness/maturity.`,
            season: this.getSeasonFromDate(harvestDate),
            category: 'garden',
            dueDate: harvestDate.getTime(),
            completed: false,
            priority: 'medium',
            isRecurring: false,
            recurrencePattern: 'none',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        });

        return tasks;
    },

    /**
     * Recommend plants based on User Profile (Zone, Exp, Goals)
     */
    getRecommendations(profile: UserProfile, currentSeason: string = 'spring'): ScoredPlant[] {
        if (!profile) return [];
        
        const zoneNum = parseInt(profile.hardinessZone.replace(/[^0-9]/g, '')) || 6;
        
        return COMMON_PLANTS.map(plant => {
            let score = 0;
            const reasons: RecommendationReason[] = [];

            // 1. Zone Matching (Critical)
            if (plant.hardinessZones.includes(zoneNum)) {
                score += 10;
            } else {
                score -= 100; // Strong penalty if not in zone
            }

            // 2. Season Matching
            if (plant.season.includes(currentSeason as any)) {
                score += 5;
                reasons.push({ type: 'season', message: `Great for ${currentSeason} planting` });
            }

            // 3. Experience Level Matching
            if (profile.experienceLevel === 'beginner') {
                if (plant.difficulty === 'beginner') {
                    score += 5;
                    reasons.push({ type: 'experience', message: "Easy to grow for beginners" });
                } else if (plant.difficulty === 'expert') {
                    score -= 5;
                }
            }

            // 4. Goal Matching
            if (profile.goals.includes('self-sufficiency')) {
                // Heuristic: Calories/Storage crops (Potatoes, Beans, Corn)
                if (['p13', 'p5', 'p12', 'p11'].includes(plant.id)) {
                    score += 3;
                    reasons.push({ type: 'goal', message: "High yield staple crop" });
                }
            }
            if (profile.goals.includes('profit')) {
                // Heuristic: High value/demand (Tomato, Herbs, Peppers)
                if (['p1', 'p10', 'p4', 'p14'].includes(plant.id)) {
                    score += 3;
                    reasons.push({ type: 'goal', message: "High market value" });
                }
            }

            return { ...plant, score, reasons };
        })
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score);
    },

    /**
     * Check for crowding in a specific bed
     */
    calculateBedHealth(bed: GardenBed, plants: Plant[]): { status: 'good' | 'crowded' | 'empty', utilPct: number, alert?: string } {
        if (plants.length === 0) return { status: 'empty', utilPct: 0 };

        const bedAreaSqFt = bed.width * bed.length;
        
        const occupiedSquares = new Set();
        plants.forEach(p => {
            if (p.x !== undefined && p.y !== undefined) {
                const col = Math.floor((p.x / 100) * bed.width);
                const row = Math.floor((p.y / 100) * bed.length);
                occupiedSquares.add(`${col},${row}`);
            }
        });

        const usedSqFt = occupiedSquares.size;
        const utilization = Math.min(100, Math.round((usedSqFt / bedAreaSqFt) * 100));

        if (utilization > 100) {
             return { 
                status: 'crowded', 
                utilPct: utilization, 
                alert: `Bed is overfilled.` 
            };
        }

        return { status: 'good', utilPct: utilization };
    },

    /**
     * Auto-generate a layout plan based on user profile and constraints
     * Grid-aligned version
     */
    generateLayout(bed: GardenBed, profile: UserProfile, options: AutoFillOptions = {}): Plant[] {
        // 1. Get Recommendations (Highest score first)
        const candidates = this.getRecommendations(profile, 'spring');
        if (candidates.length === 0) return [];

        const plants: Plant[] = [];
        const totalRows = Math.floor(bed.length);
        const totalCols = Math.floor(bed.width);
        const occupiedCells = new Set<string>();

        // 1.5 Handle Pollinators
        if (options.includePollinators && BENEFICIAL_PLANTS.length > 0) {
            // Place in corners if available
            const corners = [
                {c: 0, r: 0}, 
                {c: totalCols-1, r: 0}, 
                {c: 0, r: totalRows-1}, 
                {c: totalCols-1, r: totalRows-1}
            ];
            
            corners.forEach(corner => {
                if (corner.c >= 0 && corner.r >= 0) {
                    const plantType = BENEFICIAL_PLANTS[Math.floor(Math.random() * BENEFICIAL_PLANTS.length)];
                    const xPct = ((corner.c + 0.5) / totalCols) * 100;
                    const yPct = ((corner.r + 0.5) / totalRows) * 100;
                    
                    // Determine smart schedule
                    const schedule = this.getPlantingSchedule(plantType, profile.hardinessZone);
                    
                    plants.push({
                        id: crypto.randomUUID(),
                        bedId: bed.id,
                        name: plantType.name,
                        variety: plantType.defaultVariety,
                        plantedDate: schedule.startDate.getTime(),
                        daysToMaturity: plantType.daysToMaturity,
                        status: 'seeded',
                        quantity: 1,
                        x: xPct,
                        y: yPct,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        syncStatus: 'pending'
                    });
                    occupiedCells.add(`${corner.c},${corner.r}`);
                }
            });
        }

        // 2. Select top crops
        // Sort by height (Tall -> Short) to place Tall in "back" (top rows)
        const heightRank = { 'tall': 3, 'medium': 2, 'short': 1 };
        const selectedCrops = candidates.slice(0, Math.min(candidates.length, bed.length)); 
        
        selectedCrops.sort((a, b) => (heightRank[b.height || 'medium'] || 2) - (heightRank[a.height || 'medium'] || 2));

        // Distribute crops across rows
        let cropIndex = 0;
        
        for (let row = 0; row < totalRows; row++) {
            // Determine crop for this row (or strip of rows)
            // Should we switch crop? Yes if we have enough crops
            if (row > 0 && (row % Math.ceil(totalRows / selectedCrops.length) === 0)) {
                cropIndex++;
                if (cropIndex >= selectedCrops.length) cropIndex = 0;
            }
            
            const currentCrop = selectedCrops[cropIndex];
            
            // Look for a companion if option enabled
            let companion: PlantTemplate | undefined;
            if (options.includeCompanions && currentCrop.companions && currentCrop.companions.length > 0) {
                // Find a companion that is in COMMON_PLANTS
                const compId = currentCrop.companions[0];
                companion = COMMON_PLANTS.find(p => p.id === compId);
            }

            // Fill the row with this crop (1 plant per square foot, visually)
            for (let col = 0; col < totalCols; col++) {
                if (occupiedCells.has(`${col},${row}`)) continue;

                // Alternate companion if enabled (Checkerboard or Strip)
                // Pattern: Crop, Crop, Companion, Crop, Crop...
                const useCompanion = companion && ((col + row) % 3 === 0);
                const plantType = useCompanion ? companion! : currentCrop;

                // Calculate center of this grid cell in percentages
                const xPct = ((col + 0.5) / totalCols) * 100;
                const yPct = ((row + 0.5) / totalRows) * 100;

                // Determine smart schedule
                const schedule = this.getPlantingSchedule(plantType, profile.hardinessZone);

                plants.push({
                    id: crypto.randomUUID(),
                    bedId: bed.id,
                    name: plantType.name,
                    variety: plantType.defaultVariety,
                    plantedDate: schedule.startDate.getTime(),
                    daysToMaturity: plantType.daysToMaturity,
                    status: 'seeded',
                    quantity: 1, // Represents "1 square's worth"
                    x: xPct,
                    y: yPct,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    syncStatus: 'pending'
                });
                occupiedCells.add(`${col},${row}`);
            }
        }

        return plants;
    }
};
