
import { useState, useEffect, useRef, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const isMountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);
  const initializedRef = useRef(false);

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

  const fetchProfile = useCallback(async (userId: string): Promise<any> => {
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
    } catch (err: any) {
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

      // Fetch profile with shorter timeout to prevent system-wide blocking
      const profile = await Promise.race([
        fetchProfile(authUser.id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile timeout')), 1000)
        )
      ]).catch((err) => {
        console.warn('🔐 AuthState: Profile fetch failed, continuing with minimal data:', err);
        return null;
      });

      if (!isMountedRef.current) return;

      // Check profile status as well
      if (profile && profile.status === 'inactive') {
        console.log('🔐 AuthState: User profile is inactive, signing out');
        await supabase.auth.signOut();
        if (isMountedRef.current) {
          setUser(null);
          setError('Your account has been deactivated. Please contact your administrator.');
          setIsLoading(false);
          setIsInitialized(true);
        }
        return;
      }

      // Create user data with proper role handling - CRITICAL FIX
      let resolvedRole = profile?.role;
      
      console.log('🔐 AuthState: Profile role found:', resolvedRole);
      
      // If no role in profile, determine from email or metadata
      if (!resolvedRole) {
        resolvedRole = authUser.user_metadata?.role || 
                     authUser.app_metadata?.role;
        
        console.log('🔐 AuthState: Metadata role found:', resolvedRole);
        
        // Email-based role detection as fallback
        if (!resolvedRole) {
          const emailLower = authUser.email.toLowerCase();
          
          if (emailLower.includes('admin@edufam') || emailLower === 'masuud@gmail.com' || emailLower.includes('admin.')) {
            resolvedRole = 'edufam_admin';
          } else if (emailLower.includes('elimisha')) {
            resolvedRole = 'elimisha_admin';
          } else if (emailLower.includes('principal')) {
            resolvedRole = 'principal';
          } else if (emailLower.includes('teacher')) {
            resolvedRole = 'teacher';
          } else if (emailLower.includes('finance') || emailLower.includes('bursar') || emailLower.includes('accounts')) {
            resolvedRole = 'finance_officer';
          } else if (emailLower.includes('owner')) {
            resolvedRole = 'school_owner';
          } else {
            resolvedRole = 'parent';
          }
          
          console.log('🔐 AuthState: Email-based role determined:', resolvedRole);
          
          // Defer profile updates to avoid blocking auth initialization
          if (resolvedRole) {
            setTimeout(async () => {
              try {
                await supabase
                  .from('profiles')
                  .upsert({ 
                    id: authUser.id, 
                    email: authUser.email,
                    role: resolvedRole,
                    name: authUser.user_metadata?.name || authUser.email.split('@')[0]
                  });
              } catch (updateError) {
                console.warn('🔐 AuthState: Failed to update profile role:', updateError);
              }
            }, 100);
          }
        }
      }

      // Determine school assignment
      let userSchoolId = profile?.school_id ||
                        authUser.user_metadata?.school_id ||
                        authUser.app_metadata?.school_id;

      // For non-admin roles without school, we'll handle this later to avoid blocking auth
      // Don't block authentication initialization with school assignment queries

      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email,
        role: resolvedRole, // CRITICAL: Ensure this is set correctly
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

      setUser(userData);
      setError(null);
      setIsLoading(false);
      setIsInitialized(true);
    } catch (err: any) {
      console.error('🔐 AuthState: User processing failed:', err);
      if (isMountedRef.current) {
        setError('User processing failed: ' + (err.message || 'Unknown error'));
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

      } catch (err: any) {
        console.error('🔐 AuthState: Auth initialization failed:', err);
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
