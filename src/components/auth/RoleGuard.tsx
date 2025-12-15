

import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { AuthUser, UserRole } from '../../types';
import { Lock } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[]; // e.g. ['admin', 'moderator']
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = await authService.getCurrentUser();
        setAuthUser(user);
        
        if (user) {
            // Check if user has AT LEAST the privilege of the lowest allowed role in the array
            // Assuming allowedRoles contains the target permission level.
            // Simplified: If user has ANY of the allowedRoles explicitly, or a higher role.
            
            // Actually, usually we pass the *minimum* role required.
            // Let's iterate allowedRoles and see if user meets any criteria via hierarchy.
            const access = allowedRoles.some(role => authService.hasRole(user, role));
            setHasAccess(access);
        }
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, [allowedRoles]);

  if (loading) {
    return <div className="p-8 text-center text-earth-500 animate-pulse">Verifying permissions...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-earth-200 dark:bg-stone-800 rounded-full flex items-center justify-center mb-6 text-earth-500 dark:text-stone-400">
           <Lock size={40} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-earth-900 dark:text-earth-100 mb-2">Access Denied</h2>
        <p className="text-earth-600 dark:text-stone-400 max-w-sm">
           You do not have permission to view this area. This page is restricted.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};