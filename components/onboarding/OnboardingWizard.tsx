import React, { useState } from 'react';
import { UserProfile, ExperienceLevel, HomesteadGoal } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { locationService } from '../../services/location';
import { authService } from '../../services/auth';
import { supabase } from '../../services/supabaseClient';
import { EXPERIENCE_LEVELS, HOMESTEAD_GOALS } from '../../constants';
import {
  Sprout,
  Check,
  MapPin,
  User,
  Star,
  Loader2,
  AlertCircle,
  Mail,
  Lock
} from 'lucide-react';

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
  const [errors, setErrors] = useState<{name?: string; zip?: string; email?: string; password?: string}>({});

  const [formData, setFormData] = useState<any>({
    name: '',
    zipCode: '',
    hardinessZone: '',
    experienceLevel: 'beginner',
    goals: [],
    interests: [],
    email: '',
    password: '',
    preferences: {
      organicOnly: false,
      useMetric: false,
      enableNotifications: true
    }
  });

  const validateStep = () => {
    const newErrors: typeof errors = {};
    let valid = true;

    if (currentStep === 1) {
      if (!formData.name || formData.name.length < 3) {
        newErrors.name = 'Name must be at least 3 characters';
        valid = false;
      }
      if (!/^\d{5}$/.test(formData.zipCode)) {
        newErrors.zip = 'Valid 5-digit zip required';
        valid = false;
      }
      if (!formData.email) {
        newErrors.email = 'Email required';
        valid = false;
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Min 6 characters';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const nextStep = () => validateStep() && setCurrentStep(s => Math.min(s + 1, 3));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));

  const handleZipChange = async (val: string) => {
    const zip = val.replace(/\D/g, '').slic
