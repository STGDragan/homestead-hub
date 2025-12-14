


import { OrchardTree, Task, UserProfile, RootstockType } from '../types';

export interface OrchardConfig {
    width: number;
    length: number;
    exclusions: { x: number, y: number }[]; // Grid cells (5x5ft blocks)
    fruits: string[];
    yieldGoal: 'low' | 'medium' | 'high';
    maxHeight: 'short' | 'medium' | 'tall';
}

export interface ProposedTree {
    species: string;
    variety: string;
    rootstock: RootstockType;
    x: number; // percentage
    y: number; // percentage
    gridX: number; // 5ft cell x
    gridY: number; // 5ft cell y
    yieldEst: number; // lbs/year
}

export const orchardAI = {
    /**
     * Suggest pruning season based on species.
     */
    getPruningAdvice(tree: OrchardTree): { season: string, advice: string } {
        const species = tree.species.toLowerCase();
        
        if (['apple', 'pear'].includes(species)) {
            return {
                season: 'winter',
                advice: 'Prune when dormant (Late Winter). Remove crossing branches, water sprouts, and dead wood. Open the center to allow light penetration.'
            };
        }
        
        if (['peach', 'nectarine', 'plum', 'apricot', 'cherry'].includes(species)) {
            return {
                season: 'spring', // or late summer
                advice: 'Prune in late spring or early summer to avoid Silver Leaf disease and bacterial canker. Create an open vase shape for airflow.'
            };
        }

        if (species === 'citrus') {
            return {
                season: 'spring',
                advice: 'Prune lightly in spring after harvest. Remove suckers from the base and dead wood. Do not expose the trunk to sunburn.'
            };
        }

        return {
            season: 'winter',
            advice: 'General rule: Prune dead/diseased wood anytime. Structural pruning best when dormant.'
        };
    },

    getHarvestSeason(species: string): 'spring' | 'summer' | 'fall' | 'winter' {
        const s = species.toLowerCase();
        if (['cherry', 'apricot', 'peach', 'plum'].some(k => s.includes(k))) return 'summer';
        if (['apple', 'pear', 'persimmon', 'pecan', 'walnut'].some(k => s.includes(k))) return 'fall';
        if (['citrus', 'orange', 'lemon'].some(k => s.includes(k))) return 'winter';
        return 'summer'; // Default
    },

    /**
     * Generate tasks based on tree age and species.
     */
    generateSeasonalTasks(tree: OrchardTree, userProfile: UserProfile): Task[] {
        const tasks: Task[] = [];
        const pruning = this.getPruningAdvice(tree);
        const harvestSeason = this.getHarvestSeason(tree.species);
        const now = new Date();
        const year = now.getFullYear();
        
        // 0. Planting Task (If newly created/planted)
        if (tree.ageYears === 0 && tree.status === 'planted' && (Date.now() - tree.plantedDate < 86400000)) {
            tasks.push({
                id: crypto.randomUUID(),
                title: `Plant Tree: ${tree.variety}`,
                description: `Dig hole 2x width of root ball. Keep graft union 2-3 inches above soil line. Water deeply immediately. Mulch, but keep mulch away from trunk.`,
                category: 'orchard',
                season: this.getSeasonFromDate(new Date(tree.plantedDate)) as any,
                dueDate: tree.plantedDate,
                priority: 'critical',
                completed: false,
                isRecurring: false,
                recurrencePattern: 'none',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            });
        }

        // 1. Pruning Task (Recurring Yearly)
        let month = 1; // Feb
        if (pruning.season === 'spring') month = 4; // May
        if (pruning.season === 'summer') month = 7; // Aug
        if (pruning.season === 'fall') month = 10; // Nov

        const pruneDate = new Date(year, month, 15).getTime();
        const finalPruneDate = pruneDate < Date.now() ? new Date(year + 1, month, 15).getTime() : pruneDate;

        tasks.push({
            id: crypto.randomUUID(),
            title: `Prune ${tree.species} (${tree.variety})`,
            description: pruning.advice,
            category: 'orchard',
            season: pruning.season as any, 
            dueDate: finalPruneDate,
            priority: 'high',
            completed: false,
            isRecurring: true,
            recurrencePattern: 'yearly',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        });

        // 2. Fertilizing Logic (Early Spring)
        const fertDate = new Date(year, 2, 15).getTime(); // March 15
        const finalFertDate = fertDate < Date.now() ? new Date(year + 1, 2, 15).getTime() : fertDate;

        tasks.push({
            id: crypto.randomUUID(),
            title: `Fertilize ${tree.species}`,
            description: `Apply balanced fruit tree fertilizer or compost before bud break. Apply at the drip line, not the trunk.`,
            category: 'orchard',
            season: 'spring',
            dueDate: finalFertDate,
            priority: 'medium',
            completed: false,
            isRecurring: true,
            recurrencePattern: 'yearly',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        });

        // 3. Harvest Task
        let harvestMonth = 8; // Sept (Fall)
        if (harvestSeason === 'summer') harvestMonth = 6; // July
        if (harvestSeason === 'winter') harvestMonth = 0; // Jan
        
        const harvestDate = new Date(year, harvestMonth, 15).getTime();
        const finalHarvestDate = harvestDate < Date.now() ? new Date(year + 1, harvestMonth, 15).getTime() : harvestDate;

        tasks.push({
            id: crypto.randomUUID(),
            title: `Harvest ${tree.species}`,
            description: `Check ${tree.variety} for ripeness. Taste test before full harvest.`,
            category: 'orchard',
            season: harvestSeason as any,
            dueDate: finalHarvestDate,
            priority: 'medium',
            completed: false,
            isRecurring: true,
            recurrencePattern: 'yearly',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        });

        return tasks;
    },

    getSeasonFromDate(date: Date): string {
        const month = date.getMonth(); // 0-11
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    },

    checkPollination(newTree: OrchardTree, allTrees: OrchardTree[]): { hasPartner: boolean, message: string } {
        if (['peach', 'apricot', 'fig', 'citrus'].includes(newTree.species.toLowerCase())) {
            return { hasPartner: true, message: 'Self-fertile species.' };
        }

        const partners = allTrees.filter(t => 
            t.id !== newTree.id && 
            t.species.toLowerCase() === newTree.species.toLowerCase() &&
            t.status !== 'dead' && t.status !== 'removed'
        );

        if (partners.length > 0) {
            return { hasPartner: true, message: `Pollination likely covered by ${partners.length} other ${newTree.species}(s).` };
        }

        return { 
            hasPartner: false, 
            message: `Warning: ${newTree.species} often requires a different variety for pollination. Consider planting another.` 
        };
    },

    /**
     * GENERATE ORCHARD LAYOUT
     * Calculates optimal tree placement with staggered rows and species interleaving.
     */
    generateLayout(config: OrchardConfig): ProposedTree[] {
        const trees: ProposedTree[] = [];
        const uniqueFruits = config.fruits;
        
        if (uniqueFruits.length === 0) return [];

        // 1. Rootstock & Spacing
        // 1 cell = 5ft.
        let rootstock: RootstockType = 'standard';
        let spacingCells = 4; // 20ft standard
        
        if (config.maxHeight === 'short') {
            rootstock = 'dwarf';
            spacingCells = 2; // 10ft
        } else if (config.maxHeight === 'medium') {
            rootstock = 'semi-dwarf';
            spacingCells = 3; // 15ft
        }

        // Add breathing room if not maximizing yield
        if (config.yieldGoal !== 'high') {
            spacingCells += 1; // +5ft extra spacing
        }

        const radiusCells = Math.floor(spacingCells / 2);

        const gridW = Math.floor(config.width / 5);
        const gridH = Math.floor(config.length / 5);
        
        const collisionMap = new Set<string>();
        config.exclusions.forEach(ex => collisionMap.add(`${ex.x},${ex.y}`));

        // 2. Placement Loop (Staggered Grid)
        let rowIsOdd = false;
        let globalSpeciesIndex = 0; // Ensures strict A->B->C rotation regardless of grid position
        
        // Start slightly inset
        for (let y = 2; y < gridH - 2; y += spacingCells) {
            const rowOffset = rowIsOdd ? Math.ceil(spacingCells / 2) : 0;
            rowIsOdd = !rowIsOdd;

            for (let x = 2 + rowOffset; x < gridW - 2; x += spacingCells) {
                
                // Check Collisions (Trunk + Canopy Buffer)
                let blocked = false;
                
                // Scan area around trunk for exclusions
                const buffer = radiusCells; // Ensure canopy doesn't hit exclusion
                for(let bx = x - buffer; bx <= x + buffer; bx++) {
                    for(let by = y - buffer; by <= y + buffer; by++) {
                        if (collisionMap.has(`${bx},${by}`)) {
                            blocked = true;
                            break;
                        }
                    }
                    if(blocked) break;
                }

                if (!blocked) {
                    // Determine Species (Round Robin)
                    const fruit = uniqueFruits[globalSpeciesIndex % uniqueFruits.length];
                    globalSpeciesIndex++;
                    
                    trees.push({
                        species: fruit,
                        variety: 'Suggested Variety',
                        rootstock,
                        x: (x / gridW) * 100,
                        y: (y / gridH) * 100,
                        gridX: x,
                        gridY: y,
                        // Conservative Yield Estimates (lbs/year at maturity)
                        yieldEst: rootstock === 'dwarf' ? 40 : rootstock === 'semi-dwarf' ? 100 : 250
                    });
                }
            }
        }

        return trees;
    }
};
