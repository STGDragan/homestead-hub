
import React, { useRef } from 'react';
import { OrchardTree } from '../../types';

interface OrchardMapProps {
    trees: OrchardTree[];
    onTreeClick: (tree: OrchardTree) => void;
    onPlaceTree?: (x: number, y: number) => void;
    mode?: 'view' | 'add';
    aspectRatio?: number;
    orchardDimensions?: { width: number, length: number }; // Total physical size in feet
}

export const OrchardMap: React.FC<OrchardMapProps> = ({ 
    trees, 
    onTreeClick, 
    onPlaceTree, 
    mode = 'view', 
    aspectRatio = 1,
    orchardDimensions = { width: 100, length: 100 } 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: React.MouseEvent) => {
        if (mode !== 'add' || !onPlaceTree || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        onPlaceTree(x, y);
    };

    // Calculate canopy size as percentage of map width
    const getCanopyStyle = (rootstock: string) => {
        let diameterFt = 15; // default semi-dwarf
        switch(rootstock) {
            case 'dwarf': diameterFt = 10; break;
            case 'semi-dwarf': diameterFt = 15; break;
            case 'standard': diameterFt = 25; break;
        }
        
        // Calculate percentage width relative to total orchard width
        // Ensure a minimum visual size (2%) so trees don't disappear on huge maps
        const widthPercent = Math.max(2, (diameterFt / orchardDimensions.width) * 100);
        
        return {
            width: `${widthPercent}%`,
            aspectRatio: '1/1',
        };
    };

    return (
        <div 
            ref={containerRef}
            onClick={handleClick}
            className={`
                relative w-full bg-earth-50 dark:bg-stone-900 
                border-2 border-dashed border-earth-300 dark:border-stone-700 rounded-xl overflow-hidden
                ${mode === 'add' ? 'cursor-crosshair hover:bg-earth-100 dark:hover:bg-stone-800' : ''}
            `}
            style={{ aspectRatio: `${aspectRatio}` }}
        >
            {/* Standardized Grid Background - 10ft Major Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    // Calculate background size to represent 10ft squares regardless of container size
                    backgroundSize: `${(10 / orchardDimensions.width) * 100}% ${(10 / orchardDimensions.length) * 100}%`
                }}
            />

            {trees.filter(t => t.status !== 'dead' && t.status !== 'removed').map(tree => (
                <div
                    key={tree.id}
                    onClick={(e) => {
                        e.stopPropagation();
                        onTreeClick(tree);
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group z-10"
                    style={{ 
                        left: `${tree.location.x}%`, 
                        top: `${tree.location.y}%`,
                        ...getCanopyStyle(tree.rootstock)
                    }}
                >
                    {/* Canopy Circle */}
                    <div className={`
                        w-full h-full rounded-full border-2 opacity-60 transition-all duration-300
                        ${tree.status === 'mature' ? 'bg-green-600/30 border-green-600' : 'bg-leaf-400/30 border-leaf-400'}
                        group-hover:bg-green-500/50 group-hover:opacity-80
                    `} />

                    {/* Trunk Center */}
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-earth-800 shadow-sm" />

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 px-2 py-0.5 bg-white/90 dark:bg-black/80 rounded text-[10px] font-bold shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none text-earth-900 dark:text-white">
                        {tree.variety} ({tree.rootstock})
                    </div>
                </div>
            ))}

            {mode === 'add' && (
                <div className="absolute top-4 left-4 bg-leaf-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse pointer-events-none z-20">
                    Click to Place Tree
                </div>
            )}
            
            <div className="absolute bottom-2 left-2 text-[9px] text-earth-400 font-mono opacity-50 bg-white/50 dark:bg-black/50 px-1 rounded pointer-events-none">
                Grid: 10ft | Scale: 1:{orchardDimensions.width}
            </div>
        </div>
    );
};
