
import { BreedingLog, NotificationTask, SpeciesType } from '../types';
import { dbService } from './db';

const SPECIES_META: Record<SpeciesType, { gestation: number; checkDays: number[] }> = {
  chicken: { gestation: 21, checkDays: [7, 14] },
  duck: { gestation: 28, checkDays: [7, 21] },
  goat: { gestation: 150, checkDays: [30, 90, 140] },
  sheep: { gestation: 147, checkDays: [30, 90, 140] },
  cattle: { gestation: 283, checkDays: [45, 120, 270] },
  rabbit: { gestation: 31, checkDays: [14, 28] },
  pig: { gestation: 114, checkDays: [21, 80, 110] },
  bee: { gestation: 0, checkDays: [] },
  other: { gestation: 0, checkDays: [] }
};

export const breedingNotifications = {
  
  /**
   * Generate tasks when a new breeding event is logged
   */
  async generateTasksForEvent(log: BreedingLog, species: SpeciesType): Promise<void> {
    const meta = SPECIES_META[species];
    if (!meta || meta.gestation === 0) return;

    const matingDate = new Date(log.matingDate);
    const tasks: NotificationTask[] = [];

    // 1. Generate Due Date Alert
    const dueDate = new Date(matingDate.getTime() + (meta.gestation * 24 * 60 * 60 * 1000));
    
    tasks.push({
      id: crypto.randomUUID(),
      userId: 'me',
      breedingEventId: log.id,
      type: 'due_date',
      status: 'pending',
      scheduledAt: dueDate.getTime() - (3 * 24 * 60 * 60 * 1000), // 3 days before
      priority: 'high',
      title: `Due Date Approaching: ${species.charAt(0).toUpperCase() + species.slice(1)}`,
      notes: `Expected birth around ${dueDate.toLocaleDateString()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'pending'
    });

    // 2. Generate Pregnancy Checks
    meta.checkDays.forEach(day => {
        const checkDate = new Date(matingDate.getTime() + (day * 24 * 60 * 60 * 1000));
        tasks.push({
            id: crypto.randomUUID(),
            userId: 'me',
            breedingEventId: log.id,
            type: 'pregnancy_check',
            status: 'pending',
            scheduledAt: checkDate.getTime(),
            priority: 'normal',
            title: `Pregnancy Check (${day} days)`,
            notes: 'Check for signs of pregnancy or confirm via vet.',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        });
    });

    // Save all tasks
    for (const task of tasks) {
        await dbService.put('notification_tasks', task);
    }
  },

  /**
   * Get tasks sorted by date
   */
  async getTasks(): Promise<NotificationTask[]> {
      const tasks = await dbService.getAll<NotificationTask>('notification_tasks');
      return tasks.sort((a, b) => a.scheduledAt - b.scheduledAt);
  },

  /**
   * Mark task complete
   */
  async completeTask(id: string): Promise<void> {
      const task = await dbService.get<NotificationTask>('notification_tasks', id);
      if (task) {
          task.status = 'completed';
          task.updatedAt = Date.now();
          await dbService.put('notification_tasks', task);
      }
  }
};
