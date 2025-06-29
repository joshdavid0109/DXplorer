import { supabase } from '@/lib/supabase';
import { AuthError, Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: AuthError | null }>;
  signInWithGoogle?: () => Promise<{ data: any; error: AuthError | null }>;
  signInWithFacebook?: () => Promise<{ data: any; error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Initial state: loading is true

  // Effect to handle initial session retrieval AND auth state changes
  useEffect(() => {
    // This function will be called whenever auth state changes, or initially
    const handleAuthStateChange = (event: string, currentSession: Session | null) => {
      console.log('Auth state change:', event, currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      // Only set loading to false *once* the initial session fetch/first auth event has occurred.
      // This ensures `loading` stays true until we know the initial auth state.
      setLoading(false); // Set loading to false *after* state is updated

      // --- Navigation logic: ONLY handle if NOT currently in the loading state,
      //     and also ensure `router.replace` is called once per relevant event.
      // This navigation logic is better placed in RootLayoutNav, but if kept here,
      // it needs careful handling to avoid race conditions.
      // For now, let's keep it here but with a focus on stability.
      if (event === 'SIGNED_IN' && currentSession?.user) {
         // The `RootLayoutNav` already handles navigation based on `user` and `session`.
         // Having it here too can cause a race condition if both try to navigate.
         // Consider removing this navigation from AuthContext and solely relying on RootLayoutNav.
         // If you keep it, add a check to prevent redundant navigations.
         // e.g., if (router.current === '/(auth)/login' || router.current === '/index') { ... }
         // For now, I'll recommend moving it.
      } else if (event === 'SIGNED_OUT') {
         // Same consideration as above.
      }
    };

    // Listen for auth changes and get initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initial session check is implicitly handled by `onAuthStateChange`
    // because `onAuthStateChange` fires immediately with the current session.
    // So, no need for a separate `getSession().then(...)` call here, as it can race.

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  // It's generally safer to put navigation logic in the component that *uses* the auth context
  // (i.e., your RootLayoutNav), rather than directly inside the AuthProvider.
  // This separates concerns: AuthProvider manages auth state; RootLayoutNav manages app flow.

  // --- Functions for authentication actions ---
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (err) {
      console.error('Sign in error:', err);
      return {
        data: null,
        error: {
          message: 'An unexpected error occurred during sign in',
          name: 'SignInError',
        } as AuthError,
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    } catch (err) {
      console.error('Sign up error:', err);
      return {
        data: null,
        error: {
          message: 'An unexpected error occurred during sign up',
          name: 'SignUpError',
        } as AuthError,
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'yourapp://reset-password',
      });
      return { data, error };
    } catch (err) {
      console.error('Reset password error:', err);
      return {
        data: null,
        error: {
          message: 'An unexpected error occurred during password reset',
          name: 'ResetPasswordError',
        } as AuthError,
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'yourapp://auth/callback',
        },
      });
      return { data, error };
    } catch (err) {
      console.error('Google sign in error:', err);
      return {
        data: null,
        error: {
          message: 'An unexpected error occurred during Google sign in',
          name: 'GoogleSignInError',
        } as AuthError,
      };
    }
  };

  const signInWithFacebook = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: 'yourapp://auth/callback',
        },
      });
      return { data, error };
    } catch (err) {
      console.error('Facebook sign in error:', err);
      return {
        data: null,
        error: {
          message: 'An unexpected error occurred during Facebook sign in',
          name: 'FacebookSignInError',
        } as AuthError,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
        signInWithFacebook,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};