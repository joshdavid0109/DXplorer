import { supabase } from '@/lib/supabase';
import { AuthError, Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';

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

// Configure WebBrowser for better OAuth handling
WebBrowser.maybeCompleteAuthSession();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect to handle initial session retrieval AND auth state changes
  useEffect(() => {
    const handleAuthStateChange = (event: string, currentSession: Session | null) => {
      console.log('Auth state change:', event, currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    };

    // Listen for auth changes and get initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle deep links for OAuth callback
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log('=== DEEP LINK RECEIVED ===');
      console.log('URL:', url);
      console.log('Time:', new Date().toISOString());
      
      // Skip processing if this is just the dev server URL
      if (url.includes('exp://') || url.includes('localhost') || url.includes('192.168')) {
        console.log('Skipping dev server URL');
        return;
      }
      
      // Check if this is an OAuth callback
      if (url.includes('auth/callback') || url.includes('#access_token=') || url.includes('?code=')) {
        console.log('=== OAUTH CALLBACK DETECTED ===');
        
        try {
          // Handle different OAuth callback formats
          if (url.includes('#access_token=')) {
            const hashIndex = url.indexOf('#');
            if (hashIndex !== -1) {
              const hashFragment = url.substring(hashIndex + 1);
              console.log('Hash fragment:', hashFragment);
              
              const params = new URLSearchParams(hashFragment);
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (accessToken) {
                console.log('Setting session from OAuth tokens via deep link');
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
                });
                
                if (error) {
                  console.error('Error setting session via deep link:', error);
                  Alert.alert('Authentication Error', 'Failed to complete sign in. Please try again.');
                } else {
                  console.log('OAuth session established successfully via deep link!');
                  Alert.alert('Success', 'Successfully signed in with Google!');
                }
              }
            }
          } 
          // If it's a code-based callback (authorization code flow)
          else if (url.includes('?code=') || url.includes('&code=')) {
            console.log('Handling authorization code callback');
            // Let Supabase handle the code exchange
            const { data, error } = await supabase.auth.getSessionFromUrl(url);
            
            if (error) {
              console.error('Error exchanging code for session:', error);
              Alert.alert('Authentication Error', 'Failed to complete sign in. Please try again.');
            } else if (data?.session) {
              console.log('Session established from authorization code');
              Alert.alert('Success', 'Successfully signed in!');
            }
          }
        } catch (error) {
          console.error('Error handling OAuth callback:', error);
          Alert.alert('Authentication Error', 'An error occurred during authentication.');
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

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
        redirectTo: 'dxplorer://reset-password',
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
      console.log('Starting Google OAuth flow...');
      
      // First, check if we can get the OAuth URL
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'dxplorer://auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      console.log('Google OAuth response:', { data, error });
      
      if (error) {
        console.error('OAuth error:', error);
        Alert.alert('Authentication Error', error.message || 'Failed to initiate Google sign in');
        return { data: null, error };
      }
      
      if (!data?.url) {
        console.error('No OAuth URL returned');
        Alert.alert('Authentication Error', 'Failed to get authentication URL');
        return { 
          data: null, 
          error: { 
            message: 'No OAuth URL returned', 
            name: 'OAuthError' 
          } as AuthError 
        };
      }

      console.log('Opening OAuth URL:', data.url);
      
      // Validate the URL before opening
      try {
        new URL(data.url);
      } catch (urlError) {
        console.error('Invalid OAuth URL:', data.url);
        Alert.alert('Authentication Error', 'Invalid authentication URL received');
        return { 
          data: null, 
          error: { 
            message: 'Invalid OAuth URL', 
            name: 'InvalidURL' 
          } as AuthError 
        };
      }
      
      // Open the OAuth URL in the system browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        'dxplorer://auth/callback',
        {
          showInRecents: true,
          preferredBarTintColor: '#154689',
          preferredControlTintColor: '#ffffff',
        }
      );
      
      console.log('Browser result:', result);
      
      if (result.type === 'cancel') {
        return { 
          data: null, 
          error: { 
            message: 'OAuth cancelled by user', 
            name: 'OAuthCancelled' 
          } as AuthError 
        };
      }
      
      if (result.type === 'success' && result.url) {
        console.log('OAuth callback URL received:', result.url);
        
        // Process the callback URL immediately
        try {
          if (result.url.includes('#access_token=')) {
            const hashIndex = result.url.indexOf('#');
            if (hashIndex !== -1) {
              const hashFragment = result.url.substring(hashIndex + 1);
              const params = new URLSearchParams(hashFragment);
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (accessToken) {
                console.log('Setting session from OAuth success result');
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
                });
                
                if (sessionError) {
                  console.error('Error setting session from success result:', sessionError);
                } else {
                  console.log('OAuth session established successfully from success result!');
                  return { data: sessionData, error: null };
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing OAuth success result:', error);
        }
        
        return { data: { url: result.url }, error: null };
      }
      
      // If we get here, something went wrong
      console.log('OAuth flow completed but no success URL received');
      
      // Wait a bit and check for session
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('OAuth session found after redirect');
        return { data: { session }, error: null };
      }
      
      return { 
        data: null, 
        error: { 
          message: 'Authentication flow completed but no session established', 
          name: 'NoSession' 
        } as AuthError 
      };
      
    } catch (err) {
      console.error('Google sign in error:', err);
      Alert.alert('Authentication Error', 'An unexpected error occurred during Google sign in');
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
          redirectTo: 'dxplorer://auth/callback',
        },
      });
      
      if (error) {
        console.error('Facebook OAuth error:', error);
        Alert.alert('Authentication Error', error.message || 'Failed to initiate Facebook sign in');
        return { data: null, error };
      }
      
      if (!data?.url) {
        return { 
          data: null, 
          error: { 
            message: 'No OAuth URL returned', 
            name: 'OAuthError' 
          } as AuthError 
        };
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        'dxplorer://auth/callback',
        {
          showInRecents: true,
          preferredBarTintColor: '#154689',
          preferredControlTintColor: '#ffffff',
        }
      );
      
      if (result.type === 'cancel') {
        return { 
          data: null, 
          error: { 
            message: 'OAuth cancelled by user', 
            name: 'OAuthCancelled' 
          } as AuthError 
        };
      }
      
      if (result.type === 'success' && result.url) {
        return { data: { url: result.url }, error: null };
      }
      
      return { data, error };
    } catch (err) {
      console.error('Facebook sign in error:', err);
      Alert.alert('Authentication Error', 'An unexpected error occurred during Facebook sign in');
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