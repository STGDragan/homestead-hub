
import React, { useEffect, useState, useRef } from 'react';
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
import { PartnerPortal } from './pages/Partner/PartnerPortal';
import { RecipeDashboard } from './pages/Recipes/RecipeDashboard';
import { RecipeDetail } from './pages/Recipes/RecipeDetail';
import { AuthModal } from './components/auth/AuthModal';
import { RoleGuard } from './components/auth/RoleGuard';
import { authService } from './services/auth';
import { subscriptionService } from './services/subscriptionService';
import { libraryService } from './services/libraryService';

export const HomesteadMainscreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState(0); 
  const initRef = useRef(false);

  const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (e) {
        console.warn("Auth check failed", e);
        setIsAuthenticated(false);
      }
  };

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initApp = async () => {
      try {
        await Promise.all([
            subscriptionService.initializePlans().catch(e => console.warn('Plan Init Failed', e)),
            libraryService.initSystemPlants().catch(e => console.warn('Plant Init Failed', e)),
            libraryService.initSystemAnimals().catch(e => console.warn('Animal Init Failed', e)),
            checkAuth()
        ]);
      } catch (e) {
        console.error("Critical App Init Failure:", e);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
        if (loading) setLoading(false);
    }, 5000);

    initApp();
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleAuthChange = async () => {
        setAuthKey(prev => prev + 1);
        await checkAuth();
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLoginSuccess = () => {
      checkAuth();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-100 text-earth-600 dark:bg-night-950 dark:text-night-400">
        <div className="animate-pulse flex flex-col items-center">
           <span className="text-3xl font-serif font-bold mb-2">Homestead Hub</span>
           <span className="text-sm">Loading your farm...</span>
        </div>
      </div>
    );
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
          <Route path="/marketplace" element={<MarketplaceDashboard />} />
          <Route path="/finances" element={<FinanceDashboard />} />
          <Route path="/health" element={<HealthDashboard />} />
          <Route path="/weather" element={<WeatherDashboard />} />
          <Route path="/settings" element={<SettingsDashboard />} />
          <Route path="/docs" element={<DocumentationDashboard />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/messages" element={<MessagingDashboard />} />
          <Route path="/recipes" element={<RecipeDashboard />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/sync" element={<SyncDashboard />} />
          <Route path="/partner" element={<PartnerPortal />} />
          <Route path="/admin" element={<RoleGuard allowedRoles={['admin', 'moderator', 'owner']}><AdminDashboard /></RoleGuard>} />
          <Route path="/admin/docs" element={<RoleGuard allowedRoles={['admin', 'moderator', 'owner']}><AdminDocs /></RoleGuard>} />
          <Route path="/admin/subscriptions" element={<RoleGuard allowedRoles={['admin', 'owner']}><SubscriptionAdmin /></RoleGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};
