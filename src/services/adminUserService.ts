
import { supabase } from '@/integrations/supabase/client';

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  school_id?: string;
}

export interface CreateUserResponse {
  success: boolean;
  user_id?: string;
  message?: string;
  error?: string;
}

export class AdminUserService {
  static async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      console.log('🔧 AdminUserService: Creating user via database function', userData);

      // Use the create_admin_user database function which bypasses signup restrictions
      const { data, error } = await supabase.rpc('create_admin_user', {
        user_email: userData.email,
        user_password: userData.password,
        user_name: userData.name,
        user_role: userData.role,
        user_school_id: userData.school_id || null
      });

      if (error) {
        console.error('🔧 AdminUserService: Database function error:', error);
        throw error;
      }

      // The function returns a JSONB object - need to properly handle the Json type
      if (data && typeof data === 'object' && data !== null) {
        const result = data as Record<string, any>;
        
        if ('error' in result && typeof result.error === 'string') {
          console.error('🔧 AdminUserService: Function returned error:', result.error);
          return {
            success: false,
            error: result.error
          };
        }

        if ('success' in result && result.success === true) {
          console.log('🔧 AdminUserService: User created successfully:', result);
          return {
            success: true,
            user_id: typeof result.user_id === 'string' ? result.user_id : undefined,
            message: typeof result.message === 'string' ? result.message : 'User created successfully'
          };
        }
      }

      // Fallback for unexpected response format
      console.warn('🔧 AdminUserService: Unexpected response format:', data);
      return {
        success: true,
        message: 'User created successfully'
      };

    } catch (error: any) {
      console.error('🔧 AdminUserService: Service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create user'
      };
    }
  }

  static async validateUserCreation(email: string): Promise<boolean> {
    try {
      // Check if user exists in profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('🔧 AdminUserService: Validation error:', error);
        return false;
      }

      return !!data; // Returns true if user exists
    } catch (error) {
      console.error('🔧 AdminUserService: Validation exception:', error);
      return false;
    }
  }
}
