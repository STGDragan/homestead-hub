
import React, { useState, useRef, useEffect } from 'react';
import { dbService } from '../../services/db';
import { YardItem, YardItemType, OrchardTree, Hive, GardenBed, HerdGroup } from '../../types';
import { YARD_TEMPLATES } from '../../constants';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Map, Save, Trash2, RotateCw, ZoomIn, ZoomOut, TreeDeciduous, Hexagon, Plus, MousePointer2, Sprout, Home, LayoutGrid, Settings, Square, Circle, Triangle, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Draggable Item Component ---
interface DraggableItemProps {
    item: YardItem;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (id: string, updates: Partial<YardItem>) => void;
    gridScale: number;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ 
    item, 
    isSelected, 
    onSelect, 
    onUpdate, 
    gridScale 
}) => {
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 }); // Mouse pixel position
    const itemStartPos = useRef({ x: 0, y: 0 }); // Item grid position

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent map deselection
        e.preventDefault();  // Prevent text selection
        onSelect();
        isDragging.current = true;
        startPos.current = { x: e.clientX, y: e.clientY };
        itemStartPos.current = { x: item.x, y: item.y };
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        
        // Calculate delta in pixels
        const deltaPxX = e.clientX - startPos.current.x;
        const deltaPxY = e.clientY - startPos.current.y;
        
        // Convert to grid units (feet)
        const deltaGridX = deltaPxX / gridScale;
        const deltaGridY = deltaPxY / gridScale;

        // Apply to start position
        let newX = itemStartPos.current.x + deltaGridX;
        let newY = itemStartPos.current.y + deltaGridY;

        // SNAP TO GRID (Nearest 1ft)
        newX = Math.round(newX);
        newY = Math.round(newY);
        
        // Update if changed
        if (newX !== item.x || newY !== item.y) {
            onUpdate(item.id, { x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    useEffect(() => {
        if (isSelected) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isSelected, item.x, item.y, gridScale]); 

    // Convert grid dimensions (ft) to pixels
    const pxWidth = item.width * gridScale;
    const pxHeight = item.height * gridScale;
    const pxLeft = item.x * gridScale;
    const pxTop = item.y * gridScale;

    // Item Style
    const style: React.CSSProperties = {
        left: `${pxLeft}px`,
        top: `${pxTop}px`,
        width: `${pxWidth}px`,
        height: `${pxHeight}px`,
        marginLeft: `-${pxWidth / 2}px`, // Center anchor
        marginTop: `-${pxHeight / 2}px`, // Center anchor
        transform: `rotate(${item.rotation || 0}deg)`,
        position: 'absolute',
        zIndex: isSelected ? 50 : 10,
        cursor: isSelected ? 'grabbing' : 'grab',
    };

    // Render inner content based on type
    const renderContent = () => {
        // Trees (Canopy view)
        if (item.subType === 'tree') {
            return (
                <div className={`w-full h-full rounded-full border-2 transition-colors flex items-center justify-center
                    ${isSelected ? 'border-blue-500 bg-green-500/30' : 'border-green-600/50 bg-green-500/20'}
                `}>
                    {/* Trunk */}
                    <div className="w-1.5 h-1.5 bg-earth-800 rounded-full" />
                </div>
            );
        }
        
        // Hives
        if (item.subType === 'hive') {
            return (
                <div className={`w-full h-full flex items-center justify-center relative
                    ${isSelected ? 'text-amber-600' : 'text-amber-500'}
                `}>
                    <Hexagon size={Math.min(pxWidth, pxHeight)} fill="currentColor" className="opacity-20 absolute" />
                    <Hexagon size={Math.min(pxWidth, pxHeight)} className="absolute" />
                </div>
            );
        }

        // Generic Structures/Zones
        return (
            <div 
                className={`w-full h-full transition-all flex items-center justify-center shadow-sm text-xs font-bold text-center overflow-hidden
                    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                    ${item.type === 'zone' ? 'border-2 border-dashed opacity-60' : 'border border-black/10'}
                `}
                style={{ 
                    backgroundColor: item.color, 
                    borderRadius: item.type === 'zone' ? '0' : '4px'
                }}
            >
                {/* Only show label inside if big enough */}
                {pxWidth > 40 && pxHeight > 20 && (
                    <span className="pointer-events-none mix-blend-multiply text-black/50 px-1 truncate w-full">
                        {item.label}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div 
            style={style}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()} // Stop click-through to map
            className="group"
            title={`${item.label} (${item.width}x${item.height}ft)`}
        >
            {renderContent()}
            
            {/* Hover/Select Label (Floating above) */}
            <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white/90 dark:bg-black/80 text-earth-900 dark:text-white text-[10px] font-bold rounded shadow-sm whitespace-nowrap pointer-events-none z-50
                ${isSelected ? 'block' : 'hidden group-hover:block'}
            `}>
                {item.label}
            </div>

            {/* Coordinates Helper */}
            {isSelected && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] bg-blue-600 text-white px-1 rounded font-mono pointer-events-none whitespace-nowrap">
                    {item.x}, {item.y}
                </div>
            )}
        </div>
    );
};

// --- Main Planner Component ---

export const YardPlanner: React.FC = () => {
    const navigate = useNavigate();
    // Canvas State
    const [items, setItems] = useState<YardItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    
    // Viewport State
    const [scale, setScale] = useState(5); // Start at 5x to fill screen better for typical 100ft yards
    const [propWidth, setPropWidth] = useState(100); // Feet
    const [propHeight, setPropHeight] = useState(100); // Feet
    
    // UI State
    const [activeCategory, setActiveCategory] = useState<'structures' | 'assets'>('structures');
    const [isSaving, setIsSaving] = useState(false);

    // External Data
    const [dbAssets, setDbAssets] = useState<{
        trees: OrchardTree[];
        hives: Hive[];
        beds: GardenBed[];
        herds: HerdGroup[];
    }>({ trees: [], hives: [], beds: [], herds: [] });

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Load Map Settings (Persisted Dimensions)
        const settings = await dbService.get<{id: string, width: number, height: number, createdAt: number, updatedAt: number, syncStatus: string}>('yard_settings', 'main_map');
        if (settings) {
            setPropWidth(settings.width);
            setPropHeight(settings.height);
        }

        // Load Map Items
        const yardData = await dbService.getAll<YardItem>('yard_items');
        if (yardData.length > 0) setItems(yardData);

        // Load Integration Assets
        const [trees, hives, beds, herds] = await Promise.all([
            dbService.getAll<OrchardTree>('orchard_trees'),
            dbService.getAll<Hive>('hives'),
            dbService.getAll<GardenBed>('garden_beds'),
            dbService.getAll<HerdGroup>('herds')
        ]);
        
        setDbAssets({ 
            trees: trees.filter(t => t.status !== 'removed'), 
            hives: hives.filter(h => h.status === 'active'), 
            beds, 
            herds 
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate net delay
        await new Promise(r => setTimeout(r, 500));
        
        // 1. Save Settings (Dimensions)
        await dbService.put('yard_settings', {
            id: 'main_map',
            width: propWidth,
            height: propHeight,
            createdAt: Date.now(), 
            updatedAt: Date.now(),
            syncStatus: 'pending'
        });

        // 2. Save Items - Clean save strategy
        const currentIds = new Set(items.map(i => i.id));
        const oldItems = await dbService.getAll<YardItem>('yard_items');
        
        for (const old of oldItems) {
            if (!currentIds.has(old.id)) await dbService.delete('yard_items', old.id);
        }

        for (const item of items) {
            await dbService.put('yard_items', { ...item, updatedAt: Date.now(), syncStatus: 'pending' });
        }
        
        setIsSaving(false);
        alert('Map layout saved successfully.');
    };

    const handleZoom = (direction: 'in' | 'out') => {
        // Multiplicative zoom for wider range
        const factor = 1.2;
        const newScale = direction === 'in' ? scale * factor : scale / factor;
        setScale(Math.min(Math.max(0.05, newScale), 50));
    };

    const handleWheelZoom = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey || true) { 
            e.preventDefault();
            // Smoother wheel zoom
            const factor = 0.001;
            const delta = 1 - (e.deltaY * factor);
            const newScale = scale * delta;
            setScale(Math.min(Math.max(0.05, newScale), 50));
        }
    };

    // --- Item Management ---

    const addItem = (template: typeof YARD_TEMPLATES[0]) => {
        const center = { x: Math.floor(propWidth / 2), y: Math.floor(propHeight / 2) };
        const newItem: YardItem = {
            id: crypto.randomUUID(),
            type: template.type as YardItemType,
            subType: template.name.toLowerCase(),
            label: template.name,
            x: center.x,
            y: center.y,
            width: template.width,
            height: template.height,
            color: template.color,
            rotation: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        setItems([...items, newItem]);
        setSelectedId(newItem.id);
    };

    const importAsset = (type: 'tree' | 'hive' | 'bed' | 'herd', asset: any) => {
        const center = { x: Math.floor(propWidth / 2), y: Math.floor(propHeight / 2) };
        const newItem: YardItem = {
            id: crypto.randomUUID(),
            type: 'structure', // Default
            subType: type,
            label: asset.name || asset.variety || type,
            x: center.x,
            y: center.y,
            width: 5, // Defaults overridden below
            height: 5,
            color: '#888',
            rotation: 0,
            entityId: asset.id, // LINK TO SOURCE ENTITY
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };

        if (type === 'tree') {
            newItem.color = '#15803d';
            if (asset.rootstock === 'dwarf') { newItem.width = 10; newItem.height = 10; }
            else if (asset.rootstock === 'semi-dwarf') { newItem.width = 15; newItem.height = 15; }
            else { newItem.width = 25; newItem.height = 25; }
        } else if (type === 'hive') {
            newItem.color = '#d97706';
            newItem.width = 3; 
            newItem.height = 3;
        } else if (type === 'bed') {
            newItem.color = '#86efac';
            // Use actual garden bed dimensions
            newItem.width = asset.width || 4;
            newItem.height = asset.length || 8;
        } else if (type === 'herd') {
            newItem.color = '#fca5a5';
            newItem.width = 10;
            newItem.height = 8;
        }

        // Random offset to avoid exact stacking
        newItem.x += Math.floor(Math.random() * 5) - 2;
        newItem.y += Math.floor(Math.random() * 5) - 2;

        setItems([...items, newItem]);
        setSelectedId(newItem.id);
    };

    const updateItem = (id: string, updates: Partial<YardItem>) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    };

    const deleteItem = (id: string) => {
        if (confirm("Remove this item from the map?")) {
            setItems(prev => prev.filter(i => i.id !== id));
            setSelectedId(null);
        }
    };

    const handleViewDetails = (item: YardItem) => {
        if (!item.entityId) return;
        
        switch (item.subType) {
            case 'tree':
                navigate(`/orchard/tree/${item.entityId}`);
                break;
            case 'hive':
                navigate(`/apiary/hive/${item.entityId}`);
                break;
            case 'bed':
                navigate(`/garden/bed/${item.entityId}`);
                break;
            case 'herd':
                navigate(`/animals/herd/${item.entityId}`);
                break;
        }
    };

    const selectedItem = items.find(i => i.id === selectedId);

    // Filter available assets (remove ones already placed)
    const placedEntityIds = new Set(items.map(i => i.entityId).filter(Boolean));
    
    const availableTrees = dbAssets.trees.filter(t => !placedEntityIds.has(t.id));
    const availableHives = dbAssets.hives.filter(h => !placedEntityIds.has(h.id));
    const availableBeds = dbAssets.beds.filter(b => !placedEntityIds.has(b.id));
    const availableHerds = dbAssets.herds.filter(h => !placedEntityIds.has(h.id));

    // --- Render Helpers ---

    const renderRulers = () => {
        const xTicks = [];
        const yTicks = [];
        
        // Major ticks every 10ft
        for (let i = 0; i <= propWidth; i += 10) {
            xTicks.push(
                <div key={`x-${i}`} className="absolute top-0 text-[10px] text-earth-400 font-mono border-l border-earth-300 h-2 pl-1" style={{ left: i * scale }}>
                    {i}'
                </div>
            );
        }
        for (let i = 0; i <= propHeight; i += 10) {
            yTicks.push(
                <div key={`y-${i}`} className="absolute left-0 text-[10px] text-earth-400 font-mono border-t border-earth-300 w-2 pt-0.5" style={{ top: i * scale }}>
                    {i}'
                </div>
            );
        }
        return { xTicks, yTicks };
    };

    const { xTicks, yTicks } = renderRulers();

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-earth-200 dark:bg-black overflow-hidden relative">
            
            {/* --- TOP TOOLBAR --- */}
            <div className="bg-white dark:bg-stone-900 border-b border-earth-200 dark:border-stone-800 flex flex-wrap items-center gap-4 p-4 z-20 shadow-sm shrink-0">
                
                {/* Brand / Title */}
                <div className="flex items-center gap-2 mr-4 min-w-fit">
                    <Map className="text-leaf-600" size={28} />
                    <div>
                        <h1 className="font-bold text-earth-900 dark:text-earth-100 text-lg leading-tight">Yard Map</h1>
                        <p className="text-xs text-earth-500">Property Planner</p>
                    </div>
                </div>

                {/* Dimensions */}
                <div className="flex items-center gap-2 bg-earth-50 dark:bg-stone-800 p-2 rounded-xl border border-earth-200 dark:border-stone-700 shadow-sm min-w-fit">
                    <LayoutGrid size={20} className="text-earth-400 ml-1" />
                    <div className="flex items-center gap-2">
                         <div className="flex flex-col">
                             <label className="text-[9px] uppercase font-bold text-earth-400 ml-1">Width (ft)</label>
                             <input 
                                 type="number" 
                                 value={propWidth} 
                                 onChange={e => setPropWidth(Number(e.target.value))} 
                                 className="w-24 h-9 text-base text-center p-1 font-bold bg-white dark:bg-stone-900 border border-earth-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-leaf-500 outline-none" 
                             />
                         </div>
                         <span className="text-earth-400 text-sm font-bold mt-3">x</span>
                         <div className="flex flex-col">
                             <label className="text-[9px] uppercase font-bold text-earth-400 ml-1">Length (ft)</label>
                             <input 
                                 type="number" 
                                 value={propHeight} 
                                 onChange={e => setPropHeight(Number(e.target.value))} 
                                 className="w-24 h-9 text-base text-center p-1 font-bold bg-white dark:bg-stone-900 border border-earth-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-leaf-500 outline-none" 
                             />
                         </div>
                    </div>
                </div>

                <div className="w-px h-10 bg-earth-200 dark:bg-stone-700 hidden md:block"></div>

                {/* Zoom */}
                <div className="flex items-center bg-earth-50 dark:bg-stone-800 p-2 rounded-xl border border-earth-200 dark:border-stone-700 shadow-sm min-w-fit">
                    <button onClick={() => handleZoom('out')} className="p-2 hover:text-leaf-600 hover:bg-earth-100 rounded-lg"><ZoomOut size={20}/></button>
                    <span className="text-sm font-mono w-14 text-center font-bold" title="Pixels per Foot">{scale.toFixed(1)}x</span>
                    <button onClick={() => handleZoom('in')} className="p-2 hover:text-leaf-600 hover:bg-earth-100 rounded-lg"><ZoomIn size={20}/></button>
                </div>

                <div className="w-px h-10 bg-earth-200 dark:bg-stone-700 hidden md:block"></div>

                {/* Categories */}
                <div className="flex gap-2 min-w-fit">
                    <Button 
                        size="md" 
                        variant={activeCategory === 'structures' ? 'primary' : 'ghost'} 
                        onClick={() => setActiveCategory('structures')}
                        icon={<Home size={18}/>}
                    >
                        Structures
                    </Button>
                    <Button 
                        size="md" 
                        variant={activeCategory === 'assets' ? 'primary' : 'ghost'} 
                        onClick={() => setActiveCategory('assets')}
                        icon={<Sprout size={18}/>}
                    >
                        My Assets
                    </Button>
                </div>

                <div className="flex-grow hidden lg:block"></div>

                <Button 
                    size="md" 
                    onClick={handleSave} 
                    disabled={isSaving}
                    icon={isSaving ? <RotateCw size={18} className="animate-spin"/> : <Save size={18}/>}
                    className="ml-auto"
                >
                    {isSaving ? 'Saving...' : 'Save Layout'}
                </Button>
            </div>

            {/* --- PALETTE BAR (Contextual) --- */}
            <div className="bg-earth-50 dark:bg-stone-800 border-b border-earth-200 dark:border-stone-700 p-3 flex gap-3 overflow-x-auto scrollbar-hide shrink-0 min-h-[60px] items-center">
                {activeCategory === 'structures' && YARD_TEMPLATES.map(t => (
                    <button
                        key={t.name}
                        onClick={() => addItem(t)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-700 border border-earth-200 dark:border-stone-600 rounded-lg text-sm font-bold whitespace-nowrap hover:border-leaf-500 hover:shadow-md transition-all active:scale-95"
                    >
                        <div className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: t.color }}></div>
                        {t.name}
                    </button>
                ))}

                {activeCategory === 'assets' && (
                    <>
                        {availableTrees.length === 0 && availableHives.length === 0 && availableBeds.length === 0 && availableHerds.length === 0 && (
                            <span className="text-sm text-earth-400 italic px-4">All assets placed. Create more in specific dashboards.</span>
                        )}
                        {availableTrees.map(t => (
                            <button key={t.id} onClick={() => importAsset('tree', t)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-700 border border-earth-200 dark:border-stone-600 rounded-lg text-sm font-bold whitespace-nowrap hover:border-green-500 hover:shadow-md transition-all active:scale-95">
                                <TreeDeciduous size={16} className="text-green-600"/> {t.variety}
                            </button>
                        ))}
                        {availableHives.map(h => (
                            <button key={h.id} onClick={() => importAsset('hive', h)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-700 border border-earth-200 dark:border-stone-600 rounded-lg text-sm font-bold whitespace-nowrap hover:border-amber-500 hover:shadow-md transition-all active:scale-95">
                                <Hexagon size={16} className="text-amber-600"/> {h.name}
                            </button>
                        ))}
                        {availableBeds.map(b => (
                            <button key={b.id} onClick={() => importAsset('bed', b)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-700 border border-earth-200 dark:border-stone-600 rounded-lg text-sm font-bold whitespace-nowrap hover:border-leaf-500 hover:shadow-md transition-all active:scale-95">
                                <Square size={16} className="text-leaf-600"/> {b.name} ({b.width}x{b.length})
                            </button>
                        ))}
                        {availableHerds.map(h => (
                            <button key={h.id} onClick={() => importAsset('herd', h)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-700 border border-earth-200 dark:border-stone-600 rounded-lg text-sm font-bold whitespace-nowrap hover:border-red-400 hover:shadow-md transition-all active:scale-95">
                                <Home size={16} className="text-red-400"/> {h.name}
                            </button>
                        ))}
                    </>
                )}
            </div>

            {/* --- MAP AREA + EDITOR --- */}
            <div className="relative flex-1 overflow-hidden bg-earth-200/50">
                
                {/* --- EDITOR FLOATING PANEL --- */}
                {selectedItem && (
                    <div className="absolute top-4 right-4 z-50 w-64 animate-in slide-in-from-right-10 fade-in pointer-events-auto shadow-2xl rounded-2xl">
                        <Card className="bg-white/95 dark:bg-stone-900/95 backdrop-blur border-2 border-blue-500 p-0 overflow-hidden">
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 flex justify-between items-center border-b border-blue-100 dark:border-blue-900/50">
                                <h3 className="font-bold text-xs uppercase text-blue-700 dark:text-blue-300 pl-2">Edit Item</h3>
                                <button onClick={() => deleteItem(selectedItem.id)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 p-1.5 rounded transition-colors"><Trash2 size={14}/></button>
                            </div>
                            <div className="p-3 space-y-3">
                                {selectedItem.entityId && (
                                    <Button size="sm" variant="outline" className="w-full mb-2 text-xs h-7" onClick={() => handleViewDetails(selectedItem)}>
                                        <ExternalLink size={12} className="mr-1"/> View Details
                                    </Button>
                                )}
                                <Input 
                                    label="Label" 
                                    value={selectedItem.label} 
                                    onChange={e => updateItem(selectedItem.id, { label: e.target.value })} 
                                    className="h-8 text-xs"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input label="W (ft)" type="number" value={selectedItem.width} onChange={e => updateItem(selectedItem.id, { width: Number(e.target.value) })} className="h-8 text-xs" />
                                    <Input label="L (ft)" type="number" value={selectedItem.height} onChange={e => updateItem(selectedItem.id, { height: Number(e.target.value) })} className="h-8 text-xs" />
                                </div>
                                <div className="flex gap-2 items-end">
                                    <Button size="sm" variant="secondary" onClick={() => updateItem(selectedItem.id, { rotation: (selectedItem.rotation || 0) + 45 })} icon={<RotateCw size={12}/>} className="flex-1 h-8 text-xs">Rotate</Button>
                                    <input type="color" value={selectedItem.color} onChange={e => updateItem(selectedItem.id, { color: e.target.value })} className="h-8 w-12 rounded cursor-pointer border border-earth-200" title="Color" />
                                </div>
                                <div className="bg-earth-100 dark:bg-stone-800 p-1.5 rounded text-[10px] font-mono text-center text-earth-500">
                                    Pos: {selectedItem.x}, {selectedItem.y}
                                </div>
                                <div className="flex justify-end pt-1">
                                    <button onClick={() => setSelectedId(null)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                        <X size={12} /> Close
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* --- CANVAS CONTAINER --- */}
                {/* 
                   Using grid + place-items-center ensures the map is centered when 
                   zoomed out (smaller than viewport), while overflow-auto on this 
                   container allows scrolling when zoomed in (larger than viewport).
                */}
                <div 
                    className="w-full h-full overflow-auto cursor-grab active:cursor-grabbing grid place-items-center"
                    ref={containerRef}
                    onWheel={handleWheelZoom}
                    onClick={() => setSelectedId(null)}
                    onMouseDown={(e) => {
                        // Enable scrolling by dragging background
                        if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('grid')) {
                           // Future: Implement pan logic here if native scrollbars aren't enough
                        }
                    }}
                >
                    <div 
                        className="bg-earth-50 dark:bg-stone-900 shadow-2xl relative transition-transform duration-75 origin-center"
                        style={{
                            width: `${propWidth * scale}px`,
                            height: `${propHeight * scale}px`,
                            // Major Grid 10ft, Minor Grid 1ft
                            backgroundImage: `
                                linear-gradient(to right, rgba(0,0,0,0.2) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(0,0,0,0.2) 1px, transparent 1px)
                            `,
                            backgroundSize: `${10 * scale}px ${10 * scale}px`,
                            margin: '60px', // Margin for rulers/padding
                            border: '1px solid rgba(0,0,0,0.2)'
                        }}
                        onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                    >
                        {/* Minor Grid Lines (1ft) */}
                        <div className="absolute inset-0 pointer-events-none" style={{
                            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)`,
                            backgroundSize: `${1 * scale}px ${1 * scale}px`
                        }} />

                        {/* Rulers */}
                        <div className="absolute -top-6 left-0 right-0 h-6 overflow-hidden">{xTicks}</div>
                        <div className="absolute top-0 -left-8 bottom-0 w-8 overflow-hidden">{yTicks}</div>

                        {/* Items */}
                        {items.map(item => (
                            <DraggableItem 
                                key={item.id} 
                                item={item} 
                                isSelected={selectedId === item.id} 
                                onSelect={() => setSelectedId(item.id)}
                                onUpdate={updateItem}
                                gridScale={scale}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
