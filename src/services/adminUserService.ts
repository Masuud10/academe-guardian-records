
import { supabase } from '@/integrations/supabase/client';
import { MultiTenantUtils } from '@/utils/multiTenantUtils';

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

      // Validate current user permissions
      const scope = await MultiTenantUtils.getCurrentUserScope();
      const capabilities = MultiTenantUtils.getRoleCapabilities(scope.userRole as any);
      
      if (!capabilities.canCreateUsers) {
        return {
          success: false,
          error: 'You do not have permission to create users'
        };
      }

      // For school-level admins, ensure school_id is set to their school
      if (MultiTenantUtils.isSchoolAdmin(scope.userRole) && scope.schoolId) {
        userData.school_id = scope.schoolId;
      }

      // Use the enhanced create_admin_user database function with multi-tenant support
      const { data, error } = await supabase.rpc('create_admin_user', {
        user_email: userData.email,
        user_password: userData.password,
        user_name: userData.name,
        user_role: userData.role,
        user_school_id: userData.school_id || null
      });

      if (error) {
        console.error('🔧 AdminUserService: Database function error:', error);
        throw new Error(error.message || 'Database operation failed');
      }

      // The function returns a JSONB object - handle the response properly
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
        success: false,
        error: 'Unexpected response from server'
      };

    } catch (error: any) {
      console.error('🔧 AdminUserService: Service error:', {
        error,
        message: error?.message,
        stack: error?.stack
      });
      return {
        success: false,
        error: error?.message || 'Failed to create user'
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

  static async getCurrentUserPermissions() {
    try {
      const scope = await MultiTenantUtils.getCurrentUserScope();
      const capabilities = MultiTenantUtils.getRoleCapabilities(scope.userRole as any);
      
      return {
        canCreateUsers: capabilities.canCreateUsers,
        userRole: scope.userRole,
        schoolId: scope.schoolId,
        isSystemAdmin: scope.isSystemAdmin,
        isSchoolAdmin: MultiTenantUtils.isSchoolAdmin(scope.userRole)
      };
    } catch (error) {
      console.error('🔧 AdminUserService: Permission check error:', error);
      return { 
        canCreateUsers: false, 
        userRole: null, 
        schoolId: null,
        isSystemAdmin: false,
        isSchoolAdmin: false
      };
    }
  }

  static async getUsersForSchool(schoolId?: string) {
    try {
      const scope = await MultiTenantUtils.getCurrentUserScope();
      console.log('🔧 AdminUserService: Getting users for scope:', scope);
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          role,
          school_id,
          created_at,
          updated_at,
          school:schools(name)
        `)
        .order('created_at', { ascending: false });

      // System admins can see all users or filter by school
      if (scope.isSystemAdmin) {
        console.log('🔧 AdminUserService: System admin - fetching all users');
        if (schoolId) {
          query = query.eq('school_id', schoolId);
        }
        // For system admins, don't filter by school_id to see all users
      } else {
        // Non-admin users only see users in their school
        if (scope.schoolId) {
          console.log('🔧 AdminUserService: School admin - filtering by school:', scope.schoolId);
          query = query.eq('school_id', scope.schoolId);
        } else {
          // User has no school, return empty result
          console.log('🔧 AdminUserService: User has no school, returning empty');
          return { data: [], error: null };
        }
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('🔧 AdminUserService: Error fetching users:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Database query failed: ${error.message}`);
      }

      console.log('🔧 AdminUserService: Successfully fetched users:', data?.length || 0, 'users');
      return { data: data || [], error: null };

    } catch (error: any) {
      console.error('🔧 AdminUserService: Service error in getUsersForSchool:', {
        error,
        message: error?.message,
        stack: error?.stack
      });
      return { 
        data: [], 
        error: new Error(error?.message || 'Failed to fetch users')
      };
    }
  }
}
