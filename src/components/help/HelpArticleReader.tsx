
import React from 'react';
import { HelpArticle } from '../../types';
import { X, Calendar, User, Tag } from 'lucide-react';
import { Button } from '../ui/Button';

interface HelpArticleReaderProps {
  article: HelpArticle;
  onClose: () => void;
}

export const HelpArticleReader: React.FC<HelpArticleReaderProps> = ({ article, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden border border-earth-200 dark:border-stone-800">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-earth-100 dark:border-stone-800 bg-earth-50/50 dark:bg-stone-900/50">
           <div className="pr-8">
              <h2 className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100 leading-tight mb-2">
                 {article.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-earth-500 dark:text-stone-400">
                 <span className="flex items-center gap-1">
                    <Calendar size={12} /> {new Date(article.updatedAt).toLocaleDateString()}
                 </span>
                 <span className="flex items-center gap-1 capitalize">
                    <User size={12} /> {article.createdBy}
                 </span>
                 <span className="flex items-center gap-1 capitalize bg-earth-200 dark:bg-stone-800 px-2 py-0.5 rounded text-earth-700 dark:text-stone-300">
                    <Tag size={12} /> {article.categoryId}
                 </span>
              </div>
           </div>
           <button 
              onClick={onClose}
              className="text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 transition-colors p-1"
           >
              <X size={24} />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           <div className="prose prose-earth dark:prose-invert max-w-none">
              <p className="lead text-lg text-earth-600 dark:text-stone-300 font-medium mb-6 border-l-4 border-leaf-500 pl-4">
                 {article.excerpt}
              </p>
              
              <div className="whitespace-pre-wrap text-earth-800 dark:text-stone-200 leading-relaxed">
                 {/* Simple markdown-like rendering for line breaks */}
                 {article.content}
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-earth-100 dark:border-stone-800 bg-earth-50/30 dark:bg-stone-900 flex justify-end">
           <Button variant="ghost" onClick={onClose}>Close Guide</Button>
        </div>
      </div>
    </div>
  );
};
