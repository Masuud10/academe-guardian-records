import { AuthService } from '@/services/authService';
import { AuthUser } from '@/types/auth';

export interface RouteGuardConfig {
  allowedRoles: string[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export class RouteGuard {
  /**
   * Check if user has access to a specific route
   */
  static async checkAccess(user: AuthUser | null, config: RouteGuardConfig): Promise<{
    hasAccess: boolean;
    redirectTo?: string;
    error?: string;
  }> {
    // If authentication is required but user is not authenticated
    if (config.requireAuth !== false && !user) {
      return {
        hasAccess: false,
        redirectTo: '/login',
        error: 'Authentication required'
      };
    }

    // If user is authenticated but no specific roles are required
    if (!config.allowedRoles || config.allowedRoles.length === 0) {
      return { hasAccess: true };
    }

    // Check if user's role is in the allowed roles
    if (user && config.allowedRoles.includes(user.role)) {
      return { hasAccess: true };
    }

    // Access denied
    return {
      hasAccess: false,
      redirectTo: config.redirectTo || '/unauthorized',
      error: `Access denied. This area is restricted to ${config.allowedRoles.map(role => 
        AuthService.getRoleDisplayName(role)
      ).join(', ')} users only.`
    };
  }

  /**
   * Validate admin access specifically
   */
  static async validateAdminAccess(user: AuthUser | null): Promise<{
    hasAccess: boolean;
    redirectTo?: string;
    error?: string;
  }> {
    if (!user) {
      return {
        hasAccess: false,
        redirectTo: '/login',
        error: 'Authentication required'
      };
    }



    return { hasAccess: true };
  }

  /**
   * Validate school user access specifically
   */
  static async validateSchoolUserAccess(user: AuthUser | null): Promise<{
    hasAccess: boolean;
    redirectTo?: string;
    error?: string;
  }> {
    if (!user) {
      return {
        hasAccess: false,
        redirectTo: '/login',
        error: 'Authentication required'
      };
    }

    if (!AuthService.isSchoolUser(user.role)) {
      return {
        hasAccess: false,
        redirectTo: '/unauthorized',
        error: 'Access denied. This area is restricted to school users only.'
      };
    }

    return { hasAccess: true };
  }

  /**
   * Get route configuration based on path
   */
  static getRouteConfig(pathname: string): RouteGuardConfig {
    // Admin-only routes - redirect to unauthorized
    if (pathname.startsWith('/admin') || 
        pathname.startsWith('/edufam') || 
        pathname.startsWith('/system')) {
      return {
        allowedRoles: [],
        redirectTo: '/unauthorized',
        requireAuth: true
      };
    }

    // Dashboard and school user routes - allow both school users and admin users
    if (pathname.startsWith('/dashboard') || 
        pathname.startsWith('/school') || 
        pathname.startsWith('/students') ||
        pathname.startsWith('/classes') ||
        pathname.startsWith('/grades') ||
        pathname.startsWith('/attendance') ||
        pathname.startsWith('/finance') ||
        pathname.startsWith('/reports')) {
      return {
        allowedRoles: ['school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'hr'],
        redirectTo: '/unauthorized',
        requireAuth: true
      };
    }

    // Public routes
    if (pathname === '/' || 
        pathname === '/login' || 
        pathname === '/about' || 
        pathname === '/contact' ||
        pathname === '/features') {
      return {
        allowedRoles: [],
        requireAuth: false
      };
    }

    // Default: require authentication
    return {
      allowedRoles: [],
      requireAuth: true
    };
  }



  /**
   * Check if user can access school section
   */
  static canAccessSchool(user: AuthUser | null): boolean {
    return user ? AuthService.isSchoolUser(user.role) : false;
  }

  /**
   * Get user's accessible sections
   */
  static getUserAccessibleSections(user: AuthUser | null): {
    canAccessSchool: boolean;
    primarySection: 'school' | null;
  } {
    if (!user) {
      return {
        canAccessSchool: false,
        primarySection: null
      };
    }

    const canAccessSchool = AuthService.isSchoolUser(user.role);

    return {
      canAccessSchool,
      primarySection: canAccessSchool ? 'school' : null
    };
  }
} 