
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { orchardAI, ProposedTree, OrchardConfig } from '../../services/orchardAI';
import { orchardService } from '../../services/orchardService';
import { dbService } from '../../services/db';
import { OrchardTree, YardItem } from '../../types';
import { ArrowLeft, Ruler, Ban, Wand2, CheckCircle, Save, Home, AlertCircle, MapPin } from 'lucide-react';
import { TREE_SPECIES } from '../../constants';
import { OrchardMap } from '../../components/orchard/OrchardMap';

type Step = 'dimensions' | 'zoning' | 'wizard' | 'review';

export const OrchardLayoutTool: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('dimensions');
    
    // Config State
    const [width, setWidth] = useState(100);
    const [length, setLength] = useState(100);
    const [exclusions, setExclusions] = useState<Set<string>>(new Set());
    const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
    const [yieldGoal, setYieldGoal] = useState<'low' | 'medium' | 'high'>('medium');
    const [maxHeight, setMaxHeight] = useState<'short' | 'medium' | 'tall'>('medium');
    
    // External Map Data
    const [yardItems, setYardItems] = useState<YardItem[]>([]);
    const [mapDimensions, setMapDimensions] = useState<{width: number, height: number}>({ width: 100, height: 100 });
    const [availableZones, setAvailableZones] = useState<YardItem[]>([]);
    const [selectedZoneId, setSelectedZoneId] = useState<string>('full_property');
    
    // Result State
    const [proposedTrees, setProposedTrees] = useState<ProposedTree[]>([]);

    useEffect(() => {
        const init = async () => {
            // 1. Load Map Settings
            const settings = await dbService.get<{width: number, height: number}>('yard_settings', 'main_map');
            if (settings) {
                setMapDimensions({ width: settings.width, height: settings.height });
                // Default to map size initially
                setWidth(settings.width);
                setLength(settings.height);
            }
            
            // 2. Load Yard Items
            const items = await dbService.getAll<YardItem>('yard_items');
            setYardItems(items);

            // 3. Identify potential Orchard Zones
            const zones = items.filter(i => i.type === 'zone');
            setAvailableZones(zones);

            // Auto-select if there's a zone named "Orchard"
            const orchardZone = zones.find(z => z.label.toLowerCase().includes('orchard') || z.subType.includes('orchard'));
            if (orchardZone) {
                handleZoneChange(orchardZone.id, orchardZone, items);
            }
        };
        init();
    }, []);

    const handleZoneChange = (zoneId: string, zone?: YardItem, allItems: YardItem[] = yardItems) => {
        setSelectedZoneId(zoneId);
        setExclusions(new Set()); // Clear manual exclusions on resize

        if (zoneId === 'full_property' || !zone) {
            setWidth(mapDimensions.width);
            setLength(mapDimensions.height);
        } else {
            setWidth(zone.width);
            setLength(zone.height);
        }
    };

    // --- Coordinate Helpers ---

    // Get the top-left global coordinate of the current planning area
    const getOrigin = () => {
        if (selectedZoneId === 'full_property') return { x: 0, y: 0 };
        const zone = availableZones.find(z => z.id === selectedZoneId);
        if (!zone) return { x: 0, y: 0 };
        
        // YardItem x/y are center-based. Convert to top-left.
        return {
            x: zone.x - (zone.width / 2),
            y: zone.y - (zone.height / 2)
        };
    };

    // Helper: Check if a local grid cell is occupied by ANY global Yard Item
    const getOccupant = (gridX: number, gridY: number): YardItem | null => {
        const origin = getOrigin();

        // Local Cell bounds (ft)
        const cellLocalL = gridX * 5;
        const cellLocalT = gridY * 5;
        
        // Convert to Global bounds (ft)
        const globalL = origin.x + cellLocalL;
        const globalT = origin.y + cellLocalT;
        const globalR = globalL + 5;
        const globalB = globalT + 5;

        for (const item of yardItems) {
            // Ignore the zone itself if we are planning inside it
            if (item.id === selectedZoneId) continue;

            // Ignore non-physical items
            if (!['structure', 'infrastructure', 'tree', 'hive'].includes(item.type) && item.subType !== 'tree') continue;

            // Item bounds in global feet (x/y are center)
            const itemL = item.x - (item.width / 2);
            const itemR = item.x + (item.width / 2);
            const itemT = item.y - (item.height / 2);
            const itemB = item.y + (item.height / 2);

            // Check overlap
            const overlaps = (
                globalL < itemR &&
                globalR > itemL &&
                globalT < itemB &&
                globalB > itemT
            );

            if (overlaps) return item;
        }
        return null;
    };

    // Grid Calculations (1 cell = 5x5 ft)
    const gridCols = Math.floor(width / 5);
    const gridRows = Math.floor(length / 5);

    const toggleExclusion = (x: number, y: number) => {
        if (getOccupant(x, y)) return; // Prevent toggling if physically blocked

        const key = `${x},${y}`;
        const newSet = new Set(exclusions);
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        setExclusions(newSet);
    };

    const toggleFruit = (id: string) => {
        if (selectedFruits.includes(id)) setSelectedFruits(selectedFruits.filter(f => f !== id));
        else setSelectedFruits([...selectedFruits, id]);
    };

    const generatePlan = () => {
        if (selectedFruits.length === 0) {
            alert("Please select at least one fruit species.");
            return;
        }

        const finalExclusions: { x: number, y: number }[] = [];
        
        // 1. Manual
        exclusions.forEach(s => {
            const [x, y] = (s as string).split(',').map(Number);
            finalExclusions.push({ x, y });
        });

        // 2. Physical Structures (Auto-exclude)
        for(let y = 0; y < gridRows; y++) {
            for(let x = 0; x < gridCols; x++) {
                if (getOccupant(x, y)) {
                    finalExclusions.push({ x, y });
                }
            }
        }

        const config: OrchardConfig = {
            width,
            length,
            exclusions: finalExclusions,
            fruits: selectedFruits,
            yieldGoal,
            maxHeight
        };
        const plan = orchardAI.generateLayout(config);
        setProposedTrees(plan);
        setStep('review');
    };

    const saveOrchard = async () => {
        const origin = getOrigin();

        for (const pt of proposedTrees) {
            // Convert Local Grid coordinates (ft) to Global Map Coordinates (ft)
            // pt.gridX is feet from left of planning area
            const globalXFt = origin.x + pt.gridX;
            const globalYFt = origin.y + pt.gridY;

            // Convert Global Feet to Global Percentage (0-100) for storage
            const globalXPct = (globalXFt / mapDimensions.width) * 100;
            const globalYPct = (globalYFt / mapDimensions.height) * 100;

            const tree: OrchardTree = {
                id: crypto.randomUUID(),
                species: pt.species,
                variety: pt.variety,
                rootstock: pt.rootstock,
                plantedDate: Date.now(),
                ageYears: 0,
                location: { x: globalXPct, y: globalYPct },
                status: 'ordered',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            };
            await orchardService.addTree(tree);
        }
        alert(`Saved ${proposedTrees.length} trees to your Orchard Map!`);
        navigate('/orchard');
    };

    // For preview, we just use the local coordinates directly since OrchardMap preview uses the local dimensions
    const previewTrees: OrchardTree[] = proposedTrees.map((pt, i) => ({
        id: `preview_${i}`,
        species: pt.species,
        variety: pt.variety,
        rootstock: pt.rootstock,
        plantedDate: Date.now(),
        ageYears: 0,
        location: { x: pt.x, y: pt.y }, // These are local percentages generated by AI
        status: 'ordered',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    }));

    // --- Renderers ---

    const renderGrid = (interactive: boolean = false) => {
        const cells = [];
        for (let y = 0; y < gridRows; y++) {
            for (let x = 0; x < gridCols; x++) {
                const isExcluded = exclusions.has(`${x},${y}`);
                const occupant = getOccupant(x, y);
                
                cells.push(
                    <div 
                        key={`${x}-${y}`}
                        onMouseDown={() => interactive && toggleExclusion(x, y)}
                        onMouseEnter={(e) => {
                            if (interactive && e.buttons === 1) toggleExclusion(x, y);
                        }}
                        className={`
                            border-r border-b border-earth-200/50 dark:border-stone-800/50 relative flex items-center justify-center
                            ${occupant ? 'bg-stone-300/50 dark:bg-stone-700/50 cursor-not-allowed' : ''}
                            ${!occupant && interactive ? 'cursor-pointer hover:bg-earth-200' : ''}
                            ${isExcluded ? 'bg-red-200 dark:bg-red-900/50' : ''}
                        `}
                        title={occupant ? `Blocked by ${occupant.label}` : `Grid: ${x},${y}`}
                    >
                        {occupant && <div className="w-1.5 h-1.5 rounded-full bg-stone-500/50"></div>}
                    </div>
                );
            }
        }
        return (
            <div 
                className="grid w-full h-full border-2 border-earth-300 dark:border-stone-700 rounded-lg overflow-hidden select-none bg-earth-50 dark:bg-stone-900"
                style={{
                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                    gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                    aspectRatio: `${gridCols}/${gridRows}`
                }}
            >
                {cells}
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row gap-4 animate-in fade-in">
            {/* Sidebar Controls */}
            <div className="w-full md:w-80 flex-shrink-0 bg-white dark:bg-stone-900 border-r border-earth-200 dark:border-stone-800 p-6 overflow-y-auto flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/garden')} className="pl-0"><ArrowLeft size={16}/></Button>
                    <h1 className="font-serif font-bold text-xl text-earth-900 dark:text-earth-100">Orchard Planner</h1>
                </div>

                {/* Progress Stepper */}
                <div className="flex justify-between mb-8 text-xs font-bold text-earth-400">
                    <span className={step === 'dimensions' ? 'text-leaf-600' : ''}>1. Area</span>
                    <span className={step === 'zoning' ? 'text-leaf-600' : ''}>2. Zones</span>
                    <span className={step === 'wizard' ? 'text-leaf-600' : ''}>3. Plants</span>
                    <span className={step === 'review' ? 'text-leaf-600' : ''}>4. Plan</span>
                </div>

                {step === 'dimensions' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">Planning Area</label>
                            {availableZones.length > 0 ? (
                                <Select 
                                    value={selectedZoneId} 
                                    onChange={e => {
                                        const z = availableZones.find(az => az.id === e.target.value);
                                        handleZoneChange(e.target.value, z);
                                    }}
                                >
                                    <option value="full_property">Full Property ({mapDimensions.width}x{mapDimensions.height})</option>
                                    {availableZones.map(z => (
                                        <option key={z.id} value={z.id}>{z.label} ({z.width}x{z.height})</option>
                                    ))}
                                </Select>
                            ) : (
                                <div className="text-xs text-earth-500 italic bg-earth-50 p-2 rounded">
                                    No zones defined in Map. Using full property dimensions.
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-earth-600 dark:text-stone-300">Dimensions (ft)</p>
                            <Input label="Width" type="number" value={width} onChange={e => setWidth(Number(e.target.value))} />
                            <Input label="Length" type="number" value={length} onChange={e => setLength(Number(e.target.value))} />
                        </div>

                        <Button className="w-full" onClick={() => setStep('zoning')}>Next: Zoning <Ruler size={16} className="ml-2"/></Button>
                    </div>
                )}

                {step === 'zoning' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 text-sm text-red-800 dark:text-red-200">
                            <p className="font-bold flex items-center gap-2 mb-1"><Ban size={16}/> Exclusion Zones</p>
                            <p className="mb-2">Click cells to mark unplantable areas (rocky soil, pathways).</p>
                            <p className="text-xs border-t border-red-200 dark:border-red-800 pt-2 mt-2 flex items-center gap-1">
                                <Home size={12}/> Existing structures from your map are shown in gray.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setStep('dimensions')} className="flex-1">Back</Button>
                            <Button onClick={() => setStep('wizard')} className="flex-1">Next: Trees</Button>
                        </div>
                    </div>
                )}

                {step === 'wizard' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">Select Species</label>
                            <div className="flex flex-wrap gap-2">
                                {TREE_SPECIES.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => toggleFruit(s.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedFruits.includes(s.id) ? 'bg-leaf-600 text-white border-leaf-600' : 'bg-earth-50 dark:bg-stone-800 text-earth-600 dark:text-stone-400 border-earth-200 dark:border-stone-700'}`}
                                    >
                                        {s.label.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">Target Yield</label>
                            <Select value={yieldGoal} onChange={e => setYieldGoal(e.target.value as any)}>
                                <option value="low">Personal Use (2 trees/species)</option>
                                <option value="medium">Family Supply (4 trees/species)</option>
                                <option value="high">Market / Max Production</option>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-2">Max Tree Height</label>
                            <Select value={maxHeight} onChange={e => setMaxHeight(e.target.value as any)}>
                                <option value="short">Short (easy pick, no ladder)</option>
                                <option value="medium">Medium (standard ladder)</option>
                                <option value="tall">Tall (Full shade)</option>
                            </Select>
                            <p className="text-xs text-earth-500 mt-1">Determines rootstock and spacing.</p>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setStep('zoning')} className="flex-1">Back</Button>
                            <Button onClick={generatePlan} className="flex-1" icon={<Wand2 size={16}/>}>Generate</Button>
                        </div>
                    </div>
                )}

                {step === 'review' && (
                    <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-200 dark:border-green-800">
                            <h3 className="font-bold text-green-900 dark:text-green-100 flex items-center gap-2 mb-2">
                                <CheckCircle size={18}/> Plan Generated!
                            </h3>
                            <ul className="text-sm space-y-1 text-green-800 dark:text-green-200">
                                <li>• <strong>{proposedTrees.length}</strong> Trees Placed</li>
                                <li>• Rootstock: <strong>{proposedTrees[0]?.rootstock || 'N/A'}</strong></li>
                                <li>• Est. Yield: <strong>{proposedTrees.reduce((a,b)=>a+b.yieldEst,0)}</strong> lbs/yr</li>
                            </ul>
                        </div>

                        <div className="text-sm text-earth-600 dark:text-stone-300">
                            <p className="font-bold mb-2">Tree List:</p>
                            <div className="max-h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                {proposedTrees.map((t, i) => (
                                    <div key={i} className="flex justify-between items-center bg-earth-50 dark:bg-stone-800 p-2 rounded">
                                        <span>{t.species}</span>
                                        <span className="text-xs opacity-70">Grid: {t.gridX},{t.gridY}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setStep('wizard')} className="flex-1">Edit</Button>
                            <Button onClick={saveOrchard} className="flex-[2]" icon={<Save size={16}/>}>Save to Map</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Stage (Map) */}
            <div className="flex-1 bg-earth-100 dark:bg-black p-8 flex items-center justify-center overflow-hidden relative">
                {step !== 'review' ? (
                    // Grid Editing Mode
                    <div className="w-full h-full max-w-[80vh] max-h-[80vh] aspect-square shadow-2xl relative">
                        {renderGrid(step === 'zoning')}
                        
                        {/* Legend Overlay */}
                        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-stone-800/90 p-2 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-sm pointer-events-none">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-3 h-3 bg-red-200 border border-red-300 rounded-sm"></div>
                                <span className="text-earth-600 dark:text-stone-300">Exclusion Zone</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-stone-300 border border-stone-400 rounded-sm"></div>
                                <span className="text-earth-600 dark:text-stone-300">Structure / Blocked</span>
                            </div>
                        </div>
                        
                        {selectedZoneId !== 'full_property' && (
                            <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 pointer-events-none">
                                <MapPin size={12} /> Planning in: {availableZones.find(z => z.id === selectedZoneId)?.label}
                            </div>
                        )}
                    </div>
                ) : (
                    // Preview Mode using standard OrchardMap with explicit Dimensions
                    <div className="w-full h-full max-w-[80vh] max-h-[80vh] aspect-square shadow-2xl">
                        <OrchardMap 
                            trees={previewTrees} 
                            onTreeClick={() => {}} 
                            orchardDimensions={{ width, length }} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
