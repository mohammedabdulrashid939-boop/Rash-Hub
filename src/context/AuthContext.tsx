import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (fullName: string, phoneNumber?: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  // Demo mode toggle when Supabase is not configured yet
  isDemoMode: boolean;
  setDemoUser: (role: 'customer' | 'admin' | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [demoRole, setDemoRole] = useState<'customer' | 'admin' | null>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('rash_hub_demo_role') as 'customer' | 'admin') || null;
    }
    return null;
  });

  const isConfigured = isSupabaseConfigured();

  // Fetch user profile from Supabase profiles table
  const fetchProfile = async (userId: string, userEmail?: string): Promise<Profile | null> => {
    if (!isConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet, try creating it
        const newProf = {
          id: userId,
          full_name: userEmail?.split('@')[0] || 'Football Fan',
          email: userEmail,
          role: 'customer' as const,
        };
        const { data: created, error: createErr } = await supabase
          .from('profiles')
          .insert([newProf])
          .select()
          .single();

        if (createErr) {
          console.warn('Could not auto-create profile:', createErr);
          return newProf;
        }
        return created;
      }

      if (error) {
        console.warn('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (e) {
      console.warn('Network error fetching profile:', e);
      return null;
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      // In unconfigured state, use demo role if active
      if (demoRole) {
        const fakeUser: Partial<User> = {
          id: demoRole === 'admin' ? 'demo-admin-id' : 'demo-customer-id',
          email: demoRole === 'admin' ? 'admin@rashhubstore.com' : 'fan@rashhubstore.com',
        };
        setUser(fakeUser as User);
        setProfile({
          id: fakeUser.id!,
          full_name: demoRole === 'admin' ? 'Store Manager (Admin)' : 'Kwame Mensah',
          email: fakeUser.email,
          phone_number: '0533916516',
          role: demoRole,
        });
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
      return;
    }

    // Supabase is configured: initialize session and listen for auth changes
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        if (initialSession?.user) {
          setUser(initialSession.user);
          const prof = await fetchProfile(initialSession.user.id, initialSession.user.email);
          setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        setUser(currentSession.user);
        const prof = await fetchProfile(currentSession.user.id, currentSession.user.email);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isConfigured, demoRole]);

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    if (!isConfigured) {
      // Offline / Setup mode mock signup
      const mockId = `user_${Date.now()}`;
      const fakeUser: Partial<User> = { id: mockId, email };
      setUser(fakeUser as User);
      const fakeProf: Profile = {
        id: mockId,
        full_name: fullName,
        email,
        role: 'customer',
      };
      setProfile(fakeProf);
      setDemoRole('customer');
      localStorage.setItem('rash_hub_demo_role', 'customer');
      return { success: true, needsEmailVerification: false };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: window.location.origin + '/login',
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required by Supabase
      const needsEmailVerification = Boolean(
        data.user && (!data.session || data.user.identities?.length === 0 || !data.user.confirmed_at)
      );

      if (data.user && !needsEmailVerification) {
        const prof = await fetchProfile(data.user.id, data.user.email);
        setProfile(prof);
      }

      return { success: true, needsEmailVerification };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, error: errorMsg };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      // If demo mode or test credentials
      const isAdminLogin = email.toLowerCase().includes('admin');
      const role = isAdminLogin ? 'admin' : 'customer';
      setDemoRole(role);
      localStorage.setItem('rash_hub_demo_role', role);
      setUser({ id: `demo_${role}`, email } as User);
      setProfile({
        id: `demo_${role}`,
        full_name: isAdminLogin ? 'Store Administrator' : 'Kwame Mensah',
        email,
        role,
        phone_number: '0533916516',
      });
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const prof = await fetchProfile(data.user.id, data.user.email);
        setProfile(prof);
      }

      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid credentials';
      return { success: false, error: errorMsg };
    }
  };

  const signOut = async () => {
    if (!isConfigured) {
      setDemoRole(null);
      localStorage.removeItem('rash_hub_demo_role');
      setUser(null);
      setProfile(null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    if (!isConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send recovery email';
      return { success: false, error: errorMsg };
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!isConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update password';
      return { success: false, error: errorMsg };
    }
  };

  const updateProfile = async (fullName: string, phoneNumber?: string) => {
    if (!user) return { success: false, error: 'User is not logged in' };

    if (!isConfigured) {
      setProfile((prev) => (prev ? { ...prev, full_name: fullName, phone_number: phoneNumber } : null));
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
        })
        .eq('id', user.id);

      if (error) return { success: false, error: error.message };

      setProfile((prev) => (prev ? { ...prev, full_name: fullName, phone_number: phoneNumber } : null));
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update profile';
      return { success: false, error: errorMsg };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const prof = await fetchProfile(user.id, user.email);
      setProfile(prof);
    }
  };

  const resendVerificationEmail = async (emailToResend: string) => {
    if (!isConfigured) return { success: true };
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToResend.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to resend confirmation email';
      return { success: false, error: errorMsg };
    }
  };

  const setDemoUser = (role: 'customer' | 'admin' | null) => {
    setDemoRole(role);
    if (role) {
      localStorage.setItem('rash_hub_demo_role', role);
      setUser({ id: `demo_${role}`, email: `${role}@rashhubstore.com` } as User);
      setProfile({
        id: `demo_${role}`,
        full_name: role === 'admin' ? 'Store Administrator' : 'Kwame Mensah',
        email: `${role}@rashhubstore.com`,
        role,
        phone_number: '0533916516',
      });
    } else {
      localStorage.removeItem('rash_hub_demo_role');
      setUser(null);
      setProfile(null);
    }
  };

  const isAdmin = useMemo(() => {
    return profile?.role === 'admin';
  }, [profile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
        signUpWithEmail,
        signInWithEmail,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        updateProfile,
        refreshProfile,
        resendVerificationEmail,
        isDemoMode: !isConfigured,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
