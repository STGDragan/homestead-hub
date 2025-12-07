
import React, { useRef, useState, useEffect } from 'react';
import { GardenBed, Plant, PlantTemplate } from '../../types';
import { COMMON_PLANTS } from '../../constants';
import { 
  Sprout, Circle, Square, Triangle, Hexagon, Cloud, Heart, Leaf
} from 'lucide-react';

interface LayoutGridProps {
  bed: GardenBed;
  plants: Plant[];
  activePlantTemplate: PlantTemplate | null;
  toolMode: 'inspect' | 'paint' | 'eraser';
  onPlacePlant: (x: number, y: number, template: PlantTemplate) => void;
  onRemovePlant: (plantId: string) => void;
  onPlantSelect: (plant: Plant) => void;
  allTemplates?: PlantTemplate[];
}

// Icon Mapping
const ICONS: Record<string, React.FC<any>> = {
  Circle, Square, Triangle, Hexagon, Cloud, Heart, Leaf, Sprout
};

export const LayoutGrid: React.FC<LayoutGridProps> = ({ 
  bed, 
  plants, 
  activePlantTemplate,
  toolMode,
  onPlacePlant,
  onRemovePlant,
  onPlantSelect,
  allTemplates = COMMON_PLANTS
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastActionCell, setLastActionCell] = useState<string | null>(null);

  // Dimensions
  const cols = Math.floor(bed.width);
  const rows = Math.floor(bed.length);

  // Helper: Get plant template by name
  const getPlantTemplate = (name: string) => {
      return allTemplates.find(p => p.name === name) || COMMON_PLANTS.find(p => p.name === name);
  };

  // Helper: Convert screen coordinates to grid cell
  const getCellFromCoords = (clientX: number, clientY: number) => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Relative coordinates
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Check bounds
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return null;

      const colWidth = rect.width / cols;
      const rowHeight = rect.height / rows;

      const col = Math.floor(x / colWidth);
      const row = Math.floor(y / rowHeight);

      return { col, row };
  };

  // Helper: Check if a cell is occupied
  const getPlantAtCell = (col: number, row: number) => {
      // Find plant where center percentages roughly map to this col/row
      // Plants store x/y as percentages (0-100)
      return plants.find(p => {
          const pCol = Math.floor((p.x || 0) / 100 * cols);
          const pRow = Math.floor((p.y || 0) / 100 * rows);
          return pCol === col && pRow === row;
      });
  };

  const performAction = (col: number, row: number) => {
      const cellKey = `${col},${row}`;
      if (cellKey === lastActionCell) return; // Debounce same cell

      const existingPlant = getPlantAtCell(col, row);

      if (toolMode === 'paint' && activePlantTemplate) {
          if (!existingPlant) {
              const xPct = ((col + 0.5) / cols) * 100;
              const yPct = ((row + 0.5) / rows) * 100;
              onPlacePlant(xPct, yPct, activePlantTemplate);
          }
      } else if (toolMode === 'eraser') {
          if (existingPlant) {
              onRemovePlant(existingPlant.id);
          }
      } else if (toolMode === 'inspect') {
          // Inspect only works on click (PointerUp/Click), not drag
          // handled separately in handleClick
      }

      setLastActionCell(cellKey);
  };

  // --- Interaction Handlers ---

  const handlePointerDown = (e: React.PointerEvent) => {
      e.preventDefault(); // Prevent scrolling/selection
      setIsDragging(true);
      setLastActionCell(null);
      
      const cell = getCellFromCoords(e.clientX, e.clientY);
      if (cell) {
          if (toolMode === 'inspect') {
              // Store start cell for click detection? 
              // Standard onClick handles inspect better than pointer logic
          } else {
              performAction(cell.col, cell.row);
              // Capture pointer to track outside if needed, but for grid, staying inside is preferred
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }
      }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging || toolMode === 'inspect') return;
      e.preventDefault();

      const cell = getCellFromCoords(e.clientX, e.clientY);
      if (cell) {
          performAction(cell.col, cell.row);
      }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      setIsDragging(false);
      setLastActionCell(null);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleClick = (e: React.MouseEvent) => {
      // Handle Inspect Mode clicks
      if (toolMode !== 'inspect') return;
      
      const cell = getCellFromCoords(e.clientX, e.clientY);
      if (cell) {
          const plant = getPlantAtCell(cell.col, cell.row);
          if (plant) {
              onPlantSelect(plant);
          }
      }
  };

  // --- Render ---

  const renderCells = () => {
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const plant = getPlantAtCell(c, r);
        const template = plant ? getPlantTemplate(plant.name) : activePlantTemplate;
        
        const Icon = (template && ICONS[template.icon]) || ICONS['Sprout'];
        const hasImage = template?.imageUrl;
        const count = template ? (template.spacing <= 3 ? 16 : template.spacing <= 4 ? 9 : template.spacing <= 6 ? 4 : 1) : 0;

        // Visual States
        const isGhost = !plant && toolMode === 'paint' && activePlantTemplate;
        const isEraserTarget = plant && toolMode === 'eraser';

        cells.push(
          <div 
            key={`${c}-${r}`}
            className={`
              relative border border-earth-300/30 dark:border-stone-700/50 flex flex-col items-center justify-center overflow-hidden transition-colors select-none touch-none
              ${toolMode === 'inspect' && plant ? 'cursor-pointer hover:border-leaf-400' : ''}
              ${isEraserTarget ? 'hover:bg-red-500/20 cursor-crosshair' : ''}
              ${isGhost ? 'hover:bg-leaf-500/10 cursor-crosshair group' : ''}
            `}
          >
            {/* Coordinate Label */}
            {!plant && (
                <span className="absolute top-1 left-1 text-[8px] text-earth-300 dark:text-stone-600 opacity-20 pointer-events-none">
                {c+1},{r+1}
                </span>
            )}

            {/* Ghost Preview (Hover Only) */}
            {isGhost && (
               <div className="opacity-0 group-hover:opacity-40 flex flex-col items-center justify-center absolute inset-0 pointer-events-none">
                  {hasImage ? (
                      <img src={template!.imageUrl} className="w-full h-full object-cover grayscale" />
                  ) : (
                      <Icon size={24} className="text-leaf-600" />
                  )}
                  <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-white/50 px-1 rounded">x{count}</span>
               </div>
            )}

            {/* Actual Plant */}
            {plant && template && (
              <>
                <div className="absolute inset-0 z-0">
                    {hasImage ? (
                        <img src={template.imageUrl} alt={plant.name} className="w-full h-full object-cover opacity-90" />
                    ) : (
                        <div className="w-full h-full bg-leaf-100/50 dark:bg-leaf-900/20 flex items-center justify-center">
                            <div className="text-leaf-700 dark:text-leaf-400">
                                <Icon size={32} strokeWidth={1.5} />
                            </div>
                        </div>
                    )}
                </div>
                
                {isEraserTarget && (
                    <div className="absolute inset-0 bg-red-500/30 z-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-white/80 p-1 rounded-full">
                            {/* X Icon purely decorative on hover */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-1 right-1 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 rounded-md shadow-sm border border-white/20 pointer-events-none">
                   x{count}
                </div>
                
                <div className="absolute top-1 left-1 z-10 pointer-events-none">
                    <span className="text-[9px] font-bold bg-white/80 dark:bg-black/60 text-earth-800 dark:text-white px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md">
                        {plant.name}
                    </span>
                </div>
              </>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 select-none">
       {/* Dimensions Label */}
       <div className="flex justify-between w-full max-w-4xl px-4 text-xs font-mono text-earth-500 font-bold uppercase tracking-widest mb-2">
          <span>{bed.width} FT</span>
          <span>{bed.length} FT</span>
       </div>

       {/* Grid Container */}
       <div 
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
          className={`
             bg-earth-50 dark:bg-stone-900 border-2 shadow-xl rounded-lg overflow-hidden touch-none
             ${toolMode === 'eraser' ? 'border-red-300 dark:border-red-900/50 cursor-crosshair' : 'border-earth-300 dark:border-stone-700'}
             ${toolMode === 'paint' ? 'cursor-crosshair' : ''}
          `}
          style={{
             display: 'grid',
             gridTemplateColumns: `repeat(${cols}, 1fr)`,
             gridTemplateRows: `repeat(${rows}, 1fr)`,
             width: '100%',
             height: 'auto',
             maxWidth: '100%', 
             maxHeight: '100%',
             aspectRatio: `${cols}/${rows}`,
          }}
       >
          {renderCells()}
       </div>
    </div>
  );
};
