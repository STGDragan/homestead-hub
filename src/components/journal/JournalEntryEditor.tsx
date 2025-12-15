
import React, { useState } from 'react';
import { JournalEntry } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { X, Image, Tag } from 'lucide-react';

interface JournalEntryEditorProps {
  onSave: (entry: JournalEntry) => void;
  onClose: () => void;
}

export const JournalEntryEditor: React.FC<JournalEntryEditorProps> = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: JournalEntry = {
       id: crypto.randomUUID(),
       date: new Date(date).getTime(),
       title,
       content,
       tags: tags.split(',').map(t => t.trim()).filter(Boolean),
       images: [],
       createdAt: Date.now(),
       updatedAt: Date.now(),
       syncStatus: 'pending'
    };
    onSave(entry);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">New Journal Entry</h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           <Input 
              label="Title"
              placeholder="e.g. First Frost Observation"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              required
           />
           
           <Input 
              label="Date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
           />

           <TextArea 
              label="Content"
              className="h-32"
              placeholder="What happened in the garden today?"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
           />

           <Input 
              label="Tags (comma separated)"
              icon={<Tag size={16} />}
              placeholder="weather, planting, tomatoes"
              value={tags}
              onChange={e => setTags(e.target.value)}
           />

           <div className="flex justify-between items-center pt-2">
              <Button type="button" variant="secondary" icon={<Image size={16}/>}>Add Photo</Button>
              <div className="flex gap-2">
                 <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                 <Button type="submit">Save Entry</Button>
              </div>
           </div>
        </form>
      </div>
    </div>
  );
};
