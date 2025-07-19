import { UserRole } from '@/types/user';

export type PermissionKey = 
  | 'view_gradebook'
  | 'edit_gradebook'
  | 'view_attendance'
  | 'edit_attendance'
  | 'view_class_info'
  | 'edit_class_info'
  | 'view_fee_balance'
  | 'collect_fees'
  | 'view_timetable'
  | 'edit_timetable'
  | 'view_announcements'
  | 'create_announcements'
  | 'send_messages'
  | 'view_reports'
  | 'generate_reports'
  | 'view_analytics'
  | 'view_other_schools'
  | 'manage_users'
  | 'manage_security'
  | 'access_support';

export type PermissionScope = 'all' | 'school' | 'class' | 'student';

export interface PermissionConfig {
  permissions: PermissionKey[];
  scope: PermissionScope;
}

export const PERMISSIONS: Record<string, PermissionKey> = {
  VIEW_GRADEBOOK: 'view_gradebook',
  EDIT_GRADEBOOK: 'edit_gradebook',
  VIEW_ATTENDANCE: 'view_attendance',
  EDIT_ATTENDANCE: 'edit_attendance',
  VIEW_CLASS_INFO: 'view_class_info',
  EDIT_CLASS_INFO: 'edit_class_info',
  VIEW_FEE_BALANCE: 'view_fee_balance',
  COLLECT_FEES: 'collect_fees',
  VIEW_TIMETABLE: 'view_timetable',
  EDIT_TIMETABLE: 'edit_timetable',
  VIEW_ANNOUNCEMENTS: 'view_announcements',
  CREATE_ANNOUNCEMENTS: 'create_announcements',
  SEND_MESSAGES: 'send_messages',
  VIEW_REPORTS: 'view_reports',
  GENERATE_REPORTS: 'generate_reports',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_OTHER_SCHOOLS: 'view_other_schools',
  MANAGE_USERS: 'manage_users',
  MANAGE_SECURITY: 'manage_security',
  ACCESS_SUPPORT: 'access_support'
};

export const ROLE_PERMISSIONS: Record<UserRole, PermissionConfig> = {

  school_director: {
    permissions: [
      PERMISSIONS.VIEW_GRADEBOOK,
      PERMISSIONS.EDIT_GRADEBOOK,
      PERMISSIONS.VIEW_ATTENDANCE,
      PERMISSIONS.EDIT_ATTENDANCE,
      PERMISSIONS.VIEW_CLASS_INFO,
      PERMISSIONS.EDIT_CLASS_INFO,
      PERMISSIONS.VIEW_FEE_BALANCE,
      PERMISSIONS.COLLECT_FEES,
      PERMISSIONS.VIEW_TIMETABLE,
      PERMISSIONS.EDIT_TIMETABLE,
      PERMISSIONS.VIEW_ANNOUNCEMENTS,
      PERMISSIONS.CREATE_ANNOUNCEMENTS,
      PERMISSIONS.SEND_MESSAGES,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.GENERATE_REPORTS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_SECURITY,
      PERMISSIONS.ACCESS_SUPPORT
    ],
    scope: 'school'
  },
  principal: {
    permissions: [
      PERMISSIONS.VIEW_GRADEBOOK,
      PERMISSIONS.EDIT_GRADEBOOK,
      PERMISSIONS.VIEW_ATTENDANCE,
      PERMISSIONS.EDIT_ATTENDANCE,
      PERMISSIONS.VIEW_CLASS_INFO,
      PERMISSIONS.EDIT_CLASS_INFO,
      PERMISSIONS.VIEW_FEE_BALANCE,
      PERMISSIONS.VIEW_TIMETABLE,
      PERMISSIONS.EDIT_TIMETABLE,
      PERMISSIONS.VIEW_ANNOUNCEMENTS,
      PERMISSIONS.CREATE_ANNOUNCEMENTS,
      PERMISSIONS.SEND_MESSAGES,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.GENERATE_REPORTS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.ACCESS_SUPPORT
    ],
    scope: 'school'
  },
  teacher: {
    permissions: [
      PERMISSIONS.VIEW_GRADEBOOK,
      PERMISSIONS.EDIT_GRADEBOOK,
      PERMISSIONS.VIEW_ATTENDANCE,
      PERMISSIONS.EDIT_ATTENDANCE,
      PERMISSIONS.VIEW_CLASS_INFO,
      PERMISSIONS.VIEW_TIMETABLE,
      PERMISSIONS.VIEW_ANNOUNCEMENTS,
      PERMISSIONS.SEND_MESSAGES,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.ACCESS_SUPPORT
    ],
    scope: 'class'
  },
  finance_officer: {
    permissions: [
      PERMISSIONS.VIEW_FEE_BALANCE,
      PERMISSIONS.COLLECT_FEES,
      PERMISSIONS.VIEW_ANNOUNCEMENTS,
      PERMISSIONS.SEND_MESSAGES,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.ACCESS_SUPPORT
    ],
    scope: 'school'
  },
  hr: {
    permissions: [
      PERMISSIONS.VIEW_ATTENDANCE,
      PERMISSIONS.VIEW_CLASS_INFO,
      PERMISSIONS.VIEW_ANNOUNCEMENTS,
      PERMISSIONS.CREATE_ANNOUNCEMENTS,
      PERMISSIONS.SEND_MESSAGES,
      PERMISSIONS.VIEW_REPORTS,
      PERMISSIONS.GENERATE_REPORTS,
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.ACCESS_SUPPORT
    ],
    scope: 'school'
  },
  parent: {
    permissions: [
      PERMISSIONS.VIEW_GRADEBOOK,
      PERMISSIONS.VIEW_ATTENDANCE,
      PERMISSIONS.VIEW_CLASS_INFO,
      PERMISSIONS.VIEW_FEE_BALANCE,
      PERMISSIONS.VIEW_TIMETABLE,
      PERMISSIONS.VIEW_ANNOUNCEMENTS,
      PERMISSIONS.SEND_MESSAGES,
      PERMISSIONS.ACCESS_SUPPORT
    ],
    scope: 'student'
  }
};

