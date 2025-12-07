
import { dbService } from './db';
import { 
  BreedingLog, Offspring, NotificationTask, Animal, 
  ExportArchive, ReportType, PiiPreference, AuditLog
} from '../types';

/**
 * REPORTING LOGIC
 * 
 * Provides KPI calculations, CSV generation, and Compliance helpers.
 * Simulates Backend functions in a PWA context.
 */

export interface KPIResult {
  label: string;
  value: number | string;
  unit?: string;
  change?: number; // % change vs prev period
  trend?: 'up' | 'down' | 'neutral';
}

export const reportingLogic = {

  /**
   * Calculate Breeding KPIs (Pregnancy Rate, Survival, etc.)
   */
  async getBreedingKPIs(): Promise<KPIResult[]> {
    const logs = await dbService.getAll<BreedingLog>('breeding_logs');
    const offspring = await dbService.getAll<Offspring>('offspring');
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // 1. Pregnancy Success Rate (Confirmed / Mated)
    const recentLogs = logs.filter(l => l.matingDate > thirtyDaysAgo);
    const totalMated = recentLogs.length;
    const confirmed = recentLogs.filter(l => l.status === 'pregnant' || l.status === 'birthed').length;
    const pregRate = totalMated > 0 ? (confirmed / totalMated) * 100 : 0;

    // 2. Offspring Survival (Active+Retained+Sold / Total Born)
    // Note: status 'died' or 'culled' are losses
    const totalBorn = offspring.length;
    const survived = offspring.filter(o => ['active', 'retained', 'sold'].includes(o.status)).length;
    const survivalRate = totalBorn > 0 ? (survived / totalBorn) * 100 : 100;

    return [
      { label: 'Pregnancy Rate', value: pregRate.toFixed(1), unit: '%', trend: 'neutral' },
      { label: 'Offspring Survival', value: survivalRate.toFixed(1), unit: '%', trend: survivalRate > 90 ? 'up' : 'down' },
      { label: 'Total Births', value: totalBorn, trend: 'up' }
    ];
  },

  /**
   * Calculate Compliance KPIs (Med adherence, Withdrawals)
   */
  async getComplianceKPIs(): Promise<KPIResult[]> {
    const tasks = await dbService.getAll<NotificationTask>('notification_tasks');
    
    // Med Adherence: Completed doses / Total doses scheduled
    const medTasks = tasks.filter(t => t.type === 'medication_dose' || t.type === 'vaccination');
    const completed = medTasks.filter(t => t.status === 'completed').length;
    const adherence = medTasks.length > 0 ? (completed / medTasks.length) * 100 : 100;

    return [
      { label: 'Med Adherence', value: adherence.toFixed(1), unit: '%', trend: adherence > 95 ? 'up' : 'down' },
      { label: 'Pending Audits', value: 0, trend: 'neutral' }
    ];
  },

  /**
   * Generate CSV content for Export
   */
  async generateCSV(type: ReportType, pii: PiiPreference): Promise<string> {
    let rows: any[] = [];
    let headers: string[] = [];

    if (type === 'MEDICAL_PACK') {
        headers = ['Date', 'Type', 'Animal_ID', 'Details', 'Performed_By'];
        const logs = await dbService.getAll<any>('med_admin_logs');
        const visits = await dbService.getAll<any>('vet_visits');
        
        const combined = [
            ...logs.map((l: any) => ({
                Date: new Date(l.administeredAt).toISOString(),
                Type: 'Medication',
                Animal_ID: l.animalId,
                Details: `${l.doseAmount} ${l.doseUnit} ${l.route}`,
                Performed_By: this.redact(l.administeredBy, pii)
            })),
            ...visits.map((v: any) => ({
                Date: new Date(v.date).toISOString(),
                Type: 'Vet Visit',
                Animal_ID: v.animalId,
                Details: v.reason,
                Performed_By: this.redact(v.vetId || 'Vet', pii)
            }))
        ];
        rows = combined;
    } else if (type === 'LINEAGE_TRACE') {
        headers = ['ID', 'Name', 'Species', 'Breed', 'Sex', 'DOB', 'Sire', 'Dam'];
        const animals = await dbService.getAll<Animal>('animals');
        rows = animals.map(a => ({
            ID: a.id,
            Name: a.name,
            Species: a.species,
            Breed: a.breed,
            Sex: a.sex,
            DOB: new Date(a.dateOfBirth).toISOString(),
            Sire: a.sireId || 'Unknown',
            Dam: a.damId || 'Unknown'
        }));
    }

    // Convert to CSV String
    const csvContent = [
        headers.join(','),
        ...rows.map(row => headers.map(fieldName => `"${row[fieldName] || ''}"`).join(','))
    ].join('\n');

    return csvContent;
  },

  /**
   * PII Redaction Helper
   */
  redact(value: string, preference: PiiPreference): string {
    if (preference === 'INCLUDE') return value;
    if (preference === 'ANONYMIZE') return `User_${value.substring(0,4)}`; // Simple hash sim
    return '[REDACTED]';
  },

  /**
   * Log an immutable audit event
   */
  async logAudit(action: AuditLog['action'], entityType: string, entityId: string, details: string) {
      const log: AuditLog = {
          id: crypto.randomUUID(),
          action,
          entityType,
          entityId,
          details,
          performedBy: 'current_user',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };
      await dbService.put('audit_logs', log);
  }
};
