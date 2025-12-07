import React, { useState, useEffect } from 'react';
import { messagingService } from '../../services/messagingService';
import { MessageThread, UserProfile } from '../../types';
import { ChatWindow } from '../../components/messaging/ChatWindow';
import { Button } from '../../components/ui/Button';
import { Plus, Search, MessageSquare } from 'lucide-react';
import { dbService } from '../../services/db';

export const MessagingDashboard: React.FC = () => {
  const [threads, setThreads] = useState<(MessageThread & { otherParticipant?: any })[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileList, setIsMobileList] = useState(true);

  useEffect(() => {
    const init = async () => {
        const user = await dbService.get<UserProfile>('user_profile', 'main_user');
        setCurrentUser({ id: 'main_user', name: user?.name || 'Me' });
        loadThreads();
    };
    init();
  }, []);

  const loadThreads = async () => {
      const t = await messagingService.getThreads('main_user');
      setThreads(t);
  };

  const handleStartChat = async () => {
      const threadId = await messagingService.createThread('main_user', 'u2');
      await loadThreads();
      setActiveThreadId(threadId);
      setIsMobileList(false);
  };

  const activeThread = threads.find(t => t.id === activeThreadId);

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] flex gap-4 animate-in fade-in">
       
       <div className={`w-full md:w-80 flex-col bg-white dark:bg-night-900 md:rounded-2xl md:border md:border-earth-200 md:dark:border-night-800 ${isMobileList ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-4 border-b border-earth-100 dark:border-night-800">
             <div className="flex justify-between items-center mb-4">
                <h2 className="font-serif font-bold text-xl text-earth-900 dark:text-earth-100">Messages</h2>
                <Button size="sm" onClick={handleStartChat} icon={<Plus size={16}/>}>New</Button>
             </div>
             <div className="relative">
                <input 
                   placeholder="Search chats..."
                   className="w-full bg-earth-50 dark:bg-night-800 border-none rounded-xl py-2 pl-9 pr-4 text-sm text-earth-900 dark:text-earth-100 placeholder-earth-400"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
             {threads.length === 0 ? (
                 <div className="text-center p-8 text-earth-400 text-sm">
                     <MessageSquare size={32} className="mx-auto mb-2 opacity-50"/>
                     No messages yet.
                 </div>
             ) : threads.map(t => (
                 <div 
                    key={t.id}
                    onClick={() => { setActiveThreadId(t.id); setIsMobileList(false); }}
                    className={`p-4 border-b border-earth-50 dark:border-night-800 cursor-pointer hover:bg-earth-50 dark:hover:bg-night-800 transition-colors ${activeThreadId === t.id ? 'bg-leaf-50 dark:bg-leaf-900/10' : ''}`}
                 >
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-earth-200 dark:bg-night-800 flex items-center justify-center font-bold text-earth-600 dark:text-night-300">
                          {t.otherParticipant?.name[0]}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                             <h4 className="font-bold text-earth-900 dark:text-earth-100 text-sm truncate">{t.otherParticipant?.name}</h4>
                             <span className="text-xs text-earth-400">{new Date(t.lastMessageAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-earth-500 dark:text-night-400 truncate">{t.lastMessageText}</p>
                       </div>
                    </div>
                 </div>
             ))}
          </div>
       </div>

       <div className={`flex-1 ${!isMobileList ? 'block' : 'hidden md:block'}`}>
          {activeThread ? (
              <ChatWindow 
                 thread={activeThread} 
                 currentUser={currentUser} 
                 onBack={() => setIsMobileList(true)}
              />
          ) : (
              <div className="h-full flex items-center justify-center bg-earth-50 dark:bg-night-900 md:rounded-2xl border border-earth-200 dark:border-night-800 text-earth-400">
                 <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start chatting</p>
                 </div>
              </div>
          )}
       </div>
    </div>
  );
};