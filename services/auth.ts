
import { dbService } from './db';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AuthUser, AuthSession, AuthDevice, MfaDevice, UserProfile, UserRole, SecurityAuditLog } from '../types';
import { OWNER_EMAIL } from '../constants';
import { User } from '@supabase/supabase-js';

/**
 * AUTH SERVICE (Hybrid: Supabase + Local Fallback)
 * 
 * Handles authentication via Supabase Auth if configured.
 * Falls back to local IndexedDB auth for offline/demo use.
 */

const ROLE_HIERARCHY: Record<UserRole, number> = {
    owner: 4,
    admin: 3,
    moderator: 2,
    contributor: 1,
    user: 0
};

// Helper to map Supabase User to internal AuthUser
const mapSupabaseUser = (u: User): AuthUser => {
    // Extract roles from metadata, default to 'user'
    const roles: UserRole[] = (u.app_metadata?.roles as UserRole[]) || (u.user_metadata?.roles as UserRole[]) || ['user'];
    
    // Auto-promote owner if email matches constant (Safety check)
    if (u.email === OWNER_EMAIL && !roles.includes('owner')) {
        roles.push('owner');
    }

    return {
        id: u.id,
        email: u.email!,
        emailVerified: !!u.confirmed_at,
        mfaEnabled: (u.factors?.length || 0) > 0,
        status: 'active',
        lastLogin: new Date(u.last_sign_in_at || Date.now()).getTime(),
        roles: roles,
        createdAt: new Date(u.created_at).getTime(),
        updatedAt: new Date(u.updated_at || Date.now()).getTime(),
        syncStatus: 'synced'
    };
};

