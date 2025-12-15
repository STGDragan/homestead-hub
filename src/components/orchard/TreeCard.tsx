
import React from 'react';
import { OrchardTree } from '../../types';
import { Card } from '../ui/Card';
import { Sprout, Circle } from 'lucide-react';

interface TreeCardProps {
    tree: OrchardTree;
    onClick: () => void;
}

export const TreeCard: React.FC<TreeCardProps> = ({ tree, onClick }) => {
    return (
        <Card interactive onClick={onClick} className="flex items-center gap-4 p-4">
            <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0
                ${tree.status === 'mature' ? 'bg-green-100 text-green-700' : 'bg-earth-100 text-earth-600'}
            `}>
                <Sprout size={24} />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-earth-900 dark:text-earth-100 truncate">{tree.variety}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${tree.status === 'mature' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {tree.status}
                    </span>
                </div>
                <p className="text-xs text-earth-500 dark:text-stone-400 font-medium">{tree.species} • {tree.rootstock} root</p>
                <div className="mt-1 text-xs text-earth-400">
                    Planted: {new Date(tree.plantedDate).getFullYear()} ({new Date().getFullYear() - new Date(tree.plantedDate).getFullYear()}y)
                </div>
            </div>
        </Card>
    );
};
