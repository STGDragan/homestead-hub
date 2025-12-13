


import React, { useEffect, useState } from 'react';
import { authService } from './services/auth';

useEffect(() => {
  authService.getSession();
}, []);
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SettingsDashboard } from './pages/Settings/SettingsDashboard';
import { TasksDashboard } from './pages/Tasks/TasksDashboard';
import { GardenDashboard } from './pages/Garden/GardenDashboard';
import { GardenBedDetail } from './pages/Garden/GardenBedDetail';
import { GardenLayoutTool } from './pages/Garden/GardenLayoutTool';
import { PlantCatalog } from './pages/Library/PlantCatalog';
import { PlantLibraryDetail } from './pages/Library/PlantLibraryDetail';
import { LivestockDashboard } from './pages/Livestock/LivestockDashboard';
import { AnimalList } from './pages/Livestock/AnimalList';
import { AnimalProfile } from './pages/Livestock/AnimalProfile';
import { HerdDetail } from './pages/Livestock/HerdDetail';
import { OffspringList } from './pages/Livestock/OffspringList';
import { OffspringDetail } from './pages/Livestock/OffspringDetail';
import { BreedingDashboard } from './pages/Livestock/BreedingDashboard';
import { RecipeDashboard } from './pages/Recipes/RecipeDashboard';
import { RecipeDetail } from './pages/Recipes/RecipeDetail';
import { MarketplaceDashboard } from './pages/Marketplace/MarketplaceDashboard';
import { SeedDashboard } from './pages/Journal/SeedDashboard';
import { FinanceDashboard } from './pages/Finances/FinanceDashboard';
import { HealthDashboard } from './pages/Health/HealthDashboard';
import { WeatherDashboard } from './pages/Weather/WeatherDashboard';
import { DocumentationDashboard } from './pages/Docs/DocumentationDashboard';
import { HelpCenter } from './pages/Help/HelpCenter';
import { ReportsDashboard } from './pages/Reports/ReportsDashboard';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminDocs } from './pages/Admin/AdminDocs';
import { SubscriptionAdmin } from './pages/Admin/SubscriptionAdmin';
import { MessagingDashboard } from './pages/Messaging/MessagingDashboard';
import { SyncDashboard } from './pages/Sync/SyncDashboard'; 
import { OrchardDashboard } from './pages/Orchard/OrchardDashboard';
import { TreeDetail } from './pages/Orchard/TreeDetail';
import { ApiaryDashboard } from './pages/Beekeeping/ApiaryDashboard';
import { HiveDetail } from './pages/Beekeeping/HiveDetail';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { AuthModal } from './components/auth/AuthModal';
import { RoleGuard } from './components/auth/RoleGuard';
import { dbService } from './services/db';
import { authService } from './services/auth';
import { subscriptionService } from './services/subscriptionService';
import { libraryService } from './services/libraryService';
import { UserProfile } from './types';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authKey, setAuthKey] = useState(0); // Used to force re-render on auth change

  const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      setIsAuthenticated(!!user);
      
      // If not authenticated, check if we need onboarding (no profile implies fresh install)
      if (!user) {
          const profile = await dbService.get<UserProfile>('user_profile', 'main_user');
          setShowOnboarding(!profile);
      } else {
          setShowOnboarding(false);
      }
      setLoading(false);
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        await subscriptionService.initializePlans(); // Seed Plans
        await libraryService.initSystemPlants(); // Seed Library
        await libraryService.initSystemAnimals(); // Seed Animals
        await checkAuth();
      } catch (e) {
        console.error("App init failed:", e);
        setLoading(false);
      }
    };
    initApp();

    const handleAuthChange = async () => {
        setAuthKey(prev => prev + 1);
        await checkAuth();
        // Ensure user lands on dashboard after logout/login to reset view state
        if (window.location.hash !== '#/') {
             window.location.hash = '#/';
        }
    };
    window.addEventListener('auth-change', handleAuthChange);
    
    // Add Storage Event Listener for cross-tab sync
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'auth_session') {
            handleAuthChange();
        }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('auth-change', handleAuthChange);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleOnboardingComplete = () => {
    window.location.hash = '/';
    // Re-check auth logic (Onboarding now registers user)
    checkAuth();
  };

  const handleLoginSuccess = () => {
      checkAuth();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-100 text-earth-600 dark:bg-night-950 dark:text-night-400">
        <div className="animate-pulse flex flex-col items-center">
           <span className="text-2xl font-serif font-bold mb-2">Homestead Hub</span>
           <span>Loading your farm...</span>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-earth-800 dark:bg-stone-950">
              <AuthModal 
                  isOpen={true} 
                  onClose={() => {}} 
                  onSuccess={handleLoginSuccess} 
                  canClose={false}
              />
          </div>
      );
  }

  return (
    <HashRouter>
      <Layout key={authKey}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          
          <Route path="/garden" element={<GardenDashboard />} />
          <Route path="/garden/bed/:id" element={<GardenBedDetail />} />
          <Route path="/garden/layout/:id" element={<GardenLayoutTool />} />
          <Route path="/seeds" element={<SeedDashboard />} />
          
          <Route path="/library" element={<PlantCatalog />} />
          <Route path="/library/plant/:id" element={<PlantLibraryDetail />} />

          <Route path="/orchard" element={<OrchardDashboard />} />
          <Route path="/orchard/tree/:id" element={<TreeDetail />} />

          <Route path="/apiary" element={<ApiaryDashboard />} />
          <Route path="/apiary/hive/:id" element={<HiveDetail />} />

          <Route path="/animals" element={<LivestockDashboard />} />
          <Route path="/animals/list" element={<AnimalList />} />
          <Route path="/animals/profile/:id" element={<AnimalProfile />} />
          <Route path="/animals/herd/:id" element={<HerdDetail />} />
          <Route path="/animals/offspring" element={<OffspringList />} />
          <Route path="/animals/offspring/:id" element={<OffspringDetail />} />
          <Route path="/animals/breeding" element={<BreedingDashboard />} />
          
          <Route path="/tasks" element={<TasksDashboard />} />
          <Route path="/recipes" element={<RecipeDashboard />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/marketplace" element={<MarketplaceDashboard />} />
          <Route path="/finances" element={<FinanceDashboard />} />
          <Route path="/health" element={<HealthDashboard />} />
          <Route path="/weather" element={<WeatherDashboard />} />
          <Route path="/settings" element={<SettingsDashboard />} />
          <Route path="/docs" element={<DocumentationDashboard />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/messages" element={<MessagingDashboard />} />
          
          <Route path="/sync" element={<SyncDashboard />} /> 
          
          <Route 
            path="/admin" 
            element={
              <RoleGuard allowedRoles={['admin', 'moderator']}>
                <AdminDashboard />
              </RoleGuard>
            } 
          />
          <Route 
            path="/admin/docs" 
            element={
              <RoleGuard allowedRoles={['admin', 'moderator']}>
                <AdminDocs />
              </RoleGuard>
            } 
          />
          <Route 
            path="/admin/subscriptions" 
            element={
              <RoleGuard allowedRoles={['admin']}>
                <SubscriptionAdmin />
              </RoleGuard>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};
