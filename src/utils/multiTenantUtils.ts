
import { supabase } from '@/integrations/supabase/client';

interface UserScope {
  userId: string | null;
  userRole: string | null;
  schoolId: string | null;
  isSystemAdmin: boolean;
}

interface RoleCapabilities {
  canCreateUsers: boolean;
  canCreateSchools: boolean;
  canViewAllSchools: boolean;
  canManageFinance: boolean;
  canViewAnalytics: boolean;
  canAccessSystemSettings: boolean;
  canManageMultipleTenants: boolean;
}

export class MultiTenantUtils {
  static getRoleCapabilities(role: string): RoleCapabilities {
    switch (role) {
      case 'edufam_admin':
        return {
          canCreateUsers: true,
          canCreateSchools: true,
          canViewAllSchools: true,
          canManageFinance: true,
          canViewAnalytics: true,
          canAccessSystemSettings: true,
          canManageMultipleTenants: true
        };
      
      case 'school_director':
      case 'principal':
        return {
          canCreateUsers: true,
          canCreateSchools: false,
          canViewAllSchools: false,
          canManageFinance: true,
          canViewAnalytics: true,
          canAccessSystemSettings: false,
          canManageMultipleTenants: false
        };
      
      case 'teacher':
        return {
          canCreateUsers: false,
          canCreateSchools: false,
          canViewAllSchools: false,
          canManageFinance: false,
          canViewAnalytics: false,
          canAccessSystemSettings: false,
          canManageMultipleTenants: false
        };
      
      case 'parent':
      case 'finance_officer':
        return {
          canCreateUsers: false,
          canCreateSchools: false,
          canViewAllSchools: false,
          canManageFinance: role === 'finance_officer',
          canViewAnalytics: false,
          canAccessSystemSettings: false,
          canManageMultipleTenants: false
        };
      
      default:
        return {
          canCreateUsers: false,
          canCreateSchools: false,
          canViewAllSchools: false,
          canManageFinance: false,
          canViewAnalytics: false,
          canAccessSystemSettings: false,
          canManageMultipleTenants: false
        };
    }
  }

  static isSystemAdmin(role: string): boolean {
    return role === 'edufam_admin';
  }

  static isSchoolAdmin(role: string): boolean {
    return role === 'school_director' || role === 'principal';
  }

  static canAccessSchool(userRole: string, userSchoolId: string | null, targetSchoolId: string): boolean {
    // System admins can access any school
    if (this.isSystemAdmin(userRole)) {
      return true;
    }

    // School-level users can only access their own school
    return userSchoolId === targetSchoolId;
  }

  static filterDataByTenant<T extends { school_id?: string }>(
    data: T[], 
    userRole: string, 
    userSchoolId: string | null
  ): T[] {
    // System admins see all data
    if (this.isSystemAdmin(userRole)) {
      return data;
    }

    // School-level users only see their school's data
    return data.filter(item => item.school_id === userSchoolId);
  }

  /**
   * Validates that a user can perform an action on a specific school
   */
  static validateSchoolAccess(userRole: string, userSchoolId: string | null, targetSchoolId: string): void {
    if (!this.canAccessSchool(userRole, userSchoolId, targetSchoolId)) {
      throw new Error(`Access denied: Cannot access school ${targetSchoolId}`);
    }
  }

  /**
   * Ensures proper school_id is set for multi-tenant operations
   */
  static enforceSchoolIsolation<T extends Record<string, any>>(
    data: T,
    userRole: string,
    userSchoolId: string | null
  ): T & { school_id: string } {
    // System admins must explicitly specify school_id
    if (this.isSystemAdmin(userRole)) {
      if (!data.school_id) {
        throw new Error('System admin must specify school_id for this operation');
      }
      return data as T & { school_id: string };
    }

    // Non-admin users automatically get their school_id assigned
    if (!userSchoolId) {
      throw new Error('User has no school assignment');
    }

    return {
      ...data,
      school_id: userSchoolId
    };
  }

  /**
   * Gets user scope information for multi-tenant operations
   */
  static async getUserScope(): Promise<UserScope> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        userId: null,
        userRole: null,
        schoolId: null,
        isSystemAdmin: false
      };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single();

    const userRole = profile?.role || null;
    const schoolId = profile?.school_id || null;

    return {
      userId: user.id,
      userRole,
      schoolId,
      isSystemAdmin: this.isSystemAdmin(userRole || '')
    };
  }

  /**
   * Validates tenant isolation for database queries
   */
  static validateTenantQuery(
    tableName: string, 
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    userScope: UserScope,
    targetSchoolId?: string
  ): void {
    const tenantAwareTables = [
      'students', 'classes', 'subjects', 'grades', 'attendance', 'fees', 
      'timetables', 'announcements', 'messages', 'support_tickets'
    ];

    // Skip validation for non-tenant aware tables
    if (!tenantAwareTables.includes(tableName)) {
      return;
    }

    // System admins can access all tenants
    if (userScope.isSystemAdmin) {
      return;
    }

    // Non-admin users must have school assignment
    if (!userScope.schoolId) {
      throw new Error(`Multi-tenant violation: User has no school assignment for ${tableName} ${operation}`);
    }

    // Validate school access for operations with target school
    if (targetSchoolId && targetSchoolId !== userScope.schoolId) {
      throw new Error(`Multi-tenant violation: Cannot ${operation} ${tableName} for school ${targetSchoolId}`);
    }
  }
}
