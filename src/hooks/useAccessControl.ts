
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, PERMISSIONS } from '@/utils/permissions';
import { UserRole } from '@/types/user';
import { useCallback } from 'react';

export const useAccessControl = () => {
  const { user } = useAuth();
  
  const { hasPermission } = usePermissions(
    user?.role as UserRole,
    user?.school_id
  );

  const checkAccess = useCallback((section: string): boolean => {
    if (!user?.role) {
      console.log('🔒 useAccessControl: No user role found');
      return false;
    }

    console.log('🔒 useAccessControl: Checking access for section:', section, 'user role:', user.role);

    if (section === 'dashboard') return true;

    switch (section) {
      case 'school-management': {
        // Only principals should have access to school management
        const hasSchoolManagementAccess = user.role === 'principal';
        console.log('🔒 useAccessControl: School management access:', hasSchoolManagementAccess);
        return hasSchoolManagementAccess;
      }
      case 'analytics': {
        // Teachers can access analytics for their classes, principals and school directors can access analytics for their school
        const hasAnalyticsAccess = user.role === 'teacher' || user.role === 'principal' || user.role === 'school_director';
        console.log('🔒 useAccessControl: Analytics access:', hasAnalyticsAccess);
        return hasAnalyticsAccess;
      }
      case 'certificates':
        // Principals can generate certificates, school directors can view
        return user.role === 'principal' || user.role === 'school_director';
      case 'certificate-generation':
        // Only principals can generate certificates
        return user.role === 'principal';
      case 'certificate-viewing':
        // Principals and school directors can view certificates
        return user.role === 'principal' || user.role === 'school_director';
      case 'grades':
        // Principals can access grades for approval/oversight, teachers for entry, parents for viewing
        return user.role === 'principal' || user.role === 'teacher' || user.role === 'parent';
      case 'attendance':
        return hasPermission(PERMISSIONS.VIEW_ATTENDANCE);
      case 'students':
        return hasPermission(PERMISSIONS.VIEW_CLASS_INFO);
      case 'finance':
        return hasPermission(PERMISSIONS.VIEW_FEE_BALANCE);
      case 'timetable':
        return hasPermission(PERMISSIONS.VIEW_TIMETABLE);
      case 'announcements':
        return hasPermission(PERMISSIONS.VIEW_ANNOUNCEMENTS);
      case 'messages':
        return hasPermission(PERMISSIONS.SEND_MESSAGES);
      case 'reports':
        // Teachers have restricted access to reports
        if (user.role === 'teacher') {
          return true; // Allow access but with restrictions in the component
        }
        return hasPermission(PERMISSIONS.VIEW_REPORTS);
      case 'schools':
        return hasPermission(PERMISSIONS.VIEW_OTHER_SCHOOLS);
      case 'users':
        return hasPermission(PERMISSIONS.MANAGE_USERS);
      case 'billing':
        return hasPermission(PERMISSIONS.VIEW_FEE_BALANCE);
      case 'support':
        return hasPermission(PERMISSIONS.ACCESS_SUPPORT);
      default:
        console.log('🔒 useAccessControl: Unknown section:', section);
        return false;
    }
  }, [user, hasPermission]);

  const checkReportAccess = useCallback((reportType: string): boolean => {
    if (!user?.role) return false;
    
    // Teachers can only access grade and attendance reports
    if (user.role === 'teacher') {
      return ['grades', 'attendance', 'grade_report', 'attendance_report'].includes(reportType);
    }
    
    // Other roles have different permissions based on their general report access
    return hasPermission(PERMISSIONS.VIEW_REPORTS);
  }, [user, hasPermission]);

  return { checkAccess, checkReportAccess, user };
};
