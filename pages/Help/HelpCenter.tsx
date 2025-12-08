
import React, { useState, useEffect } from 'react';
import { helpService } from '../../services/helpService';
import { HelpArticle, AuthUser } from '../../types';
import { authService } from '../../services/auth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ArticleEditorModal } from '../../components/help/ArticleEditorModal';
import { HelpArticleReader } from '../../components/help/HelpArticleReader';
import { Search, Book, ChevronRight, Edit2, Plus, Lock } from 'lucide-react';
import { USER_HELP_CONTENT } from '../../constants';

export const HelpCenter: React.FC = () => {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
  // State
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const [viewingArticle, setViewingArticle] = useState<HelpArticle | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await helpService.init(); // Seed if empty
    const all = await helpService.getArticles();
    setArticles(all);
    
    const user = await authService.getCurrentUser();
    setCurrentUser(user);
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

  const isAdmin = authService.hasRole(currentUser, 'admin');

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
       <div className="text-center py-8 bg-earth-800 dark:bg-stone-900 rounded-3xl text-white mb-8 relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <h1 className="text-3xl font-serif font-bold mb-2 flex items-center justify-center gap-3">
               <Book size={32} className="text-leaf-300" /> Help Center
            </h1>
            <p className="text-earth-200 mb-6 max-w-lg mx-auto text-sm">Browse guides, documentation, and troubleshooting tips for your homestead.</p>
            
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

       <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl text-earth-900 dark:text-earth-100">Knowledge Base</h2>
          {isAdmin && (
             <Button onClick={() => { setEditingArticle(null); setShowEditor(true); }} icon={<Plus size={18}/>}>
                New Article
             </Button>
          )}
       </div>

       <div className="grid md:grid-cols-4 gap-6">
          <div className="space-y-2">
             <div className="flex justify-between items-center px-2 mb-2">
                <h3 className="font-bold text-earth-500 dark:text-stone-400 text-xs uppercase tracking-wider">Categories</h3>
             </div>
             <button 
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${!selectedCategory ? 'bg-earth-800 text-white shadow-md' : 'hover:bg-earth-100 dark:hover:bg-stone-800 text-earth-600 dark:text-stone-400 bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-800'}`}
             >
                All Guides
             </button>
             {categories.map(cat => (
                <button 
                   key={cat.id}
                   onClick={() => setSelectedCategory(cat.id)}
                   className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex justify-between items-center 
                      ${selectedCategory === cat.id 
                          ? 'bg-leaf-600 text-white shadow-md' 
                          : 'hover:bg-earth-100 dark:hover:bg-stone-800 text-earth-600 dark:text-stone-400 bg-white dark:bg-stone-900 border border-earth-200 dark:border-stone-800'
                      }`}
                >
                   <span>{cat.title}</span>
                   <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-earth-100 dark:bg-stone-800'}`}>
                      {cat.count}
                   </span>
                </button>
             ))}
          </div>

          <div className="md:col-span-3 space-y-6">
             <div className="grid gap-4">
                {filteredArticles.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border-2 border-dashed border-earth-200 dark:border-stone-800">
                        <Book size={48} className="mx-auto mb-4 text-earth-300 dark:text-stone-700" />
                        <p className="text-earth-500 dark:text-stone-400 italic">No articles found matching your search.</p>
                        {isAdmin && <Button variant="ghost" onClick={() => setShowEditor(true)} className="mt-4">Create First Article</Button>}
                    </div>
                ) : (
                    filteredArticles.map(article => (
                        <Card 
                            key={article.id} 
                            className="hover:border-leaf-300 dark:hover:border-leaf-700 cursor-pointer transition-all hover:shadow-md group relative"
                            onClick={() => setViewingArticle(article)}
                        >
                            <div className="p-5 pr-12">
                                <h3 className="font-bold text-earth-900 dark:text-earth-100 text-lg mb-2 group-hover:text-leaf-700 dark:group-hover:text-leaf-400 transition-colors">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-earth-600 dark:text-stone-400 leading-relaxed">{article.excerpt}</p>
                                <div className="mt-4 flex items-center gap-4 text-xs text-earth-400">
                                    <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1 font-bold text-leaf-600 dark:text-leaf-500 group-hover:underline">
                                        Read Guide <ChevronRight size={12} />
                                    </span>
                                </div>
                            </div>
                            
                            {isAdmin && (
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setEditingArticle(article); setShowEditor(true); }} 
                                        className="p-2 bg-earth-100 dark:bg-stone-800 rounded-lg text-earth-600 dark:text-stone-300 hover:text-leaf-600 hover:bg-leaf-50 border border-earth-200 dark:border-stone-700"
                                        title="Edit Article"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            )}
                        </Card>
                    ))
                )}
             </div>
          </div>
       </div>

       {/* Editor Modal (Admin Only) */}
       {showEditor && isAdmin && (
           <ArticleEditorModal 
              article={editingArticle}
              categoryId={selectedCategory || undefined}
              onSave={handleSaveArticle}
              onClose={() => setShowEditor(false)}
           />
       )}

       {/* Reader Modal (Public) */}
       {viewingArticle && (
           <HelpArticleReader 
              article={viewingArticle}
              onClose={() => setViewingArticle(null)}
           />
       )}
    </div>
  );
};
