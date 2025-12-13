import { supabase } from './supabaseClient';

export type AuthUser = {
  id: string;
  email: string | null;
};

export type UserProfile = {
  id: string;
  email: string | null;
  username?: string | null;
  display_name?: string | null;
  role_id?: string | null;
  mfa_enabled?: boolean;
  metadata?: Record<string, any>;
};

class AuthService {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;
    return data.user;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.user) {
      const deviceName =
        navigator.platform + ' - ' + navigator.userAgent.slice(0, 40);

      await this.registerDevice(deviceName);
    }

    return data.user;
  }


  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;

    return {
      id: data.user.id,
      email: data.user.email
    };
  }

  async getProfile(): Promise<UserProfile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
