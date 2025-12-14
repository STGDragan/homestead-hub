
import React, { useEffect, useState } from 'react';
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
import { AuthModal } from './components/auth/AuthModal';
import { RoleGuard } from './components/auth/RoleGuard';
import { authService } from './services/auth';
import { subscriptionService } from './services/subscriptionService';
import { libraryService } from './services/libraryService';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState(0); 

  const checkAuth = async () => {
      setLoading(true);
      const user = await authService.getCurrentUser();
      
      if (user) {
          setIsAuthenticated(true);
      } else {
          setIsAuthenticated(false);
      }
      setLoading(false);
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        await subscriptionService.initializePlans(); 
        await libraryService.initSystemPlants(); 
        await libraryService.initSystemAnimals(); 
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
        // Ensure we don't get stuck on a protected route if logged out
        if (!authService.getSession() && window.location.hash !== '#/') {
             window.location.hash = '#/';
        }
    };
    window.addEventListener('auth-change', handleAuthChange);
    
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
          
          <Route path="/sync" element={<SyncDashboard />} />
          
          {/* Public/Partner Route (Could be separated from main layout in real app) */}
          <Route path="/partner" element={<PartnerPortal />} />
          
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
