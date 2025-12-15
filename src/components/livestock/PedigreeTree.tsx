
import React from 'react';
import { PedigreeNode } from '../../types';
import { Card } from '../ui/Card';

interface PedigreeTreeProps {
  node?: PedigreeNode | null;
}

const NodeView: React.FC<{ node: PedigreeNode; label: string }> = ({ node, label }) => (
  <div className="flex flex-col items-center">
    <div className={`
      w-24 p-2 rounded-lg border-2 text-center text-xs relative z-10 bg-white dark:bg-stone-800
      ${node.sex === 'male' ? 'border-blue-200 text-blue-800' : 'border-pink-200 text-pink-800'}
    `}>
      <span className="block font-bold truncate">{node.name}</span>
      <span className="text-[10px] text-earth-400 uppercase">{label}</span>
    </div>
  </div>
);

export const PedigreeTree: React.FC<PedigreeTreeProps> = ({ node }) => {
  if (!node) return <div className="text-center text-earth-400 italic">No lineage data available.</div>;

  return (
    <div className="flex flex-col items-center gap-8 py-4 overflow-x-auto">
      {/* Generation 0 (Subject) */}
      <NodeView node={node} label="Subject" />

      {/* Generation 1 (Parents) */}
      {(node.sire || node.dam) && (
        <div className="flex gap-16 relative">
           {/* Connector Lines */}
           <div className="absolute top-[-2rem] left-1/2 -translate-x-1/2 w-full h-8 border-t-2 border-x-2 border-earth-300 rounded-t-xl z-0" style={{ width: '60%' }}></div>
           
           <div className="relative z-10">
              {node.sire ? <NodeView node={node.sire} label="Sire" /> : <div className="w-24 text-center text-xs text-earth-300">Unknown Sire</div>}
           </div>
           <div className="relative z-10">
              {node.dam ? <NodeView node={node.dam} label="Dam" /> : <div className="w-24 text-center text-xs text-earth-300">Unknown Dam</div>}
           </div>
        </div>
      )}

      {/* Generation 2 (Grandparents - Simplified View) */}
      <div className="flex gap-4 opacity-75 scale-90">
         {node.sire && (
            <div className="flex gap-2">
               {node.sire.sire && <NodeView node={node.sire.sire} label="P.Gr.Sire" />}
               {node.sire.dam && <NodeView node={node.sire.dam} label="P.Gr.Dam" />}
            </div>
         )}
         {node.dam && (
            <div className="flex gap-2">
               {node.dam.sire && <NodeView node={node.dam.sire} label="M.Gr.Sire" />}
               {node.dam.dam && <NodeView node={node.dam.dam} label="M.Gr.Dam" />}
            </div>
         )}
      </div>
    </div>
  );
};
