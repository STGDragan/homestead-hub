import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageThread } from '../../types';
import { messagingService } from '../../services/messagingService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Send, Paperclip, MoreVertical, Check, CheckCheck, Clock } from 'lucide-react';

interface ChatWindowProps {
  thread: MessageThread & { otherParticipant?: any };
  currentUser: any;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ thread, currentUser, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); 
    return () => clearInterval(interval);
  }, [thread.id]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
      const msgs = await messagingService.getMessages(thread.id);
      setMessages(msgs);
  };

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      await messagingService.sendMessage(thread.id, currentUser.id, input);
      setInput('');
      loadMessages();
      messagingService.simulateIncomingMessage(thread.id);
  };

  return (
    <div className="flex flex-col h-full bg-earth-50 dark:bg-night-950 md:rounded-2xl md:border md:border-earth-200 md:dark:border-night-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-white dark:bg-night-900 border-b border-earth-200 dark:border-night-800 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-3">
                {onBack && (
                    <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">Back</Button>
                )}
                <div className="w-10 h-10 rounded-full bg-leaf-100 dark:bg-leaf-900/20 flex items-center justify-center font-bold text-leaf-700 dark:text-leaf-300">
                    {thread.otherParticipant?.name[0]}
                </div>
                <div>
                    <h3 className="font-bold text-earth-900 dark:text-earth-100">{thread.otherParticipant?.name}</h3>
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                    </p>
                </div>
            </div>
            <Button variant="ghost" size="sm"><MoreVertical size={18} /></Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'bg-leaf-600 text-white rounded-tr-none' : 'bg-white dark:bg-night-900 text-earth-800 dark:text-earth-200 rounded-tl-none border border-earth-100 dark:border-night-800'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-leaf-200' : 'text-earth-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                {isMe && (
                                    <>
                                        {msg.status === 'sending' && <Clock size={12} />}
                                        {msg.status === 'sent' && <Check size={12} />}
                                        {msg.status === 'delivered' && <CheckCheck size={12} />}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-night-900 border-t border-earth-200 dark:border-night-800 flex gap-2 items-center">
            <Button type="button" variant="ghost" size="sm" className="text-earth-400">
                <Paperclip size={20} />
            </Button>
            <input 
                className="flex-1 bg-earth-100 dark:bg-night-800 border-transparent focus:border-leaf-500 focus:ring-0 rounded-xl px-4 py-2 text-earth-900 dark:text-earth-100 placeholder-earth-400"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
            />
            <Button type="submit" size="sm" disabled={!input.trim()} className="bg-leaf-600 hover:bg-leaf-700 text-white rounded-xl w-10 h-10 p-0 flex items-center justify-center">
                <Send size={18} />
            </Button>
        </form>
    </div>
  );
};