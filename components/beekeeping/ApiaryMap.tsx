
import React, { useRef } from 'react';
import { Hive } from '../../types';
import { Hexagon } from 'lucide-react';

interface ApiaryMapProps {
    hives: Hive[];
    onHiveClick: (hive: Hive) => void;
    onPlaceHive?: (x: number, y: number) => void;
    mode?: 'view' | 'add';
}

export const ApiaryMap: React.FC<ApiaryMapProps> = ({ hives, onHiveClick, onPlaceHive, mode = 'view' }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: React.MouseEvent) => {
        if (mode !== 'add' || !onPlaceHive || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        onPlaceHive(x, y);
    };

    return (
        <div 
            ref={containerRef}
            onClick={handleClick}
            className={`
                relative w-full aspect-video bg-green-50 dark:bg-stone-900 
                border-2 border-dashed border-earth-300 dark:border-stone-700 rounded-xl overflow-hidden
                ${mode === 'add' ? 'cursor-crosshair hover:bg-green-100 dark:hover:bg-stone-800' : ''}
            `}
        >
            <div className="absolute inset-0 opacity-5" 
                style={{ 
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                    backgroundSize: '20px 20px' 
                }}
            />

            {hives.filter(h => h.status === 'active').map(hive => (
                <div
                    key={hive.id}
                    onClick={(e) => {
                        e.stopPropagation();
                        onHiveClick(hive);
                    }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
                    style={{ left: `${hive.location.x}%`, top: `${hive.location.y}%` }}
                >
                    <div className="w-10 h-10 bg-amber-100 border-2 border-amber-400 rounded-lg flex items-center justify-center text-amber-700 shadow-sm hover:scale-110 transition-transform">
                        <Hexagon size={24} fill="currentColor" className="opacity-20 absolute" />
                        <span className="font-bold text-xs relative z-10">{hive.name.substring(0, 2)}</span>
                    </div>
                    <div className="mt-1 px-2 py-0.5 bg-white/90 dark:bg-black/80 rounded text-[10px] font-bold shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {hive.name}
                    </div>
                </div>
            ))}

            {mode === 'add' && (
                <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse pointer-events-none">
                    Click map to place Hive
                </div>
            )}
        </div>
    );
};
