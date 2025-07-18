import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { useMemo } from 'react';

export interface SchoolScopedDataResult {
  schoolId: string | null;
  isReady: boolean;
  isLoading: boolean;
  hasSchool: boolean;
  isMultiTenantUser: boolean;
  isSystemAdmin: boolean;
  userRole: string | undefined;
  validateSchoolAccess: (requiredSchoolId?: string) => boolean;
}

export const useSchoolScopedData = (): SchoolScopedDataResult => {
  const { user, isLoading: authLoading } = useAuth();
  const { currentSchool, isLoading: schoolLoading } = useSchool();

  // Memoize computations to prevent unnecessary re-renders
  const computedValues = useMemo(() => {
    // Guard: Check if user is authenticated and role is loaded
    if (!user || !user.role) {
      return {
        schoolId: null,
        isReady: false,
        isLoading: authLoading || schoolLoading,
        hasSchool: false,
        isMultiTenantUser: false,
        isSystemAdmin: false,
        userRole: undefined,
        validateSchoolAccess: () => false
      };
    }
    
    // System admins removed for school application
    const isMultiTenantUser = false; // No multi-tenant users in school app
    const isSystemAdmin = false; // No system admins in school app
    
    // For school application users, always use their assigned school
    const schoolId = user?.school_id || null;

    const isLoading = authLoading || schoolLoading;
    const hasSchool = !!schoolId;
    const isReady = !isLoading && !!user && !!user.role;

    // Validation function for school access
    const validateSchoolAccess = (requiredSchoolId?: string): boolean => {
      // If no school ID required, just check if user has a school
      if (!requiredSchoolId) {
        return hasSchool;
      }

      // Check if user's school matches required school
      return schoolId === requiredSchoolId;
    };

    return {
      schoolId,
      isReady,
      isLoading,
      hasSchool,
      isMultiTenantUser,
      isSystemAdmin,
      userRole: user.role,
      validateSchoolAccess
    };
  }, [user, currentSchool, authLoading, schoolLoading]);

  // Only log in development or when debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('🏫 useSchoolScopedData:', {
      userRole: computedValues.userRole,
      schoolId: computedValues.schoolId,
      isMultiTenantUser: computedValues.isMultiTenantUser,
      isSystemAdmin: computedValues.isSystemAdmin,
      hasSchool: computedValues.hasSchool,
      isReady: computedValues.isReady,
      isLoading: computedValues.isLoading
    });
  }

  return computedValues;
};