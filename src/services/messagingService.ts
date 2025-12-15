
import { dbService } from './db';
import { Message, MessageThread, AuthUser } from '../types';
import { notificationService } from './notificationService';

// Mock other users for demo
const MOCK_USERS = [
    { id: 'u2', name: 'Farmer Joe', email: 'joe@farm.com' },
    { id: 'u3', name: 'Sarah Seeds', email: 'sarah@seeds.com' },
    { id: 'u4', name: 'Vet Clinic', email: 'help@vet.com' }
];

export const messagingService = {

  async getThreads(currentUserId: string): Promise<(MessageThread & { otherParticipant?: any })[]> {
    const threads = await dbService.getAll<MessageThread>('message_threads');
    // Filter threads where user is a participant
    const userThreads = threads.filter(t => t.participantIds.includes(currentUserId));
    
    return userThreads.map(t => {
        const otherId = t.participantIds.find(pid => pid !== currentUserId);
        // In real app, fetch user profile. Here, check mock or assume unknown
        const otherUser = MOCK_USERS.find(u => u.id === otherId) || { id: otherId, name: 'Unknown User' };
        return { ...t, otherParticipant: otherUser };
    }).sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },

  async getMessages(threadId: string): Promise<Message[]> {
    const msgs = await dbService.getAllByIndex<Message>('messages', 'threadId', threadId);
    return msgs.sort((a, b) => a.createdAt - b.createdAt);
  },

  async sendMessage(threadId: string, senderId: string, content: string): Promise<void> {
    const msg: Message = {
        id: crypto.randomUUID(),
        threadId,
        senderId,
        content,
        readBy: [senderId],
        status: navigator.onLine ? 'sent' : 'sending', // Optimistic status
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    await dbService.put('messages', msg);

    // Update Thread
    const thread = await dbService.get<MessageThread>('message_threads', threadId);
    if (thread) {
        thread.lastMessageText = content;
        thread.lastMessageAt = Date.now();
        thread.updatedAt = Date.now();
        await dbService.put('message_threads', thread);
    }
  },

  async createThread(currentUserId: string, otherUserId: string): Promise<string> {
    // Check existing
    const threads = await this.getThreads(currentUserId);
    const existing = threads.find(t => t.participantIds.includes(otherUserId) && !t.isGroup);
    
    if (existing) return existing.id;

    const newThread: MessageThread = {
        id: crypto.randomUUID(),
        participantIds: [currentUserId, otherUserId],
        lastMessageText: 'Started conversation',
        lastMessageAt: Date.now(),
        isGroup: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    await dbService.put('message_threads', newThread);
    return newThread.id;
  },

  // Mock function to simulate incoming messages for demo
  async simulateIncomingMessage(threadId: string) {
      setTimeout(async () => {
          const thread = await dbService.get<MessageThread>('message_threads', threadId);
          if (!thread) return;
          
          const otherId = thread.participantIds.find(id => id !== 'main_user'); // Hardcoded main_user
          if (!otherId) return;

          const msg: Message = {
              id: crypto.randomUUID(),
              threadId,
              senderId: otherId,
              content: "That sounds great! Thanks for the info.",
              readBy: [],
              status: 'delivered',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              syncStatus: 'synced'
          };
          await dbService.put('messages', msg);
          
          thread.lastMessageText = msg.content;
          thread.lastMessageAt = Date.now();
          await dbService.put('message_threads', thread);

          // Trigger notification
          await notificationService.create(
              'main_user', 
              'social', 
              'New Message', 
              `New message in thread`, 
              '/messages'
          );

      }, 5000);
  },

  getMockUsers() {
      return MOCK_USERS;
  }
};
