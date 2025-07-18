
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export const useAuthValidation = () => {
  const { user, isLoading } = useAuth();
  const [validationState, setValidationState] = useState({
    isAuthenticated: false,
    hasValidRole: false,
    hasSchoolAssignment: false,
    canAccessData: false,
    errors: [] as string[]
  });

  useEffect(() => {
    if (isLoading) return;

    const errors: string[] = [];
    let isAuthenticated = false;
    let hasValidRole = false;
    let hasSchoolAssignment = false;
    let canAccessData = false;

    // Check authentication
    if (!user) {
      errors.push('User not authenticated');
    } else {
      isAuthenticated = true;

      // Check role assignment
      if (!user.role) {
        errors.push('User role not assigned');
      } else {
        hasValidRole = true;

        // Check school assignment for non-admin roles  
        const adminRoles: string[] = []; // No admin roles in school application
        const normalizedRole = user.role.toLowerCase();
        if (!adminRoles.includes(normalizedRole) && !user.school_id) {
          errors.push('School assignment required for this role');
        } else {
          hasSchoolAssignment = true;
          canAccessData = true;
        }
      }
    }

    setValidationState({
      isAuthenticated,
      hasValidRole,
      hasSchoolAssignment,
      canAccessData,
      errors
    });
  }, [user, isLoading]);

  return {
    ...validationState,
    user,
    isLoading
  };
};
