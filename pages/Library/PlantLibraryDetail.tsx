
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { libraryService } from '../../services/libraryService';
import { PlantTemplate, PlantDiscussion } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, TextArea } from '../../components/ui/Input';
import { ArrowLeft, Edit2, Upload, MessageSquare, Send, User } from 'lucide-react';
import { CustomPlantModal } from '../../components/garden/CustomPlantModal';

export const PlantLibraryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<PlantTemplate | null>(null);
  const [discussions, setDiscussions] = useState<PlantDiscussion[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (plantId: string) => {
    const p = await libraryService.getPlant(plantId);
    if (p) {
        setPlant(p);
        const d = await libraryService.getDiscussions(p.name);
        setDiscussions(d);
    }
  };

  const handleUpdate = async (updated: PlantTemplate) => {
      const saved = await libraryService.savePlant(updated);
      setPlant(saved);
      setIsEditing(false);
      // Update ID in url if it changed from system to custom
      if (saved.id !== id) navigate(`/library/plant/${saved.id}`, { replace: true });
  };

  const handlePostComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!plant || !newComment.trim()) return;
      await libraryService.addDiscussion(plant.name, newComment, 'main_user');
      setNewComment('');
      const d = await libraryService.getDiscussions(plant.name);
      setDiscussions(d);
  };

  if (!plant) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
       
       <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/library')} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
             <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
             <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100">{plant.name}</h1>
             <p className="text-earth-600 dark:text-stone-400">{plant.defaultVariety}</p>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(true)} icon={<Edit2 size={16}/>}>Edit Info</Button>
       </div>

       <div className="grid md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-6">
             {/* Hero Image */}
             <div className="h-64 rounded-2xl overflow-hidden bg-earth-200 dark:bg-stone-800 relative group">
                {plant.imageUrl ? (
                   <img src={plant.imageUrl} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-earth-400 dark:text-stone-600">No Image Available</div>
                )}
             </div>

             <Card>
                <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100 mb-4 border-b border-earth-100 dark:border-stone-800 pb-2">Description</h3>
                <p className="text-earth-700 dark:text-stone-300 leading-relaxed mb-6">{plant.description || 'No description provided.'}</p>
                
                <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100 mb-4 border-b border-earth-100 dark:border-stone-800 pb-2">Care Instructions</h3>
                <p className="text-earth-700 dark:text-stone-300 leading-relaxed italic">{plant.careInstructions || 'No care tips yet.'}</p>
             </Card>

             {/* Discussions */}
             <div className="space-y-4">
                <h3 className="font-bold text-lg text-earth-900 dark:text-earth-100 flex items-center gap-2">
                   <MessageSquare size={20} className="text-leaf-600"/> Community & Notes
                </h3>
                
                <form onSubmit={handlePostComment} className="flex gap-3 items-start bg-white dark:bg-stone-900 p-4 rounded-xl border border-earth-200 dark:border-stone-800">
                   <TextArea 
                      placeholder={`Share your experience growing ${plant.name}...`}
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      className="min-h-[80px]"
                   />
                   <Button type="submit" className="h-12 w-12 p-0 flex items-center justify-center rounded-xl"><Send size={20}/></Button>
                </form>

                <div className="space-y-3">
                   {discussions.length === 0 && <p className="text-earth-400 italic text-center py-4">No discussions yet. Be the first!</p>}
                   {discussions.map(post => (
                      <div key={post.id} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-earth-100 dark:border-stone-800 shadow-sm flex gap-3">
                         <div className="w-8 h-8 bg-earth-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-earth-500">
                            <User size={16} />
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="font-bold text-sm text-earth-900 dark:text-earth-100">{post.userName}</span>
                               <span className="text-xs text-earth-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-earth-700 dark:text-stone-300">{post.content}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <Card className="bg-earth-50 dark:bg-stone-800 border-earth-100 dark:border-stone-700">
                <h3 className="font-bold text-earth-900 dark:text-earth-100 mb-4 text-sm uppercase tracking-wider">Quick Stats</h3>
                <div className="space-y-3 text-sm">
                   <div className="flex justify-between">
                      <span className="text-earth-500 dark:text-stone-400">Days to Harvest</span>
                      <span className="font-bold text-earth-800 dark:text-earth-200">{plant.daysToMaturity}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-earth-500 dark:text-stone-400">Spacing</span>
                      <span className="font-bold text-earth-800 dark:text-earth-200">{plant.spacing}"</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-earth-500 dark:text-stone-400">Height</span>
                      <span className="font-bold text-earth-800 dark:text-earth-200 capitalize">{plant.height}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-earth-500 dark:text-stone-400">Hardiness Zones</span>
                      <span className="font-bold text-earth-800 dark:text-earth-200">{plant.hardinessZones.join(', ')}</span>
                   </div>
                </div>
             </Card>
          </div>
       </div>

       {isEditing && (
          <CustomPlantModal 
             onSave={handleUpdate} 
             onClose={() => setIsEditing(false)}
          />
       )}
    </div>
  );
};
