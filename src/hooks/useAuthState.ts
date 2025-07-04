import { useState, useEffect, useRef, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { UserRole } from '@/types/user';
import { AuthService } from '@/services/authService';

// Simple role validation function to avoid external dependencies
const isValidRole = (role: string): boolean => {
  const validRoles: UserRole[] = ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin'];
  return validRoles.includes(role as UserRole);
};

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const isMountedRef = useRef<boolean>(true);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<{ role?: string; name?: string; school_id?: string; avatar_url?: string; mfa_enabled?: boolean; status?: string } | null> => {
    console.log('🔐 AuthState: Fetching profile for', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, name, school_id, avatar_url, mfa_enabled, status')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('🔐 AuthState: Profile fetch error:', error);
        return null;
      }

      return data;
    } catch (err: unknown) {
      console.error('🔐 AuthState: Profile fetch exception:', err);
      return null;
    }
  }, []);

  const processUser = useCallback(async (authUser: SupabaseUser | null) => {
    if (!isMountedRef.current) return;
    
    console.log('🔐 AuthState: Processing user', authUser?.email);
    
    try {
      if (!authUser) {
        console.log('🔐 AuthState: No auth user, clearing state');
        if (isMountedRef.current) {
          setUser(null);
          setError(null);
          setIsLoading(false);
          setIsInitialized(true);
        }
        return;
      }

      if (!authUser.email) {
        console.error('🔐 AuthState: User missing email');
        if (isMountedRef.current) {
          setError('User account is missing email address');
          setIsLoading(false);
          setIsInitialized(true);
        }
        return;
      }

      // Check if user is active from metadata first
      const userMetadata = authUser.user_metadata || {};
      const isActiveFromMetadata = userMetadata.is_active !== false && userMetadata.status !== 'inactive';

      if (!isActiveFromMetadata) {
        console.log('🔐 AuthState: User is inactive, signing out');
        await supabase.auth.signOut();
        if (isMountedRef.current) {
          setUser(null);
          setError('Your account has been deactivated. Please contact your administrator.');
          setIsLoading(false);
          setIsInitialized(true);
        }
        return;
      }

      // Fetch profile synchronously to avoid race conditions
      console.log('🔐 AuthState: Fetching profile for', authUser.id);
      const profile = await fetchProfile(authUser.id);
      
      if (!isMountedRef.current) return;

      // Use only database role - no email-based inference for security
      const resolvedRole = profile?.role;
      
      if (!resolvedRole || !isValidRole(resolvedRole)) {
        console.error('🔐 AuthState: No valid role found in database');
        if (isMountedRef.current) {
          setError('Your account is not properly configured. Please contact your administrator.');
          setIsLoading(false);
          setIsInitialized(true);
        }
        return;
      }

      console.log('🔐 AuthState: Using database role:', resolvedRole);

      // Determine school assignment
      const userSchoolId = profile?.school_id ||
                        authUser.user_metadata?.school_id ||
                        authUser.app_metadata?.school_id;

      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email,
        role: resolvedRole,
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

      console.log('🔐 AuthState: User data processed successfully:', {
        email: userData.email,
        role: userData.role,
        school_id: userData.school_id,
        hasProfile: !!profile
      });

      if (isMountedRef.current) {
        setUser(userData);
        setError(null);
        setIsLoading(false);
        setIsInitialized(true);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      console.error('🔐 AuthState: User processing failed:', error);
      if (isMountedRef.current) {
        setError('User processing failed: ' + (error.message || 'Unknown error'));
        setIsLoading(false);
        setIsInitialized(true);
      }
    }
  }, [fetchProfile]);

  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;
    isMountedRef.current = true;

    const initializeAuth = async () => {
      try {
        console.log('🔐 AuthState: Setting up auth listener');
        
        // Clean up existing subscription
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }

        // Get initial session FIRST for faster loading
        console.log('🔐 AuthState: Getting initial session');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (!isMountedRef.current) return;

        if (sessionError) {
          console.error('🔐 AuthState: Session error:', sessionError);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        // Process initial session immediately
        if (session?.user) {
          await processUser(session.user);
        } else {
          setUser(null);
          setIsLoading(false);
          setIsInitialized(true);
        }

        // THEN set up auth listener for future changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔐 AuthState: Auth event:', event, !!session);
            if (!isMountedRef.current) return;
            
            if (event === 'SIGNED_OUT' || !session) {
              setUser(null);
              setError(null);
              setIsLoading(false);
              setIsInitialized(true);
            } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
              await processUser(session.user);
            }
          }
        );
        subscriptionRef.current = subscription;

      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error('🔐 AuthState: Auth initialization failed:', error);
        if (isMountedRef.current) {
          setError('Authentication failed - please refresh the page');
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();
  }, [processUser]);

  return {
    user,
    isLoading,
    error,
    isInitialized,
  };
};
