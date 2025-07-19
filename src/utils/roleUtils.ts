
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';

export const determineUserRole = (authUser: User, profileRole?: string): UserRole => {
  console.log('🔍 RoleUtils: Determining role for user', authUser.email, {
    profileRole,
    userMetadataRole: authUser.user_metadata?.role,
    appMetadataRole: authUser.app_metadata?.role,
    email: authUser.email
  });

  // Priority 1: Use profile role if it exists and is valid
  if (profileRole && isValidRole(profileRole)) {
    const normalizedRole = normalizeRole(profileRole);
    console.log('🔍 RoleUtils: Using profile role:', normalizedRole);
    return normalizedRole as UserRole;
  }

  // Priority 2: Use app_metadata role (set by server/admin)
  if (authUser.app_metadata?.role && isValidRole(authUser.app_metadata.role)) {
    const normalizedRole = normalizeRole(authUser.app_metadata.role);
    console.log('🔍 RoleUtils: Using app_metadata role:', normalizedRole);
    return normalizedRole as UserRole;
  }

  // Priority 3: Use user_metadata role (set during signup)
  if (authUser.user_metadata?.role && isValidRole(authUser.user_metadata.role)) {
    const normalizedRole = normalizeRole(authUser.user_metadata.role);
    console.log('🔍 RoleUtils: Using user_metadata role:', normalizedRole);
    return normalizedRole as UserRole;
  }

  // Priority 4: Determine role based on email patterns
  const emailBasedRole = determineRoleFromEmail(authUser.email || '');
  console.log('🔍 RoleUtils: Using email-based role:', emailBasedRole);
  return emailBasedRole;
};

const normalizeRole = (role: string): string => {
  if (!role || typeof role !== 'string') {
    console.warn('🔍 RoleUtils: Invalid role provided for normalization:', role);
    return 'parent';
  }

  // Clean and normalize the role string
  const normalized = role.toLowerCase().trim();
  
  // Handle common role variations and map them to standard roles
  const roleMap: { [key: string]: string } = {
    // School director variations
    'school_director': 'school_director',
    'schooldirector': 'school_director',
    'director': 'school_director',
    'school_owner': 'school_director', // Legacy support
    'schoolowner': 'school_director',
    'owner': 'school_director',
    
    // Finance officer variations
    'finance_officer': 'finance_officer',
    'financeofficer': 'finance_officer',
    'finance': 'finance_officer',
    
    
    
    // Standard roles
    'principal': 'principal',
    'teacher': 'teacher',
    'parent': 'parent'
  };
  
  const mappedRole = roleMap[normalized] || normalized;
  console.log('🔍 RoleUtils: Role normalized from', role, 'to', mappedRole);
  return mappedRole;
};

const isValidRole = (role: string): boolean => {
  if (!role || typeof role !== 'string') {
    console.warn('🔍 RoleUtils: Invalid role type for validation:', typeof role, role);
    return false;
  }

  const normalizedRole = normalizeRole(role);
  const validRoles: UserRole[] = ['school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'hr'];
  const isValid = validRoles.includes(normalizedRole as UserRole);
  
  console.log('🔍 RoleUtils: Role validation for', role, '(normalized:', normalizedRole, ') =', isValid);
  return isValid;
};

// Email-based role detection is now only used as a fallback during initial registration
// and has been moved to useAuthState.ts to avoid multiple sources of truth
const determineRoleFromEmail = (email: string): UserRole => {
  console.warn('🔍 RoleUtils: Email-based role detection should only be used during registration');
  return 'parent'; // Default fallback
};

export const getRoleDisplayName = (role: UserRole): string => {
  if (!role || typeof role !== 'string') return 'Unknown';
  
  const normalizedRole = role.toLowerCase() as UserRole;
  switch (normalizedRole) {

    case 'elimisha_admin':
      return 'Elimisha Admin';
    case 'school_director':
      return 'School Director';
    case 'principal':
      return 'Principal';
    case 'teacher':
      return 'Teacher';
    case 'finance_officer':
      return 'Finance Officer';
    case 'hr':
      return 'HR Manager';
    case 'parent':
      return 'Parent';
    default:
      return role;
  }
};

export const getRoleBadgeColor = (role: UserRole): string => {
  if (!role || typeof role !== 'string') return 'bg-gray-100 text-gray-800';
  
  const normalizedRole = role.toLowerCase() as UserRole;
  switch (normalizedRole) {

    case 'elimisha_admin':
      return 'bg-purple-100 text-purple-800';
    case 'school_director':
      return 'bg-green-100 text-green-800';
    case 'principal':
      return 'bg-orange-100 text-orange-800';
    case 'teacher':
      return 'bg-cyan-100 text-cyan-800';
    case 'finance_officer':
      return 'bg-yellow-100 text-yellow-800';
    case 'hr':
      return 'bg-indigo-100 text-indigo-800';
    case 'parent':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
