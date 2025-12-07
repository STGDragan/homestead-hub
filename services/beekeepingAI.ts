
import { Hive, HiveInspection } from '../types';

export const beekeepingAI = {
    /**
     * Recommend next inspection date based on season and last findings.
     */
    getInspectionSchedule(lastInspection: HiveInspection | undefined): { date: number, reason: string } {
        const now = new Date();
        const month = now.getMonth(); // 0-11
        
        let daysToAdd = 14; // Default
        let reason = "Routine inspection.";

        // Swarm Season (Spring: March - June in N. Hemisphere)
        if (month >= 2 && month <= 5) {
            daysToAdd = 7;
            reason = "Spring swarm season active. Check weekly.";
        }
        // Winter (Nov - Feb)
        else if (month >= 10 || month <= 1) {
            daysToAdd = 30;
            reason = "Winter cluster. Minimal disturbance recommended.";
        }

        // Adjust based on last inspection issues
        if (lastInspection) {
            if (lastInspection.eggsSeen === false && month >= 2 && month <= 8) {
                daysToAdd = 3;
                reason = "No eggs seen last time. Re-check for queen status immediately.";
            }
            if (lastInspection.population === 'crowded' && month >= 2 && month <= 6) {
                daysToAdd = 5;
                reason = "Hive crowded. High swarm risk. Check sooner.";
            }
        }

        return {
            date: Date.now() + (daysToAdd * 24 * 60 * 60 * 1000),
            reason
        };
    },

    /**
     * Analyze recent history for problems
     */
    analyzeHealth(hive: Hive, inspections: HiveInspection[]): { status: 'healthy' | 'at_risk' | 'critical', message: string } {
        if (inspections.length === 0) return { status: 'healthy', message: 'New hive. Establish baseline.' };

        const latest = inspections[0]; // Assumed sorted desc

        // Critical: Queenless?
        if (!latest.eggsSeen && !latest.queenSeen) {
            return { status: 'critical', message: 'Potential Queenlessness. No eggs or queen observed.' };
        }

        // At Risk: Mites
        if (latest.miteCount && latest.miteCount > 3) { // 3 mites per 100 bees threshold (approx)
            return { status: 'at_risk', message: `High Mite Count (${latest.miteCount}). Treatment suggested.` };
        }

        // At Risk: Stores
        if (latest.stores === 'low' && (new Date().getMonth() > 9 || new Date().getMonth() < 2)) {
            return { status: 'at_risk', message: 'Low winter stores. Emergency feeding required.' };
        }

        return { status: 'healthy', message: 'Colony metrics look good.' };
    }
};
