
import { OrchardTree, Task, UserProfile } from '../types';

export const orchardAI = {
    /**
     * Suggest pruning season based on species.
     */
    getPruningAdvice(tree: OrchardTree): { season: string, advice: string } {
        const species = tree.species.toLowerCase();
        
        if (['apple', 'pear'].includes(species)) {
            return {
                season: 'winter',
                advice: 'Prune when dormant (Late Winter). Focus on removing crossing branches and opening the center for light.'
            };
        }
        
        if (['peach', 'nectarine', 'plum', 'apricot', 'cherry'].includes(species)) {
            return {
                season: 'spring', // or late summer
                advice: 'Prune in late spring or early summer to avoid Silver Leaf disease and bacterial canker. Create an open vase shape.'
            };
        }

        if (species === 'citrus') {
            return {
                season: 'spring',
                advice: 'Prune lightly in spring after harvest. Remove suckers and dead wood.'
            };
        }

        return {
            season: 'winter',
            advice: 'General rule: Prune dead/diseased wood anytime. Structural pruning best when dormant.'
        };
    },

    /**
     * Generate tasks based on tree age and species.
     */
    generateSeasonalTasks(tree: OrchardTree, userProfile: UserProfile): Task[] {
        const tasks: Task[] = [];
        const pruning = this.getPruningAdvice(tree);
        const now = new Date();
        const year = now.getFullYear();

        // 1. Pruning Task (Recurring Yearly)
        // Simplified date logic: Winter = Feb 1, Spring = May 1, Summer = Aug 1, Fall = Nov 1
        let month = 1; // Feb
        if (pruning.season === 'spring') month = 4; // May
        if (pruning.season === 'summer') month = 7; // Aug
        if (pruning.season === 'fall') month = 10; // Nov

        const pruneDate = new Date(year, month, 15).getTime();
        // If date passed this year, schedule for next
        const finalPruneDate = pruneDate < Date.now() ? new Date(year + 1, month, 15).getTime() : pruneDate;

        tasks.push({
            id: crypto.randomUUID(),
            title: `Prune ${tree.species} (${tree.variety})`,
            description: pruning.advice,
            category: 'orchard',
            season: pruning.season as any, // Cast to Season type
            dueDate: finalPruneDate,
            priority: 'high',
            completed: false,
            isRecurring: true,
            recurrencePattern: 'yearly',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        });

        // 2. Fertilizing (Spring)
        const fertDate = new Date(year, 2, 15).getTime(); // March 15
        const finalFertDate = fertDate < Date.now() ? new Date(year + 1, 2, 15).getTime() : fertDate;

        tasks.push({
            id: crypto.randomUUID(),
            title: `Fertilize ${tree.species}`,
            description: `Apply balanced fruit tree fertilizer or compost before bud break.`,
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

        return tasks;
    },

    /**
     * Check if a newly added tree has a pollination partner nearby.
     * (Simplified logic: checks if another tree of same species exists).
     */
    checkPollination(newTree: OrchardTree, allTrees: OrchardTree[]): { hasPartner: boolean, message: string } {
        // Self-fertile check (heuristic)
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
    }
};
