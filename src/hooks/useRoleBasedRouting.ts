
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { RoleResolver } from '@/utils/roleResolver';

export const useRoleBasedRouting = () => {
  const { user, isLoading } = useAuth();

  const validateRole = (allowedRoles: UserRole[]): boolean => {
    if (!user?.role) {
      console.log('🔍 useRoleBasedRouting: No user role found');
      return false;
    }
    
    const normalizedRole = user.role.toLowerCase() as UserRole;
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase() as UserRole);
    const isValid = normalizedAllowedRoles.includes(normalizedRole);
    console.log('🔍 useRoleBasedRouting: Role validation:', {
      userRole: user.role,
      normalizedRole,
      allowedRoles,
      isValid
    });
    
    return isValid;
  };

  const requiresSchoolAssignment = (role: UserRole): boolean => {
    return RoleResolver.requiresSchoolAssignment(role);
  };

  const hasSchoolAssignment = (): boolean => {
    const hasAssignment = !!user?.school_id;
    console.log('🔍 useRoleBasedRouting: School assignment check:', {
      userSchoolId: user?.school_id,
      hasAssignment
    });
    return hasAssignment;
  };

  const canAccessRoute = (allowedRoles: UserRole[], requireSchool = false): boolean => {
    if (isLoading || !user) {
      console.log('🔍 useRoleBasedRouting: Loading or no user');
      return false;
    }
    
    // Check role validation
    if (!validateRole(allowedRoles)) {
      console.log('🔍 useRoleBasedRouting: Role validation failed');
      return false;
    }
    
    // Check school assignment if required
    if (requireSchool && !hasSchoolAssignment()) {
      console.log('🔍 useRoleBasedRouting: School assignment required but missing');
      return false;
    }
    
    console.log('🔍 useRoleBasedRouting: Access granted for route');
    return true;
  };

  const getRedirectPath = (): string => {
    if (!user) {
      console.log('🔍 useRoleBasedRouting: No user, redirecting to home');
      return '/';
    }
    
    const userRole = user.role as UserRole;
    const hasSchool = hasSchoolAssignment();
    const redirectPath = RoleResolver.getDefaultRedirectPath(userRole, hasSchool);
    
    console.log('🔍 useRoleBasedRouting: Redirect path determined:', {
      userRole,
      hasSchool,
      redirectPath
    });
    
    return redirectPath;
  };

  const isSchoolAdmin = (): boolean => {
    if (!user?.role) return false;
    const normalizedRole = user.role.toLowerCase();
    return ['school_director', 'principal'].includes(normalizedRole);
  };

  const isSchoolStaff = (): boolean => {
    if (!user?.role) return false;
    const normalizedRole = user.role.toLowerCase();
    return ['school_director', 'principal', 'teacher', 'finance_officer', 'hr'].includes(normalizedRole);
  };

  const isHRStaff = (): boolean => {
    if (!user?.role) return false;
    const normalizedRole = user.role.toLowerCase();
    return normalizedRole === 'hr';
  };

  return {
    user,
    isLoading,
    validateRole,
    requiresSchoolAssignment,
    hasSchoolAssignment,
    canAccessRoute,
    getRedirectPath,
    isSystemAdmin: false, // Removed isSystemAdmin
    isSchoolAdmin,
    isSchoolStaff,
    isHRStaff
  };
};
