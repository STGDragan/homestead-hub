import { dbService } from './db';
import { AuthUser, AuthSession, AuthDevice, MfaDevice, UserProfile, UserRole, SecurityAuditLog } from '../types';
import { OWNER_EMAIL } from '../constants';

/**
 * AUTH SERVICE
 * 
 * Simulates a full backend authentication system within the PWA.
 * Uses IndexedDB to store users, devices, and sessions securely (at rest).
 * In a real deployment, these methods would be API calls to a Node.js server.
 */

const ROLE_HIERARCHY: Record<UserRole, number> = {
    owner: 4,
    admin: 3,
    moderator: 2,
    contributor: 1,
    user: 0
};

// Basic hash simulation (In real app, use bcrypt/argon2 on server)
const hashPassword = async (password: string, salt: string): Promise<string> => {
    // Basic fallback for non-secure contexts (e.g. HTTP IP address access)
    if (!crypto.subtle) {
        console.warn("Secure context not detected. Using unsafe hash fallback.");
        return btoa(password + salt); // INSECURE: Demo fallback only
    }
    const msgBuffer = new TextEncoder().encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateSalt = () => crypto.randomUUID();
const generateToken = () => 'jwt_' + Math.random().toString(36).substr(2) + Date.now();

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
      // Defensive check: Ensure roles is an array
      const roles = Array.isArray(user.roles) ? user.roles : ['user'];
      
      const userHighestRole = roles.reduce((highest, current) => {
          const currentPri = this.getRolePriority(current as UserRole);
          return currentPri > highest ? currentPri : highest;
      }, 0);
      return userHighestRole >= this.getRolePriority(requiredRole);
  },

  // --- Core Auth Flows ---

  async register(email: string, password: string, customId?: string): Promise<{ success: boolean; error?: string }> {
    // 1. Check existing
    const existing = await dbService.getByIndex<AuthUser>('auth_users', 'email', email);
    if (existing) return { success: false, error: 'Email already registered.' };

    // 2. Create Auth User
    const userId = customId || crypto.randomUUID();
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    // Auto-assign owner role if email matches constant
    const roles: UserRole[] = email === OWNER_EMAIL ? ['owner'] : ['user'];

    const newUser: AuthUser = {
        id: userId,
        email,
        passwordHash: hash,
        salt,
        emailVerified: false,
        mfaEnabled: false,
        status: 'active',
        lastLogin: 0,
        roles: roles,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    // 3. Create User Profile
    const newProfile: UserProfile = {
        id: `profile_${userId}`,
        userId: userId,
        name: email.split('@')[0],
        email: email,
        zipCode: '',
        hardinessZone: '',
        experienceLevel: 'beginner',
        goals: [],
        interests: [],
        preferences: { organicOnly: false, useMetric: false, enableNotifications: true },
        role: roles[0], // Sync primary role to profile for convenience
        createdAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending'
    };

    await dbService.put('auth_users', newUser);
    // Only create profile if it doesn't exist (Onboarding might have created it)
    const existingProfile = await dbService.get('user_profile', userId);
    if (!existingProfile) {
        await dbService.put('user_profile', newProfile);
    }
    
    await this.logAudit(userId, 'register', 'success');

    // 4. Auto-Login
    await this.login(email, password);
    return { success: true };
  },

  async login(email: string, password: string): Promise<{ success: boolean; error?: string; mfaRequired?: boolean; userId?: string }> {
    // 1. Find User
    const user = await dbService.getByIndex<AuthUser>('auth_users', 'email', email);
    if (!user) return { success: false, error: 'Invalid credentials.' };

    // 2. Verify Password
    const hash = await hashPassword(password, user.salt || '');
    if (hash !== user.passwordHash) {
        await this.logAudit(user.id, 'login', 'failure', 'Bad Password');
        return { success: false, error: 'Invalid credentials.' };
    }

    // 3. Check MFA
    if (user.mfaEnabled) {
        return { success: true, mfaRequired: true, userId: user.id };
    }

    // 4. Create Session
    await this.createSession(user);
    return { success: true };
  },

  async verifyMfa(userId: string, code: string): Promise<{ success: boolean }> {
    // Simulate TOTP check (any 6 digit code works for demo)
    if (code.length === 6 && /^\d+$/.test(code)) {
        const user = await dbService.get<AuthUser>('auth_users', userId);
        if (user) {
            await this.createSession(user);
            return { success: true };
        }
    }
    return { success: false };
  },

  async magicLinkLogin(email: string): Promise<{ success: boolean }> {
    const user = await dbService.getByIndex<AuthUser>('auth_users', 'email', email);
    if (user) {
        // In real app, send email. Here, auto-login after delay.
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.createSession(user);
        return { success: true };
    }
    return { success: false }; // Don't reveal user existence in real app
  },

  /**
   * Updates the current user's email and re-evaluates their role based on the OWNER_EMAIL constant.
   * This is primarily for the Settings page to allow "claiming" the owner account.
   */
  async updateEmailAndRoles(newEmail: string): Promise<void> {
      const session = this.getSession();
      let userId = session?.userId;

      // If no session (e.g. fresh onboarding), try to find the 'main_user' profile's auth user
      if (!userId) {
          userId = 'main_user';
      }

      let authUser = await dbService.get<AuthUser>('auth_users', userId);
      
      // If auth user doesn't exist (common in this demo flow), create one
      if (!authUser) {
          authUser = {
              id: userId,
              email: newEmail,
              passwordHash: 'placeholder',
              salt: 'placeholder',
              emailVerified: false,
              mfaEnabled: false,
              status: 'active',
              lastLogin: Date.now(),
              roles: ['user'],
              createdAt: Date.now(),
              updatedAt: Date.now(),
              syncStatus: 'pending'
          };
      }

      // Update Email
      authUser.email = newEmail;

      // Ensure roles array exists
      if (!Array.isArray(authUser.roles)) {
          authUser.roles = ['user'];
      }

      let rolesChanged = false;

      // Check Owner Promotion
      if (newEmail.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
          if (!authUser.roles.includes('owner')) {
              // Promote to Owner
              authUser.roles = ['owner', ...authUser.roles.filter(r => r !== 'owner')];
              rolesChanged = true;
              console.log("User promoted to Owner via email match.");
          }
      } else {
          // Demote if they changed away from owner email
          if (authUser.roles.includes('owner')) {
              authUser.roles = authUser.roles.filter(r => r !== 'owner');
              if (authUser.roles.length === 0) authUser.roles = ['user'];
              rolesChanged = true;
          }
      }

      await dbService.put('auth_users', authUser);
      
      // Ensure session exists
      if (!session) {
          await this.createSession(authUser);
      }

      if (rolesChanged) {
          this.notifyAuthChange();
      }
  },

  // --- Session Management ---

  async createSession(user: AuthUser) {
    const deviceId = this.getDeviceId();
    const sessionId = crypto.randomUUID();
    const token = generateToken();

    // Update User
    user.lastLogin = Date.now();
    await dbService.put('auth_users', user);

    // Register Device if new
    let device = await dbService.get<AuthDevice>('auth_devices', deviceId);
    if (!device) {
        device = {
            id: deviceId,
            userId: user.id,
            name: `Browser (${navigator.platform})`,
            type: /Mobi/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            fingerprint: navigator.userAgent,
            lastSeen: Date.now(),
            isTrusted: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            syncStatus: 'pending'
        };
        await dbService.put('auth_devices', device);
    } else {
        device.lastSeen = Date.now();
        await dbService.put('auth_devices', device);
    }

    // Persist Session (Local Storage for Token)
    const session: AuthSession = {
        id: sessionId,
        userId: user.id,
        deviceId,
        token,
        refreshToken: generateToken(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24h
        lastActive: Date.now()
    };
    localStorage.setItem('auth_session', JSON.stringify(session));
    await this.logAudit(user.id, 'login', 'success', `Device: ${device.name}`);
    
    this.notifyAuthChange();
  },

  async logout() {
    const session = this.getSession();
    if (session) {
        await this.logAudit(session.userId, 'logout', 'success');
    }
    localStorage.removeItem('auth_session');
    // Ensure cleanup of any stale state
    this.notifyAuthChange();
  },

  getSession(): AuthSession | null {
    try {
        const json = localStorage.getItem('auth_session');
        if (!json) return null;
        const session = JSON.parse(json) as AuthSession;
        if (session.expiresAt < Date.now()) {
            localStorage.removeItem('auth_session'); 
            return null;
        }
        return session;
    } catch (e) {
        console.error("Session parse error", e);
        localStorage.removeItem('auth_session');
        return null;
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
        const session = this.getSession();
        if (!session) {
            return null;
        }
        return await dbService.get<AuthUser>('auth_users', session.userId) || null;
    } catch (e) {
        console.error("Error getting current user:", e);
        return null;
    }
  },

  // --- Device Management ---

  getDeviceId(): string {
    let id = localStorage.getItem('device_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('device_id', id);
    }
    return id;
  },

  async getDevices(userId: string): Promise<AuthDevice[]> {
    return await dbService.getAllByIndex<AuthDevice>('auth_devices', 'userId', userId);
  },

  async revokeDevice(deviceId: string) {
    const device = await dbService.get<AuthDevice>('auth_devices', deviceId);
    if (device) {
        // In real app, blacklist tokens associated with device
        await dbService.delete('auth_devices', deviceId);
        await this.logAudit(device.userId, 'session_revoke', 'success', `Revoked device ${device.name}`);
    }
  },

  // --- Security ---

  async enableMfa(userId: string, type: 'totp'): Promise<string> {
    // Return a mock secret for QR generation
    const secret = "JBSWY3DPEHPK3PXP"; // Base32 example
    return secret;
  },

  async confirmMfa(userId: string, code: string) {
    if (code.length === 6) {
        const user = await dbService.get<AuthUser>('auth_users', userId);
        if (user) {
            user.mfaEnabled = true;
            await dbService.put('auth_users', user);
            
            const mfaDevice: MfaDevice = {
                id: crypto.randomUUID(),
                userId,
                type: 'totp',
                name: 'Authenticator App',
                lastUsed: Date.now(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
                syncStatus: 'pending'
            };
            await dbService.put('mfa_devices', mfaDevice);
            await this.logAudit(userId, 'mfa_enable', 'success');
        }
    }
  },

  async disableMfa(userId: string) {
      const user = await dbService.get<AuthUser>('auth_users', userId);
      if (user) {
          user.mfaEnabled = false;
          await dbService.put('auth_users', user);
          // Clean up devices
          const devices = await dbService.getAllByIndex<MfaDevice>('mfa_devices', 'userId', userId);
          for (const d of devices) await dbService.delete('mfa_devices', d.id);
          await this.logAudit(userId, 'mfa_disable', 'success');
      }
  },

  // --- Admin/Role ---

  async impersonateUser(adminId: string, targetUserId: string) {
      const admin = await dbService.get<AuthUser>('auth_users', adminId);
      if (!admin || !this.hasRole(admin, 'admin')) throw new Error("Unauthorized");

      const target = await dbService.get<AuthUser>('auth_users', targetUserId);
      if (target) {
          await this.createSession(target);
          await this.logAudit(adminId, 'impersonate', 'success', `Impersonated ${target.email}`);
          this.notifyAuthChange();
      }
  },

  async logAudit(userId: string, action: SecurityAuditLog['action'], status: 'success'|'failure', metadata: string = '') {
      const log: SecurityAuditLog = {
          id: crypto.randomUUID(),
          userId,
          action,
          status,
          ipAddress: '127.0.0.1', // Mock
          userAgent: navigator.userAgent,
          metadata,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'pending'
      };
      await dbService.put('security_audit_logs', log);
  }
};