export const usePermissions = (role: UserRole, schoolId?: string) => {
  const hasPermission = (permission: PermissionKey): boolean => {
    if (!role) return false;
    
    const roleConfig = ROLE_PERMISSIONS[role];
    if (!roleConfig) return false;
    
    return roleConfig.permissions.includes(permission);
  };

  const getPermissionScope = (permission: PermissionKey): PermissionScope | null => {
    if (!role) return null;
    
    const roleConfig = ROLE_PERMISSIONS[role];
    if (!roleConfig || !roleConfig.permissions.includes(permission)) {
      return null;
    }
    
    return roleConfig.scope;
  };

  const canAccessSchool = (targetSchoolId: string): boolean => {
    if (!role) return false;
    
    const roleConfig = ROLE_PERMISSIONS[role];
    if (!roleConfig) return false;
    
    // System admins can access any school
    if (roleConfig.scope === 'all') return true;
    
    // For school-scoped roles, check if the school matches
    if (roleConfig.scope === 'school' || roleConfig.scope === 'class' || roleConfig.scope === 'student') {
      return schoolId === targetSchoolId;
    }
    
    return false;
  };

  const canAccessClass = (classId: string): boolean => {
    if (!role) return false;
    
    const roleConfig = ROLE_PERMISSIONS[role];
    if (!roleConfig) return false;
    
    // System admins can access any class
    if (roleConfig.scope === 'all') return true;
    
    // School-scoped roles can access any class in their school
    if (roleConfig.scope === 'school') return true;
    
    // For class-scoped roles, we would need to check if the class belongs to their assigned classes
    // This would require additional context that we don't have here
    // For now, we'll assume they can access it if they have class scope
    if (roleConfig.scope === 'class') return true;
    
    // For student-scoped roles, we would need to check if their student is in this class
    // This would require additional context that we don't have here
    
    return false;
  };

  const canAccessStudent = (studentId: string, studentSchoolId?: string): boolean => {
    if (!role) return false;
    
    const roleConfig = ROLE_PERMISSIONS[role];
    if (!roleConfig) return false;
    
    // System admins can access any student
    if (roleConfig.scope === 'all') return true;
    
    // School-scoped roles can access any student in their school
    if (roleConfig.scope === 'school') {
      return !studentSchoolId || schoolId === studentSchoolId;
    }
    
    // For class-scoped roles, we would need to check if the student is in their class
    // This would require additional context that we don't have here
    // For now, we'll assume they can access it if they have class scope
    if (roleConfig.scope === 'class') return true;
    
    // For student-scoped roles, we would need to check if this is their student
    // This would require additional context that we don't have here
    
    return false;
  };

  return {
    hasPermission,
    getPermissionScope,
    canAccessSchool,
    canAccessClass,
    canAccessStudent
  };
};
