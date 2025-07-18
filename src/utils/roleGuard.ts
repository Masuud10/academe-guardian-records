
import { UserRole } from '@/types/user';

// Define role hierarchy and permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  edufam_admin: ['*'], // Full access
  elimisha_admin: ['*'], // Mirror edufam_admin
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
  
  // Security section is ONLY accessible to edufam_admin
  if (section === 'security') {
    return normalizedRole === 'edufam_admin';
  }
  
  // School analytics should be accessible to edufam_admin
  if (section === 'school-analytics') {
    return normalizedRole === 'edufam_admin';
  }
  
  // Company management should be accessible to edufam_admin
  if (section === 'company-management') {
    return normalizedRole === 'edufam_admin';
  }
  
  // Schools management should be accessible to edufam_admin
  if (section === 'schools') {
    return normalizedRole === 'edufam_admin';
  }
  
  // User management permissions
  if (section === 'users') {
    return ['edufam_admin', 'school_director', 'principal', 'hr'].includes(normalizedRole);
  }
  
  // Billing management only for edufam_admin
  if (section === 'billing') {
    return normalizedRole === 'edufam_admin';
  }
  
  // System health only for edufam_admin
  if (section === 'system-health') {
    return normalizedRole === 'edufam_admin';
  }
  
  // Settings access
  if (section === 'settings') {
    return ['edufam_admin', 'school_director', 'principal'].includes(normalizedRole);
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
  
  // Admin roles have full access
  if (normalizedRole === 'edufam_admin') return true;
  
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
  
  // If admin, return all sections
  if (permissions.includes('*')) {
    return [
      'dashboard', 'analytics', 'school-analytics', 'grades', 'attendance', 
      'students', 'finance', 'timetable', 'announcements', 'messages', 
      'reports', 'support', 'settings', 'schools', 'users', 'billing', 
      'system-health', 'security', 'company-management', 'certificates'
    ];
  }
  
  return [...permissions];
};

// Additional utility functions for specific checks
export const canManageSchools = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  const normalizedRole = userRole.toLowerCase() as UserRole;
  return normalizedRole === 'edufam_admin';
};

export const canManageUsers = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  const normalizedRole = userRole.toLowerCase() as UserRole;
  return ['edufam_admin', 'school_director', 'principal', 'hr'].includes(normalizedRole);
};

export const canAccessBilling = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  const normalizedRole = userRole.toLowerCase() as UserRole;
  return normalizedRole === 'edufam_admin';
};

export const canAccessSystemHealth = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  const normalizedRole = userRole.toLowerCase() as UserRole;
  return normalizedRole === 'edufam_admin';
};

export const canAccessSecurity = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  const normalizedRole = userRole.toLowerCase() as UserRole;
  return normalizedRole === 'edufam_admin';
};

export const canAccessCompanyManagement = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  const normalizedRole = userRole.toLowerCase() as UserRole;
  return normalizedRole === 'edufam_admin';
};

export const canAccessSchoolAnalytics = (userRole: UserRole | undefined): boolean => {
  if (!userRole) return false;
  const normalizedRole = userRole.toLowerCase() as UserRole;
  return normalizedRole === 'edufam_admin';
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    edufam_admin: 'EduFam Administrator',
    elimisha_admin: 'Elimisha Administrator',
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
