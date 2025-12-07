
import React, { useRef, useState } from 'react';
import { OrchardTree } from '../../types';
import { Sprout, Circle, X } from 'lucide-react';

interface OrchardMapProps {
    trees: OrchardTree[];
    onTreeClick: (tree: OrchardTree) => void;
    onPlaceTree?: (x: number, y: number) => void; // If provided, enables "Add Mode"
    mode?: 'view' | 'add';
}

export const OrchardMap: React.FC<OrchardMapProps> = ({ trees, onTreeClick, onPlaceTree, mode = 'view' }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: React.MouseEvent) => {
        if (mode !== 'add' || !onPlaceTree || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        onPlaceTree(x, y);
    };

    return (
        <div 
            ref={containerRef}
            onClick={handleClick}
            className={`
                relative w-full aspect-square md:aspect-[16/9] bg-earth-50 dark:bg-stone-900 
                border-2 border-dashed border-earth-300 dark:border-stone-700 rounded-xl overflow-hidden
                ${mode === 'add' ? 'cursor-crosshair hover:bg-earth-100 dark:hover:bg-stone-800' : ''}
            `}
        >
            {/* Grid Lines (Optional visual guide) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '10% 10%' 
                }}
            />

            {trees.filter(t => t.status !== 'dead' && t.status !== 'removed').map(tree => (
                <div
                    key={tree.id}
                    onClick={(e) => {
                        e.stopPropagation();
                        onTreeClick(tree);
                    }}
                    className={`
                        absolute transform -translate-x-1/2 -translate-y-1/2
                        flex flex-col items-center cursor-pointer group z-10
                    `}
                    style={{ left: `${tree.location.x}%`, top: `${tree.location.y}%` }}
                >
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-2
                        ${tree.status === 'mature' ? 'bg-green-600 border-green-700 text-white' : 'bg-leaf-300 border-leaf-500 text-leaf-900'}
                    `}>
                        <Sprout size={16} />
                    </div>
                    <div className="mt-1 px-2 py-0.5 bg-white/90 dark:bg-black/80 rounded text-[10px] font-bold shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {tree.variety}
                    </div>
                </div>
            ))}

            {mode === 'add' && (
                <div className="absolute top-4 left-4 bg-leaf-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse pointer-events-none">
                    Click to Place Tree
                </div>
            )}
        </div>
    );
};
