
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

export class RoleResolver {
  /**
   * Resolves user role from database profile ONLY - no email fallbacks
   */
  static resolveRole(authUser: SupabaseUser, profileRole?: string): UserRole {
    console.log('🔍 RoleResolver: Resolving role for user:', authUser.email, {
      profileRole,
      userMetadataRole: authUser.user_metadata?.role,
      appMetadataRole: authUser.app_metadata?.role
    });

    // STRICT: Database role is primary and authoritative
    if (profileRole && this.isValidRole(profileRole)) {
      console.log('🔍 RoleResolver: Using database profile role:', profileRole);
      return profileRole.toLowerCase() as UserRole;
    }

    // Secondary: Check metadata (for admin-assigned roles)
    const metadataRole = authUser.app_metadata?.role || authUser.user_metadata?.role;
    if (metadataRole && this.isValidRole(metadataRole)) {
      console.log('🔍 RoleResolver: Using metadata role:', metadataRole);
      return metadataRole.toLowerCase() as UserRole;
    }

    // If no valid role found, return 'parent' as default
    console.warn('🔍 RoleResolver: No valid role found, defaulting to parent');
    return 'parent';
  }

  /**
   * Validates if a role is one of the allowed UserRole values
   */
  static isValidRole(role: string): boolean {
    if (!role || typeof role !== 'string') return false;
    
    const validRoles: UserRole[] = [
      'school_director',
      'principal', 
      'teacher',
      'parent',
      'finance_officer',
      'hr'
    ];
    return validRoles.includes(role.toLowerCase() as UserRole);
  }

  /**
   * Determines fallback role based on email domain or defaults to 'parent'
   */
  static determineFallbackRole(email?: string): UserRole {
    if (!email) return 'parent';

    // Check for school staff patterns
    if (email.includes('teacher') || email.includes('staff')) {
      return 'teacher';
    }

    if (email.includes('principal') || email.includes('head')) {
      return 'principal';
    }

    if (email.includes('owner') || email.includes('director')) {
      return 'school_director';
    }

    if (email.includes('finance') || email.includes('accounts')) {
      return 'finance_officer';
    }

    // Default to parent for all other cases
    return 'parent';
  }

  /**
   * Checks if a role requires school assignment
   */
  static requiresSchoolAssignment(role: UserRole): boolean {
    if (!role || typeof role !== 'string') return false;
    
    const schoolRequiredRoles: UserRole[] = [
      'school_director',
      'principal',
      'teacher', 
      'finance_officer',
      'hr'
    ];
    return schoolRequiredRoles.includes(role.toLowerCase() as UserRole);
  }

  /**
   * Gets the default redirect path for a role
   */
  static getDefaultRedirectPath(role: UserRole, hasSchoolAssignment: boolean): string {
    if (!role || typeof role !== 'string') return '/';
    
    const normalizedRole = role.toLowerCase() as UserRole;
    switch (normalizedRole) {
      case 'hr':
        return hasSchoolAssignment ? '/dashboard' : '/setup';
      case 'school_director':
      case 'principal':
      case 'teacher':
      case 'finance_officer':
        return hasSchoolAssignment ? '/dashboard' : '/setup';
      case 'parent':
        return '/dashboard';
      default:
        return '/';
    }
  }
}
