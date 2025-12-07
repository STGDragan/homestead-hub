
import React, { useState, useEffect } from 'react';
import { helpService } from '../../services/helpService';
import { HelpArticle } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ArticleEditorModal } from '../../components/help/ArticleEditorModal';
import { Search, Book, ChevronRight, Edit2, Plus } from 'lucide-react';
import { USER_HELP_CONTENT } from '../../constants';

export const HelpCenter: React.FC = () => {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Edit State
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await helpService.init(); // Seed if empty
    const all = await helpService.getArticles();
    setArticles(all);
  };

  const handleSaveArticle = async (data: Partial<HelpArticle>) => {
      const article: HelpArticle = {
          id: data.id || crypto.randomUUID(),
          title: data.title!,
          excerpt: data.excerpt!,
          content: data.content!,
          categoryId: data.categoryId || 'general',
          createdBy: 'user',
          createdAt: data.createdAt || Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };
      await helpService.saveArticle(article);
      loadData();
      setShowEditor(false);
      setEditingArticle(null);
  };

  const filteredArticles = articles.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory ? a.categoryId === selectedCategory : true;
      return matchesSearch && matchesCat;
  });

  // Get categories from constants for display structure, but count from DB
  const categories = USER_HELP_CONTENT.map(c => ({
      ...c,
      count: articles.filter(a => a.categoryId === c.id).length
  }));

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="text-center py-8 bg-earth-800 dark:bg-stone-900 rounded-3xl text-white mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-serif font-bold mb-2">How can we help?</h1>
            <div className="max-w-md mx-auto px-4">
                <div className="relative">
                    <Input 
                    placeholder="Search guides..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20 dark:bg-black/20 dark:border-white/10"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                </div>
            </div>
          </div>
       </div>

       <div className="grid md:grid-cols-4 gap-6">
          <div className="space-y-2">
             <div className="flex justify-between items-center px-2 mb-2">
                <h3 className="font-bold text-earth-900 dark:text-earth-100">Categories</h3>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { setEditingArticle(null); setShowEditor(true); }}>
                    <Plus size={14} />
                </Button>
             </div>
             <button 
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${!selectedCategory ? 'bg-leaf-100 text-leaf-800 dark:bg-leaf-900/30 dark:text-leaf-300' : 'hover:bg-earth-100 dark:hover:bg-stone-800 text-earth-600 dark:text-stone-400'}`}
             >
                All Guides
             </button>
             {categories.map(cat => (
                <button 
                   key={cat.id}
                   onClick={() => setSelectedCategory(cat.id)}
                   className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors flex justify-between items-center ${selectedCategory === cat.id ? 'bg-leaf-100 text-leaf-800 dark:bg-leaf-900/30 dark:text-leaf-300' : 'hover:bg-earth-100 dark:hover:bg-stone-800 text-earth-600 dark:text-stone-400'}`}
                >
                   <span>{cat.title}</span>
                   <span className="text-xs opacity-60 font-normal">{cat.count}</span>
                </button>
             ))}
          </div>

          <div className="md:col-span-3 space-y-6">
             <div className="grid gap-4">
                {filteredArticles.length === 0 ? (
                    <div className="text-center py-12 text-earth-400 dark:text-stone-500 italic">No articles found. Create one!</div>
                ) : (
                    filteredArticles.map(article => (
                        <Card key={article.id} className="hover:border-leaf-300 dark:hover:border-leaf-700 cursor-pointer transition-colors group relative">
                            <div className="p-4 pr-12">
                                <h3 className="font-bold text-earth-800 dark:text-earth-100 text-lg mb-1">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-earth-600 dark:text-stone-400 line-clamp-2">{article.excerpt}</p>
                            </div>
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setEditingArticle(article); setShowEditor(true); }} className="p-2 bg-earth-100 dark:bg-stone-800 rounded-full text-earth-600 dark:text-stone-300 hover:text-leaf-600">
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        </Card>
                    ))
                )}
             </div>
          </div>
       </div>

       {showEditor && (
           <ArticleEditorModal 
              article={editingArticle}
              categoryId={selectedCategory || undefined}
              onSave={handleSaveArticle}
              onClose={() => setShowEditor(false)}
           />
       )}
    </div>
  );
};
