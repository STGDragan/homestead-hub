
import React, { useState } from 'react';
import { ADMIN_DOCS_CONTENT } from '../../constants';
import { DocPage, SOP } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BookOpen, FileText, ChevronRight, AlertCircle, Shield } from 'lucide-react';

export const AdminDocs: React.FC = () => {
  const [activePageId, setActivePageId] = useState<string>('runbook');
  
  const activePage = ADMIN_DOCS_CONTENT.find(p => p.id === activePageId);

  const renderSOP = (sop: SOP) => (
    <Card key={sop.id} className="mb-6 border-l-4 border-l-leaf-600">
       <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100 flex items-center gap-2">
             <FileText size={20} className="text-leaf-600" />
             {sop.title}
          </h3>
          <div className="flex gap-2">
             {sop.role.map(r => (
                <span key={r} className="text-[10px] uppercase font-bold bg-earth-100 dark:bg-stone-800 text-earth-600 dark:text-stone-300 px-2 py-1 rounded">
                   {r}
                </span>
             ))}
          </div>
       </div>
       <ol className="list-decimal list-inside space-y-2 text-sm text-earth-700 dark:text-stone-300 bg-earth-50 dark:bg-stone-800/50 p-4 rounded-xl border border-earth-100 dark:border-stone-700">
          {sop.steps.map((step, idx) => (
             <li key={idx} className="pl-2 mb-1">{step}</li>
          ))}
       </ol>
    </Card>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 min-h-[80vh]">
       
       {/* Sidebar Navigation */}
       <div className="w-full md:w-64 bg-white dark:bg-stone-900 rounded-2xl border border-earth-200 dark:border-stone-800 p-4 h-fit">
          <h2 className="font-serif font-bold text-earth-900 dark:text-earth-100 mb-4 px-2 flex items-center gap-2">
             <BookOpen size={20} /> System Docs
          </h2>
          <nav className="space-y-1">
             {ADMIN_DOCS_CONTENT.map(page => (
                <button
                   key={page.id}
                   onClick={() => setActivePageId(page.id)}
                   className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between
                      ${activePageId === page.id 
                         ? 'bg-earth-100 dark:bg-stone-800 text-leaf-800 dark:text-leaf-400' 
                         : 'text-earth-500 dark:text-stone-400 hover:bg-earth-50 dark:hover:bg-stone-800/50'}
                   `}
                >
                   {page.title}
                   {activePageId === page.id && <ChevronRight size={16} />}
                </button>
             ))}
          </nav>
          
          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-200">
             <p className="font-bold flex items-center gap-2 mb-1"><AlertCircle size={14}/> Note</p>
             <p>These documents are live. Updates in the Admin Console reflect here immediately.</p>
          </div>
       </div>

       {/* Content Area */}
       <div className="flex-1">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-earth-200 dark:border-stone-800 p-8 min-h-full">
             <div className="mb-8 border-b border-earth-100 dark:border-stone-800 pb-4">
                <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100">{activePage?.title}</h1>
                <p className="text-earth-500 dark:text-stone-400 text-sm mt-1">Last updated: {new Date().toLocaleDateString()}</p>
             </div>

             <div className="space-y-8">
                {activePage?.sections.map(section => (
                   <div key={section.id}>
                      <h2 className="text-xl font-bold text-earth-800 dark:text-earth-200 mb-3">{section.title}</h2>
                      <div className="prose prose-earth dark:prose-invert max-w-none text-sm text-earth-600 dark:text-stone-300 whitespace-pre-wrap">
                         {section.content}
                      </div>
                   </div>
                ))}

                {activePage?.sops?.map(sop => renderSOP(sop))}
             </div>
          </div>
       </div>
    </div>
  );
};