export const authService = {

  // --- Event Emitter for UI Updates ---
  notifyAuthChange() {
      window.dispatchEvent(new Event('auth-change'));
  },

  // --- Role Logic ---

  getRolePriority(role: UserRole): number {
      return ROLE_HIERARCHY[role] || 0;
  },

  hasRole(user: AuthUser | null, requiredRole: UserRole): boolean {
      if (!user) return false;
      const roles = Array.isArray(user.roles) ? user.roles : ['user'];
      const userHighestRole = roles.reduce((highest, current) => {
          const currentPri = this.getRolePriority(current as UserRole);
          return currentPri > highest ? currentPri : highest;
      }, 0);
      return userHighestRole >= this.getRolePriority(requiredRole);
  },

  // --- Core Auth Flows ---

  async register(email: string, password: string, userData?: { name?: string, phone?: string }, customId?: string): Promise<{ success: boolean; error?: string }> {
    // 1. Explicit Offline Mode (or Config Missing) -> Use Mock
    if (!isSupabaseConfigured) {
        return this.mockRegister(email, password, customId);
    }

    try {
        console.log('[Auth] Attempting Supabase Registration...');
        
        // Pass metadata to populate 'Display Name' and 'Phone' columns in Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            phone: userData?.phone,
            options: {
                data: {
                    full_name: userData?.name, // Maps to 'Display Name' in many Auth UI kits
                    name: userData?.name       // Redundant fallback
                }
            }
        });

        if (error) throw error;
        
        // Handle case where session is returned immediately (Auto Confirm ON) vs User only (Confirm Email required)
        const user = data.user || (data as any).session?.user;

        if (!user) {
            return { success: false, error: "Please check your email to confirm your account." };
        }

        const userId = user.id;
        const mappedUser = mapSupabaseUser(user);

        await this.ensureProfileExists(userId, email, mappedUser.roles[0], userData?.name);
        await this.logAudit(userId, 'register', 'success', 'Supabase Signup');

        return { success: true };
    } catch (e: any) {
        // DETECT SPECIFIC SUPABASE CONFIG ISSUES
        const isDbError = e.message?.includes("Database error saving new user");
        
        console.warn(`[Auth] Cloud Registration Failed: ${e.message}`);
        
        if (isDbError) {
            console.info("%c[Fix Required] This error indicates your Supabase Database triggers are misconfigured.\nYou can fix this in the App: Admin Console > Cloud > Show SQL.", "color: orange; font-weight: bold;");
        } else if (e.message?.includes('500')) {
             console.info("%c[Backend Error] 500 error usually means a trigger failed. Check Admin > Cloud > Fix.", "color: red;");
        }

        console.log("[Auth] Switching to Offline Mode for this session to unblock access.");
        
        // AUTO-FALLBACK: If cloud fails (e.g. connection error, misconfig), 
        // register locally so the user isn't blocked.
        return this.mockRegister(email, password, customId);
    }
  },

  async login(email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string; mfaRequired?: boolean; userId?: string }> {
    // 1. Explicit Offline Mode -> Use Mock
    if (!isSupabaseConfigured) {
        return this.mockLogin(email, password);
    }

    try {
        console.log('[Auth] Attempting Supabase Login...');
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        if (data.user) {
             const user = mapSupabaseUser(data.user);
             await this.ensureProfileExists(user.id, user.email, user.roles[0]);
        }
        
        this.notifyAuthChange();
        return { success: true };
    } catch (e: any) {
        console.warn("[Auth] Supabase Login failed:", e.message);

        // Fallback: Check local DB just in case they have an offline account with same creds
        // This handles the edge case where a user switches between online/offline frequentlly
        const localUser = await dbService.getByIndex<AuthUser>('auth_users', 'email', email);
        if (localUser && localUser.passwordHash === password) {
             console.log("[Auth] Cloud login failed, found matching local user. Logging in offline.");
             return this.mockLogin(email, password);
        }

        return { success: false, error: e.message || 'Login failed.' };
    }
  },

  async logout() {
    console.log("[Auth] Logging out...");
    try {
        if (isSupabaseConfigured) await supabase.auth.signOut();
    } catch (e) { console.error("SignOut error (ignoring)", e); }
    
    // Aggressive Cleanup
    localStorage.removeItem('homestead_local_user_id');
    
    // Clear Supabase specific keys manually to ensure `getSession` returns null
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key);
        }
    }

    this.notifyAuthChange();
    
    // Force reload to ensure clean state
    window.location.reload();
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
        // 1. Try Supabase Session if configured
        if (isSupabaseConfigured) {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (session?.user && !error) {
                return mapSupabaseUser(session.user);
            }
        }
    } catch (e) {
        // Ignore Supabase errors
    }

    // 2. Fallback to Local Mock User
    return this.mockGetCurrentUser();
  },

  getSession(): AuthSession | null {
    // Basic check for UI guards
    const localId = localStorage.getItem('homestead_local_user_id');
    if (localId) return { id: 'local', userId: localId } as any;

    // Check for Supabase token in localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            return { id: 'sb-session', userId: 'sb-user' } as any;
        }
    }
    return null; 
  },

  // --- Mock Implementation (Offline Fallback) ---

  async mockRegister(email: string, password: string, customId?: string): Promise<{ success: boolean; error?: string }> {
      console.log("[Auth] Using Local Mock Registration");
      
      const existing = await dbService.getByIndex<AuthUser>('auth_users', 'email', email);
      
      // UPSERT LOGIC: If user exists locally, we simply update credentials and log them in.
      // This prevents the "User already exists" loop when retrying onboarding in offline mode.
      
      const userId = existing ? existing.id : (customId || crypto.randomUUID());
      
      // Default to 'user' role
      const role: UserRole = email === OWNER_EMAIL ? 'owner' : 'user'; 

      const newUser: AuthUser = {
          id: userId,
          email,
          passwordHash: password, // Insecure storage for local demo only
          emailVerified: true,
          mfaEnabled: false,
          status: 'active',
          lastLogin: Date.now(),
          roles: [role],
          createdAt: existing ? existing.createdAt : Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };

      await dbService.put('auth_users', newUser);
      await this.ensureProfileExists(userId, email, role);
      
      // Auto login
      localStorage.setItem('homestead_local_user_id', userId);
      this.notifyAuthChange();
      
      return { success: true };
  },

  async mockLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
      console.log("[Auth] Using Local Mock Login");
      const user = await dbService.getByIndex<AuthUser>('auth_users', 'email', email);
      
      if (!user) return { success: false, error: "User not found locally. Try registering for Offline Mode." };
      if (user.passwordHash !== password) return { success: false, error: "Invalid password." };

      // Ensure profile exists even on login, handling edge case where it was deleted
      const role = user.roles && user.roles.length > 0 ? user.roles[0] : 'user';
      await this.ensureProfileExists(user.id, user.email, role);

      localStorage.setItem('homestead_local_user_id', user.id);
      this.notifyAuthChange();
      return { success: true };
  },

  async mockGetCurrentUser(): Promise<AuthUser | null> {
      const id = localStorage.getItem('homestead_local_user_id');
      if (!id) return null;
      return await dbService.get<AuthUser>('auth_users', id) || null;
  },

  async ensureProfileExists(userId: string, email: string, role: UserRole, name?: string) {
        // Check for specific profile record. For local mode, we often default to 'main_user'
        // But let's check for the actual user ID first
        let existing = await dbService.get<UserProfile>('user_profile', userId);
        
        // If we are in single-user local mode, check 'main_user' as fallback
        if (!existing && userId !== 'main_user') {
             existing = await dbService.get<UserProfile>('user_profile', 'main_user');
        }

        if (!existing) {
            // Use 'main_user' as the ID for consistency in local mode unless specified otherwise
            const profileId = isSupabaseConfigured ? userId : 'main_user';
            
            const newProfile: UserProfile = {
                id: profileId, 
                userId: userId,
                name: name || email.split('@')[0],
                email: email,
                zipCode: '',
                hardinessZone: '',
                experienceLevel: 'beginner',
                goals: [],
                interests: [],
                preferences: { organicOnly: false, useMetric: false, enableNotifications: true },
                role: role,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            };
            await dbService.put('user_profile', newProfile);
        }
  },

  // --- Other Methods (Shared or Stubbed) ---

  async verifyMfa(userId: string, code: string, rememberMe: boolean = false): Promise<{ success: boolean }> {
    try {
        const { data, error } = await supabase.auth.mfa.challenge({ factorId: userId, code }); 
        if (error) throw error;
        return { success: true };
    } catch(e) {
        return { success: false };
    }
  },

  async magicLinkLogin(email: string): Promise<{ success: boolean }> {
    try {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        return { success: true };
    } catch(e) {
        console.error("Magic Link error", e);
        return { success: false };
    }
  },

  /**
   * Syncs specific profile data (Name, Phone) back to Supabase Auth User Metadata.
   * This fixes missing columns in the Supabase Dashboard.
   */
  async syncProfileToAuth(email?: string, data?: { name?: string, phone?: string }): Promise<void> {
      if (!isSupabaseConfigured) return;

      try {
        const updates: any = {};
        if (email) updates.email = email;
        if (data?.phone) updates.phone = data.phone;
        if (data?.name) {
            updates.data = { full_name: data.name };
        }

        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;
        
        // Also update local db cache
        const user = await this.getCurrentUser();
        if (user) {
            const authUser = await dbService.get<AuthUser>('auth_users', user.id);
            if (authUser && email) {
                authUser.email = email;
                await dbService.put('auth_users', authUser);
            }
        }
        
      } catch (e) { 
          console.error("Failed to sync profile to Auth:", e); 
      }
      
      this.notifyAuthChange();
  },

  // Legacy alias
  async updateEmailAndRoles(newEmail: string): Promise<void> {
      return this.syncProfileToAuth(newEmail);
  },

  async createSession(user: AuthUser, rememberMe: boolean = false) {
      this.notifyAuthChange();
  },

  getDeviceId(): string {
    let id = localStorage.getItem('device_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('device_id', id);
    }
    return id;
  },

  async getDevices(userId: string): Promise<AuthDevice[]> {
    return [{
        id: this.getDeviceId(),
        userId,
        name: 'Current Device',
        type: 'desktop',
        fingerprint: navigator.userAgent,
        lastSeen: Date.now(),
        isTrusted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'synced'
    }];
  },

  async revokeDevice(deviceId: string) {
    console.log("Device revocation not supported in basic mode");
  },

  async enableMfa(userId: string, type: 'totp'): Promise<string> {
    try {
        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
        if (error) throw error;
        return data.secret;
    } catch (e) {
        return "MFA-NOT-AVAILABLE-OFFLINE";
    }
  },

  async confirmMfa(userId: string, code: string) {
    console.log("MFA Confirm Logic");
  },

  async disableMfa(userId: string) {
      console.log("MFA Disable requested");
  },

  async impersonateUser(adminId: string, targetUserId: string) {
      localStorage.setItem('homestead_local_user_id', targetUserId);
      this.notifyAuthChange();
  },

  async logAudit(userId: string, action: SecurityAuditLog['action'], status: 'success'|'failure', metadata: string = '') {
      const log: SecurityAuditLog = {
          id: crypto.randomUUID(),
          userId,
          action,
          status,
          ipAddress: 'client', 
          userAgent: navigator.userAgent,
          metadata,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };
      await dbService.put('security_audit_logs', log);
  }
};
