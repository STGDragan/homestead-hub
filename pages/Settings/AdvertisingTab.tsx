
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { Sponsor, UserProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Megaphone, CheckCircle, HelpCircle } from 'lucide-react';

export const AdvertisingTab: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await dbService.get<UserProfile>('user_profile', 'main_user');
    if (user) {
        setProfile(user);
        setContactName(user.name);
        setEmail(user.email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const sponsor: Sponsor = {
          id: crypto.randomUUID(),
          name: companyName,
          contactName: contactName,
          contactEmail: email,
          status: 'lead',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };

      await dbService.put('sponsors', sponsor);
      setSubmitted(true);
  };

  if (submitted) {
      return (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-earth-200 dark:border-stone-800 text-center animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-6">
                  <CheckCircle size={48} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100 mb-2">Application Received</h2>
              <p className="text-earth-600 dark:text-stone-300 max-w-md mx-auto mb-6">
                  Thanks for your interest in partnering with Homestead Hub! Our team will review your details and contact <strong>{email}</strong> shortly.
              </p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>Submit Another</Button>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
       
       <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex-shrink-0 space-y-4">
             <div className="p-4 bg-leaf-800 rounded-xl text-white">
                <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                   <Megaphone size={20} className="text-leaf-300" /> Partner Program
                </h3>
                <p className="text-xs text-leaf-100 mt-2 opacity-90 leading-relaxed">
                   Reach thousands of local homesteaders. Advertise your feed store, equipment, or services directly in the app.
                </p>
             </div>
             
             <Card className="bg-earth-50 dark:bg-stone-800 border-none">
                <h4 className="font-bold text-sm text-earth-800 dark:text-earth-200 mb-2 flex items-center gap-2">
                    <HelpCircle size={14} /> Why Sponsor?
                </h4>
                <ul className="text-xs space-y-2 text-earth-600 dark:text-stone-400">
                    <li>• Local geographic targeting</li>
                    <li>• High-intent audience</li>
                    <li>• Support the community</li>
                </ul>
             </Card>
          </div>

          <div className="flex-1">
             <Card className="p-6">
                <h3 className="font-bold text-xl text-earth-900 dark:text-earth-100 mb-1">Become a Sponsor</h3>
                <p className="text-sm text-earth-500 dark:text-stone-400 mb-6">Fill out the form below to get started.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        label="Company / Farm Name"
                        placeholder="e.g. Valley Feed & Seed"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        required
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                        <Input 
                            label="Contact Name"
                            value={contactName}
                            onChange={e => setContactName(e.target.value)}
                            required
                        />
                        <Input 
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <TextArea 
                        label="Tell us about your business"
                        placeholder="What products or services do you offer? What creates a good partnership for you?"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="h-32"
                    />

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" size="lg" className="px-8">Submit Application</Button>
                    </div>
                </form>
             </Card>
          </div>
       </div>
    </div>
  );
};
