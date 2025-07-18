
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useMemo } from 'react';

export const useAnalyticsPermissions = () => {
  const { user } = useAuth();
  const { schoolId, isSystemAdmin } = useSchoolScopedData();

  const permissions = useMemo(() => {
    if (!user) {
      return {
        canViewSystemAnalytics: false,
        canViewSchoolAnalytics: () => false,
        analyticsScope: 'none',
        allowedSchoolIds: []
      };
    }

    const canViewSystemAnalytics = false; // No system analytics in school app
    
    const canViewSchoolAnalytics = (targetSchoolId?: string) => {
      if (!schoolId) return false;
      if (targetSchoolId && targetSchoolId !== schoolId) return false;
      return ['principal', 'school_director', 'teacher', 'hr'].includes(user.role);
    };

    const analyticsScope = (() => {
      if (['principal', 'school_director'].includes(user.role)) return 'school';
      if (user.role === 'teacher') return 'class';
      if (user.role === 'parent') return 'student';
      if (user.role === 'hr') return 'school';
      return 'none';
    })();

    const allowedSchoolIds = (() => {
      if (schoolId) return [schoolId];
      return [];
    })();

    return {
      canViewSystemAnalytics,
      canViewSchoolAnalytics,
      analyticsScope,
      allowedSchoolIds
    };
  }, [user, schoolId]);

  return permissions;
};
