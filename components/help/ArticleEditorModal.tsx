
import React, { useState } from 'react';
import { HelpArticle } from '../../types';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { X, Save } from 'lucide-react';

interface ArticleEditorModalProps {
  article?: HelpArticle | null;
  categoryId?: string; // If creating new under category
  onSave: (data: Partial<HelpArticle>) => void;
  onClose: () => void;
}

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({ article, categoryId, onSave, onClose }) => {
  const [title, setTitle] = useState(article?.title || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [content, setContent] = useState(article?.content || '');
  const [catId, setCatId] = useState(article?.categoryId || categoryId || 'general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        id: article?.id,
        title,
        excerpt,
        content,
        categoryId: catId,
        createdBy: 'admin',
        createdAt: article?.createdAt
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 border border-earth-200 dark:border-stone-800 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">
             {article ? 'Edit Article' : 'New Guide'}
          </h2>
          <button onClick={onClose}><X size={24} className="text-earth-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
           <Input 
              label="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
           />
           
           <Input 
              label="Excerpt (Short Summary)"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              required
           />

           <div className="space-y-1">
              <label className="block text-sm font-bold text-earth-700 dark:text-earth-300">Content (Markdown supported)</label>
              <textarea 
                 className="w-full bg-earth-50 dark:bg-stone-950 text-earth-900 dark:text-earth-100 border border-earth-300 dark:border-night-700 rounded-xl p-4 min-h-[200px] focus:ring-2 focus:ring-leaf-500 transition-colors"
                 value={content}
                 onChange={e => setContent(e.target.value)}
                 required
              />
           </div>

           <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" icon={<Save size={16}/>}>Save Article</Button>
           </div>
        </form>
      </div>
    </div>
  );
};
