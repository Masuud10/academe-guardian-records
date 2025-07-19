import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { handleAuthError } from '@/utils/unifiedErrorHandler';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useConsolidatedAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isInitialized: false
  });

  const isMountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);

  // Fetch user profile with timeout and retry logic
  const fetchProfile = useCallback(async (userId: string): Promise<any> => {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔐 Fetching profile for user ${userId} (attempt ${attempt})`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('role, name, school_id, avatar_url, mfa_enabled, status')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        console.log('✅ Profile fetched successfully:', data);
        return data;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Profile fetch attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    console.error('❌ All profile fetch attempts failed');
    throw lastError;
  }, []);

  // Process user authentication
  const processUser = useCallback(async (authUser: any) => {
    if (!isMountedRef.current) return;
    
    console.log('🔐 Processing user:', authUser?.email);
    
    try {
      if (!authUser) {
        console.log('🔐 No auth user, clearing state');
        setState({
          user: null,
          isLoading: false,
          error: null,
          isInitialized: true
        });
        return;
      }

      if (!authUser.email) {
        console.error('🔐 User missing email');
        setState({
          user: null,
          isLoading: false,
          error: 'User account is missing email address',
          isInitialized: true
        });
        return;
      }

      // Check if user is active from metadata
      const userMetadata = authUser.user_metadata || {};
      const isActiveFromMetadata = userMetadata.is_active !== false && userMetadata.status !== 'inactive';

      if (!isActiveFromMetadata) {
        console.log('🔐 User is inactive, signing out');
        await supabase.auth.signOut();
        setState({
          user: null,
          isLoading: false,
          error: 'Your account has been deactivated. Please contact your administrator.',
          isInitialized: true
        });
        return;
      }

      // Fetch profile with timeout protection
      console.log('🔐 Fetching profile for', authUser.id);
      const profile = await fetchProfile(authUser.id);
      
      if (!isMountedRef.current) return;

      // Validate role exists
      if (!profile?.role) {
        console.error('🔐 No valid role found in database');
        setState({
          user: null,
          isLoading: false,
          error: 'Your account is not properly configured. Please contact your administrator.',
          isInitialized: true
        });
        return;
      }

      // Validate school assignment for non-admin roles
      const requiresSchoolAssignment = !['school_director', 'principal', 'teacher', 'finance_officer', 'hr'].includes(profile.role);
      const hasSchoolAssignment = !!profile?.school_id;
      
      if (requiresSchoolAssignment && !hasSchoolAssignment) {
        console.error('🔐 Role requires school assignment but none found:', profile.role);
        setState({
          user: null,
          isLoading: false,
          error: 'Your account is not properly configured. Please contact your administrator.',
          isInitialized: true
        });
        return;
      }

      console.log('🔐 Using database role:', profile.role);

      // Determine school assignment
      const userSchoolId = profile?.school_id ||
                        authUser.user_metadata?.school_id ||
                        authUser.app_metadata?.school_id;

      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email,
        role: profile.role,
        name: profile?.name ||
              authUser.user_metadata?.name ||
              authUser.user_metadata?.full_name ||
              authUser.email.split('@')[0] ||
              'User',
        school_id: userSchoolId,
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at,
        user_metadata: authUser.user_metadata || {},
        app_metadata: authUser.app_metadata || {},
        mfa_enabled: profile?.mfa_enabled || false,
        last_login_at: authUser.last_sign_in_at || undefined,
        last_login_ip: undefined,
      };

      console.log('🔐 User data processed successfully:', {
        email: userData.email,
        role: userData.role,
        school_id: userData.school_id,
        hasProfile: !!profile
      });

      setState({
        user: userData,
        isLoading: false,
        error: null,
        isInitialized: true
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('🔐 User processing failed:', error);
      
      handleAuthError(error, {
        action: 'process_user',
        userId: authUser?.id,
        metadata: { email: authUser?.email }
      });
      
      setState({
        user: null,
        isLoading: false,
        error: 'User processing failed: ' + (error.message || 'Unknown error'),
        isInitialized: true
      });
    }
  }, [fetchProfile]);

  // Initialize authentication
  useEffect(() => {
    isMountedRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Setting up auth listener');
        
        // Clean up existing subscription
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }

        // Get initial session with timeout protection
        console.log('🔐 Getting initial session');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (!isMountedRef.current) return;

        if (sessionError) {
          console.error('🔐 Session error:', sessionError);
          setState(prev => ({
            ...prev,
            isLoading: false,
            isInitialized: true
          }));
          return;
        }

        // Process initial session immediately
        if (session?.user) {
          await processUser(session.user);
        } else {
          setState({
            user: null,
            isLoading: false,
            error: null,
            isInitialized: true
          });
        }

        // Set up auth listener for future changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔐 Auth event:', event, !!session);
            if (!isMountedRef.current) return;
            
            if (event === 'SIGNED_OUT' || !session) {
              setState({
                user: null,
                isLoading: false,
                error: null,
                isInitialized: true
              });
            } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
              await processUser(session.user);
            }
          }
        );
        subscriptionRef.current = subscription;

      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('🔐 Auth initialization failed:', error);
        
        handleAuthError(error, {
          action: 'initialize_auth'
        });
        
        if (isMountedRef.current) {
          setState({
            user: null,
            isLoading: false,
            error: 'Authentication failed - please refresh the page',
            isInitialized: true
          });
        }
      }
    };

    initializeAuth();

    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [processUser]);

  // Sign in method
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('🔐 Sign in failed:', error);
        handleAuthError(error, {
          action: 'sign_in',
          metadata: { email }
        });
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
        
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('🔐 Sign in successful for:', email);
        return { success: true };
      }

      return { success: false, error: 'Sign in failed - no user returned' };
    } catch (error) {
      console.error('🔐 Sign in exception:', error);
      handleAuthError(error, {
        action: 'sign_in',
        metadata: { email }
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign out method
  const signOut = useCallback(async () => {
    try {
      console.log('🔐 Signing out user');
      await supabase.auth.signOut();
      setState({
        user: null,
        isLoading: false,
        error: null,
        isInitialized: true
      });
    } catch (error) {
      console.error('🔐 Sign out failed:', error);
      handleAuthError(error, {
        action: 'sign_out'
      });
    }
  }, []);

  // Refresh user method
  const refreshUser = useCallback(async () => {
    try {
      console.log('🔐 Refreshing user data');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await processUser(user);
      }
    } catch (error) {
      console.error('🔐 Refresh user failed:', error);
      handleAuthError(error, {
        action: 'refresh_user'
      });
    }
  }, [processUser]);

  return {
    ...state,
    signIn,
    signOut,
    refreshUser
  };
}; 