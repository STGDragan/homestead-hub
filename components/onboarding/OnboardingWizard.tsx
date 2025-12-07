
import React, { useState, useEffect } from 'react';
import { UserProfile, ExperienceLevel, HomesteadGoal } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { dbService } from '../../services/db';
import { locationService } from '../../services/location';
import { EXPERIENCE_LEVELS, HOMESTEAD_GOALS } from '../../constants';
import { Sprout, Check, MapPin, User, Star, Loader2, AlertCircle } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const STEPS = [
  { id: 'welcome', title: 'Welcome Home' },
  { id: 'basics', title: 'The Basics' },
  { id: 'interests', title: 'Goals & Interests' },
  { id: 'finalize', title: 'All Set!' }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingZone, setLoadingZone] = useState(false);
  const [errors, setErrors] = useState<{name?: string; zip?: string}>({});
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    zipCode: '',
    hardinessZone: '',
    experienceLevel: 'beginner',
    goals: [],
    interests: [],
    preferences: {
        organicOnly: false,
        useMetric: false,
        enableNotifications: true
    }
  });

  const validateStep = () => {
      const newErrors: {name?: string; zip?: string} = {};
      let isValid = true;

      if (currentStep === 1) {
          if (!formData.name || formData.name.trim().length <= 3) {
              newErrors.name = "Name must be longer than 3 characters.";
              isValid = false;
          }
          if (!formData.zipCode || !/^\d{5}$/.test(formData.zipCode)) {
              newErrors.zip = "Please enter a valid 5-digit Zip Code.";
              isValid = false;
          }
      }

      setErrors(newErrors);
      return isValid;
  };

  const nextStep = () => {
      if (validateStep()) {
          setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleZipChange = async (val: string) => {
      // Only allow numbers
      const numericVal = val.replace(/\D/g, '').slice(0, 5);
      setFormData(prev => ({ ...prev, zipCode: numericVal }));
      
      // Clear error if valid length
      if (numericVal.length === 5) {
          setErrors(prev => ({ ...prev, zip: undefined }));
          setLoadingZone(true);
          try {
              const zone = await locationService.getZoneFromZip(numericVal);
              setFormData(prev => ({ ...prev, hardinessZone: zone }));
          } catch (e) {
              console.error("Zone lookup failed", e);
          } finally {
              setLoadingZone(false);
          }
      }
  };

  const handleNameChange = (val: string) => {
      setFormData(prev => ({ ...prev, name: val }));
      if (val.length > 3) {
          setErrors(prev => ({ ...prev, name: undefined }));
      }
  };

  const handleFinish = async () => {
     // Save Profile
     const profile: UserProfile = {
        id: 'main_user',
        userId: 'main_user',
        name: formData.name!,
        zipCode: formData.zipCode!,
        hardinessZone: formData.hardinessZone || 'Unknown',
        experienceLevel: formData.experienceLevel as ExperienceLevel,
        goals: formData.goals as HomesteadGoal[],
        interests: formData.interests || [],
        preferences: formData.preferences!,
        role: 'admin', // DEMO HACK: Set first user as admin so they can see the console
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
     };
     await dbService.put('user_profile', profile);
     onComplete();
  };

  const toggleGoal = (goal: HomesteadGoal) => {
     const currentGoals = formData.goals || [];
     if (currentGoals.includes(goal)) {
        setFormData({ ...formData, goals: currentGoals.filter(g => g !== goal) });
     } else {
        setFormData({ ...formData, goals: [...currentGoals, goal] });
     }
  };

  const toggleInterest = (interest: string) => {
    const current = formData.interests || [];
    if (current.includes(interest)) {
       setFormData({ ...formData, interests: current.filter(i => i !== interest) });
    } else {
       setFormData({ ...formData, interests: [...current, interest] });
    }
  };

  // Step Renders
  const renderWelcome = () => (
     <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-leaf-100 dark:bg-leaf-900 rounded-full flex items-center justify-center mx-auto text-leaf-700 dark:text-leaf-300">
           <Sprout size={48} />
        </div>
        <div>
           <h1 className="text-3xl font-serif font-bold text-earth-900 dark:text-earth-100 mb-2">Welcome to Homestead Hub</h1>
           <p className="text-earth-600 dark:text-earth-300 max-w-md mx-auto">
              Your offline-first companion for land, livestock, and life. Let's get your profile set up to personalize your tools.
           </p>
        </div>
        <Button onClick={nextStep} size="lg" className="w-full max-w-xs mx-auto">Get Started</Button>
     </div>
  );

  const renderBasics = () => (
     <div className="space-y-6 max-w-md mx-auto">
        <div className="text-center mb-6">
           <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">About You</h2>
           <p className="text-earth-500 dark:text-earth-400">We use this to estimate frost dates and planting schedules.</p>
        </div>

        <div>
            <Input 
                label="What should we call you?"
                icon={<User size={18} />}
                placeholder="First Name (min 4 chars)"
                value={formData.name}
                onChange={e => handleNameChange(e.target.value)}
                error={errors.name}
                autoFocus
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
               <Input 
                  label="Zip Code"
                  icon={<MapPin size={18} />}
                  placeholder="12345"
                  value={formData.zipCode}
                  onChange={e => handleZipChange(e.target.value)}
                  maxLength={5}
                  error={errors.zip}
               />
           </div>
           
           <div className="relative">
               <Input 
                  label="Zone"
                  placeholder="e.g. 6b"
                  value={formData.hardinessZone}
                  onChange={e => setFormData({ ...formData, hardinessZone: e.target.value })}
                  // Allow manual override, but show visual indicator it's calculated
                  className={loadingZone ? "opacity-50" : ""}
               />
               {loadingZone && (
                   <div className="absolute right-3 top-[38px]">
                       <Loader2 size={16} className="animate-spin text-leaf-600" />
                   </div>
               )}
               {!loadingZone && formData.hardinessZone && (
                   <div className="absolute right-3 top-[38px] text-xs font-bold text-leaf-600">
                       Auto-Set
                   </div>
               )}
           </div>
        </div>
        
        {formData.hardinessZone && (
            <div className="bg-leaf-50 dark:bg-leaf-900/20 p-3 rounded-lg border border-leaf-200 dark:border-leaf-800 flex items-start gap-2 text-sm text-leaf-800 dark:text-leaf-300">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>We've estimated you are in Zone <strong>{formData.hardinessZone}</strong> based on your Zip. This will calibrate your planting calendar.</p>
            </div>
        )}

        <div className="pt-4">
           <Button 
             onClick={nextStep} 
             className="w-full" 
           >
              Next Step
           </Button>
        </div>
     </div>
  );

  const renderInterests = () => (
     <div className="space-y-6">
        <div className="text-center mb-6">
           <h2 className="text-xl font-serif font-bold text-earth-900 dark:text-earth-100">Experience & Goals</h2>
           <p className="text-earth-500 dark:text-earth-400">Tailors our AI advice to your needs.</p>
        </div>

        {/* Experience Level */}
        <div>
           <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-3">Experience Level</label>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {EXPERIENCE_LEVELS.map(level => (
                 <button
                    key={level.id}
                    onClick={() => setFormData({ ...formData, experienceLevel: level.id })}
                    className={`p-3 rounded-xl border-2 text-left transition-all 
                        ${formData.experienceLevel === level.id 
                            ? 'border-leaf-500 bg-leaf-50 dark:bg-leaf-900/20' 
                            : 'border-earth-200 dark:border-stone-700 hover:border-earth-300 dark:hover:border-stone-500'}`}
                 >
                    <div className="font-bold text-earth-900 dark:text-earth-100">{level.label}</div>
                    <div className="text-xs text-earth-500 dark:text-stone-400">{level.description}</div>
                 </button>
              ))}
           </div>
        </div>

        {/* Goals */}
        <div>
           <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-3">Primary Goals</label>
           <div className="flex flex-wrap gap-2">
              {HOMESTEAD_GOALS.map(goal => (
                 <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors 
                        ${formData.goals?.includes(goal.id) 
                            ? 'bg-earth-800 text-white border-earth-800 dark:bg-leaf-600 dark:border-leaf-600' 
                            : 'bg-white dark:bg-stone-800 text-earth-600 dark:text-stone-300 border-earth-200 dark:border-stone-600'}`}
                 >
                    {goal.label}
                 </button>
              ))}
           </div>
        </div>
        
        {/* Module Interests */}
        <div>
           <label className="block text-sm font-bold text-earth-700 dark:text-earth-300 mb-3">What are you managing?</label>
           <div className="grid grid-cols-2 gap-3">
              {['Garden', 'Livestock', 'Orchard', 'Bees'].map(i => (
                 <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all 
                        ${formData.interests?.includes(i) 
                            ? 'bg-leaf-100 dark:bg-leaf-900/30 border-leaf-400 dark:border-leaf-600 text-leaf-900 dark:text-leaf-200' 
                            : 'bg-white dark:bg-stone-800 border-earth-200 dark:border-stone-700 text-earth-600 dark:text-stone-400'}`}
                 >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center 
                        ${formData.interests?.includes(i) 
                            ? 'bg-leaf-600 border-leaf-600 text-white' 
                            : 'bg-white dark:bg-stone-700 border-earth-300 dark:border-stone-500'}`}>
                       {formData.interests?.includes(i) && <Check size={12} />}
                    </div>
                    <span className="font-bold">{i}</span>
                 </button>
              ))}
           </div>
        </div>

        <div className="pt-4">
           <Button onClick={nextStep} className="w-full">Next Step</Button>
        </div>
     </div>
  );

  const renderFinalize = () => (
     <div className="text-center space-y-6 max-w-sm mx-auto">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-4 animate-bounce">
           <Star size={40} fill="currentColor" />
        </div>
        
        <div>
           <h2 className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100 mb-2">You're All Set, {formData.name}!</h2>
           <p className="text-earth-600 dark:text-earth-300">
              We've configured your dashboard for <strong>{formData.experienceLevel}</strong> mode. 
              {formData.hardinessZone ? ` Weather alerts set for Zone ${formData.hardinessZone}.` : ''}
           </p>
        </div>

        <div className="bg-earth-50 dark:bg-stone-800 p-4 rounded-xl text-left text-sm border border-earth-200 dark:border-stone-700 space-y-2">
           <p className="text-earth-900 dark:text-earth-100"><strong>Next Steps:</strong></p>
           <ul className="list-disc list-inside text-earth-600 dark:text-earth-400 space-y-1">
              <li>Add your first garden bed</li>
              <li>Log any existing animals</li>
              <li>Check local weather alerts</li>
           </ul>
        </div>

        <Button onClick={handleFinish} size="lg" className="w-full shadow-lg shadow-leaf-500/30">
           Enter Dashboard
        </Button>
     </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-earth-100 dark:bg-stone-950 flex flex-col">
       {/* Progress Bar */}
       <div className="h-1.5 bg-earth-200 dark:bg-stone-800 w-full">
          <div 
             className="h-full bg-leaf-600 transition-all duration-500 ease-out"
             style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
       </div>

       {/* Content */}
       <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-xl border border-earth-200 dark:border-stone-800">
             {currentStep === 0 && renderWelcome()}
             {currentStep === 1 && renderBasics()}
             {currentStep === 2 && renderInterests()}
             {currentStep === 3 && renderFinalize()}
          </div>
       </div>

       {/* Back Button (except on first/last step) */}
       {currentStep > 0 && currentStep < 3 && (
          <div className="p-4 text-center">
             <button onClick={prevStep} className="text-earth-500 hover:text-earth-800 dark:text-stone-400 dark:hover:text-stone-200 font-bold text-sm">
                Back
             </button>
          </div>
       )}
    </div>
  );
};
