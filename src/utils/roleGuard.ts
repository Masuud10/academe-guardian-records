
import { UserRole } from '@/types/user';

// Define role hierarchy and permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {

  principal: ['dashboard', 'analytics', 'grades', 'attendance', 'students', 'finance', 'timetable', 'announcements', 'messages', 'reports', 'support'],
  teacher: ['dashboard', 'analytics', 'grades', 'attendance', 'students', 'timetable', 'announcements', 'messages', 'reports', 'support'],
  school_director: ['dashboard', 'analytics', 'grades', 'attendance', 'students', 'finance', 'timetable', 'announcements', 'messages', 'reports', 'support'],
  finance_officer: ['dashboard', 'analytics', 'finance', 'students', 'reports', 'announcements', 'messages', 'attendance', 'timetable', 'support'],
  hr: ['dashboard', 'analytics', 'attendance', 'students', 'announcements', 'messages', 'reports', 'support', 'users'],
  parent: ['dashboard', 'grades', 'attendance', 'finance', 'timetable', 'announcements', 'messages', 'support']
};

export const hasAccess = (userRole: UserRole | undefined, section: string): boolean => {
  if (!userRole) return false;
  
  const normalizedRole = userRole.toLowerCase() as UserRole;
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  if (!permissions) return false;
  
  // Admin roles have full access
  if (permissions.includes('*')) return true;
  
  // User management permissions
  if (section === 'users') {
    return ['school_director', 'principal', 'hr'].includes(normalizedRole);
  }
  
  // Settings access
  if (section === 'settings') {
    return ['school_director', 'principal'].includes(normalizedRole);
  }
  
  // Reports section restrictions for teachers
  if (section === 'reports') {
    if (normalizedRole === 'teacher') {
      // Teachers can access reports but with restrictions
      return true;
    }
    return permissions.includes(section);
  }
  
  // Check if the section is in the role's permissions
  return permissions.includes(section);
};

export const canAccessModule = (userRole: UserRole | undefined, module: string): boolean => {
  return hasAccess(userRole, module);
};

export const canAccessReportType = (userRole: UserRole | undefined, reportType: string): boolean => {
  if (!userRole) return false;
  
  const normalizedRole = userRole.toLowerCase() as UserRole;
  

  
  // Teachers can only access grade and attendance reports
  if (normalizedRole === 'teacher') {
    return ['grades', 'attendance', 'grade_report', 'attendance_report'].includes(reportType);
  }
  
  // Other roles have different permissions
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  if (!permissions) return false;
  
  return permissions.includes('reports');
};

export const getAccessibleSections = (userRole: UserRole | undefined): string[] => {
  if (!userRole) return [];
  
  const normalizedRole = userRole.toLowerCase() as UserRole;
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  if (!permissions) return [];
  

  
  return [...permissions];
};

// Additional utility functions for specific checks
export const canManageUsers = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  const normalizedRole = userRole.toLowerCase() as UserRole;
  return ['school_director', 'principal', 'hr'].includes(normalizedRole);
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    school_director: 'School Director',
    principal: 'Principal',
    teacher: 'Teacher',
    finance_officer: 'Finance Officer',
    hr: 'HR Manager',
    parent: 'Parent'
  };
  
  return roleNames[role] || role;
};

export const validateModuleAccess = (userRole: UserRole | undefined, moduleName: string): boolean => {
  console.log(`🔐 RoleGuard: Validating access for role "${userRole}" to module "${moduleName}"`);
  
  const hasAccessResult = hasAccess(userRole, moduleName);
  
  console.log(`🔐 RoleGuard: Access ${hasAccessResult ? 'GRANTED' : 'DENIED'} for ${userRole} to ${moduleName}`);
  
  return hasAccessResult;
};
