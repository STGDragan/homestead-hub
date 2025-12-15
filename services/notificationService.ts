
import { dbService } from './db';
import { Notification, NotificationType, NotificationPreference } from '../types';

export const notificationService = {
  
  async create(userId: string, type: NotificationType, title: string, content: string, link?: string): Promise<void> {
    // Check preferences first
    const prefs = await this.getPreferences(userId);
    // Simple category mapping logic
    let allowed = true;
    if (prefs) {
        if (type === 'task' && !prefs.categories.task) allowed = false;
        if (type === 'system' && !prefs.categories.system) allowed = false;
        // ... extend mapping
    }

    if (!allowed) return;

    const notification: Notification = {
        id: crypto.randomUUID(),
        userId,
        type,
        title,
        content,
        link,
        read: false,
        priority: 'normal',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    await dbService.put('notifications', notification);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const all = await dbService.getAllByIndex<Notification>('notifications', 'userId', userId);
    return all.filter(n => !n.read).length;
  },

  async getAll(userId: string): Promise<Notification[]> {
    const all = await dbService.getAllByIndex<Notification>('notifications', 'userId', userId);
    return all.sort((a, b) => b.createdAt - a.createdAt);
  },

  async markAsRead(id: string): Promise<void> {
    const note = await dbService.get<Notification>('notifications', id);
    if (note) {
        note.read = true;
        note.syncStatus = 'pending';
        await dbService.put('notifications', note);
    }
  },

  async markAllRead(userId: string): Promise<void> {
    const all = await this.getAll(userId);
    const unread = all.filter(n => !n.read);
    for (const note of unread) {
        note.read = true;
        note.syncStatus = 'pending';
        await dbService.put('notifications', note);
    }
  },

  async getPreferences(userId: string): Promise<NotificationPreference | undefined> {
    return await dbService.getByIndex<NotificationPreference>('notification_preferences', 'userId', userId);
  },

  async savePreferences(prefs: NotificationPreference): Promise<void> {
    await dbService.put('notification_preferences', prefs);
  }
};
