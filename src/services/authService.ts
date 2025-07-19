import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface RoleValidationResult {
  isValid: boolean;
  user?: AuthUser;
  error?: string;
}

export interface StrictLoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  accessType?: 'school' | 'admin';
}

export class AuthService {
  /**
   * Authenticate user with strict role-based validation
   * This method enforces that users can only access the appropriate login section
   */
  static async authenticateUserWithStrictRoleValidation(
    email: string, 
    password: string, 
    accessType: 'school' | 'admin'
  ): Promise<StrictLoginResult> {
    try {
      console.log('🔐 AuthService: Authenticating user with strict role validation:', {
        email,
        accessType
      });
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        console.error('🔐 AuthService: Authentication failed:', authError);
        return {
          success: false,
          error: this.getUserFriendlyError(authError.message),
          accessType
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Authentication failed - no user returned',
          accessType
        };
      }

      // Fetch user profile from database to validate role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, name, school_id, avatar_url, mfa_enabled, status')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('🔐 AuthService: Profile fetch failed:', profileError);
        return {
          success: false,
          error: 'Unable to retrieve user profile. Please contact support.',
          accessType
        };
      }

      // Check if user account is active
      if (profile.status === 'inactive' || profile.status === 'suspended') {
        return {
          success: false,
          error: 'Your account has been deactivated. Please contact your administrator.',
          accessType
        };
      }

      // Validate role exists
      if (!profile.role) {
        return {
          success: false,
          error: 'User role not assigned. Please contact your administrator.',
          accessType
        };
      }

      // STRICT ROLE-BASED ACCESS VALIDATION
      const roleValidation = this.validateRoleForAccessType(profile.role, accessType);
      if (!roleValidation.isValid) {
        console.error('🔐 AuthService: Role access denied:', {
          userRole: profile.role,
          requestedAccessType: accessType,
          error: roleValidation.error
        });
        
        return {
          success: false,
          error: roleValidation.error,
          accessType
        };
      }

      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        role: profile.role,
        name: profile.name || authData.user.email!.split('@')[0],
        school_id: profile.school_id,
        avatar_url: profile.avatar_url,
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at,
        user_metadata: authData.user.user_metadata || {},
        app_metadata: authData.user.app_metadata || {},
        mfa_enabled: profile.mfa_enabled || false,
        last_login_at: authData.user.last_sign_in_at || undefined,
        last_login_ip: undefined,
      };

      console.log('🔐 AuthService: User authenticated successfully with strict role validation:', {
        email: user.email,
        role: user.role,
        school_id: user.school_id,
        accessType
      });

      return {
        success: true,
        user,
        accessType
      };

    } catch (error) {
      console.error('🔐 AuthService: Authentication exception:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        accessType
      };
    }
  }

  /**
   * Validate if a user role can access a specific login type
   */
  static validateRoleForAccessType(userRole: string, accessType: 'school' | 'admin'): {
    isValid: boolean;
    error?: string;
  } {
    // Define which roles can access which login types
    const adminRoles: string[] = []; // No admin roles in school application
    const schoolRoles = ['school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'hr'];

    if (accessType === 'admin') {
      // Only admin roles can access admin login
      if (!adminRoles.includes(userRole)) {
        return {
          isValid: false,
          error: `Access denied. The EduFam Admin Staff login is restricted to internal staff only. Your account (${this.getRoleDisplayName(userRole)}) is not authorized for this access. Please use the School Users login section.`
        };
      }
    } else if (accessType === 'school') {
      // Only school roles can access school login
      if (!schoolRoles.includes(userRole)) {
        return {
          isValid: false,
          error: `Access denied. The School Users login is restricted to school staff and parents only. Your account (${this.getRoleDisplayName(userRole)}) is not authorized for this access. Please use the EduFam Admin Staff login section.`
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Legacy method for backward compatibility
   */
  static async authenticateUser(email: string, password: string): Promise<LoginResult> {
    // Default to school access type for backward compatibility
    const result = await this.authenticateUserWithStrictRoleValidation(email, password, 'school');
    return {
      success: result.success,
      user: result.user,
      error: result.error
    };
  }

  /**
   * Validate user role for specific access type
   */
  static async validateRoleAccess(userId: string, requiredRole: string): Promise<RoleValidationResult> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, name, school_id, avatar_url, mfa_enabled, status')
        .eq('id', userId)
        .single();

      if (error) {
        return {
          isValid: false,
          error: 'Unable to validate user role'
        };
      }

      if (profile.status === 'inactive' || profile.status === 'suspended') {
        return {
          isValid: false,
          error: 'Your account has been deactivated'
        };
      }

      // Strict role validation
      if (profile.role !== requiredRole) {
        return {
          isValid: false,
          error: `Access denied. This area is restricted to ${this.getRoleDisplayName(requiredRole)} users only.`
        };
      }

      return {
        isValid: true,
        user: {
          id: userId,
          role: profile.role,
          name: profile.name,
          school_id: profile.school_id,
          avatar_url: profile.avatar_url,
          mfa_enabled: profile.mfa_enabled || false,
        } as AuthUser
      };

    } catch (error) {
      console.error('🔐 AuthService: Role validation error:', error);
      return {
        isValid: false,
        error: 'Role validation failed'
      };
    }
  }

  /**
   * Send password reset email with role validation
   */
  static async sendPasswordResetWithRoleValidation(
    email: string, 
    accessType: 'school' | 'admin'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First, check if the user exists and validate their role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status, name')
        .eq('email', email)
        .single();

      if (profileError) {
        // Don't reveal if user exists or not for security
        console.log('🔐 AuthService: Password reset requested for non-existent or invalid email:', email);
        return { success: true }; // Return success to prevent email enumeration
      }

      // Check if user account is active
      if (profile.status === 'inactive' || profile.status === 'suspended') {
        return {
          success: false,
          error: 'Password reset is not available for deactivated accounts. Please contact your administrator.'
        };
      }

      // Validate role for access type
      const roleValidation = this.validateRoleForAccessType(profile.role, accessType);
      if (!roleValidation.isValid) {
        return {
          success: false,
          error: roleValidation.error
        };
      }

      // Generate password reset link using Supabase Auth
      const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        console.error('🔐 AuthService: Password reset token generation error:', resetError);
        return {
          success: false,
          error: this.getUserFriendlyError(resetError.message)
        };
      }

      // Send custom branded email using our edge function
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: email,
          resetUrl: `${window.location.origin}/reset-password`,
          userRole: profile.role,
          userName: profile.name || profile.role
        }
      });

      if (emailError) {
        console.error('🔐 AuthService: Custom email sending error:', emailError);
        return {
          success: false,
          error: 'Failed to send password reset email. Please try again.'
        };
      }

      console.log('✅ AuthService: Password reset email sent successfully via edge function');
      return { success: true };

    } catch (error) {
      console.error('🔐 AuthService: Password reset exception:', error);
      return {
        success: false,
        error: 'Failed to send password reset email. Please try again.'
      };
    }
  }

  /**
   * Send password reset email (legacy method)
   */
  static async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    return this.sendPasswordResetWithRoleValidation(email, 'school');
  }

  /**
   * Check if user is EduFam Admin (blocked in school application)
   */
  static isEduFamAdmin(role: string): boolean {
    // Admin roles are not supported in the school application
    return false;
  }

  /**
   * Check if user is a school user (non-admin)
   */
  static isSchoolUser(role: string): boolean {
    // Only allow these roles for school login
    return [
      'school_director',
      'principal',
      'teacher',
      'hr',
      'finance_officer',
      'parent'
    ].includes(role);
  }

  /**
   * Get user-friendly error messages
   */
  private static getUserFriendlyError(errorMessage: string): string {
    const errorLower = errorMessage.toLowerCase();
    
    if (errorLower.includes('invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    if (errorLower.includes('email not confirmed')) {
      return 'Please verify your email address before logging in.';
    }
    
    if (errorLower.includes('too many requests')) {
      return 'Too many login attempts. Please wait a few minutes before trying again.';
    }
    
    if (errorLower.includes('user not found')) {
      return 'No account found with this email address.';
    }
    
    return 'Login failed. Please check your credentials and try again.';
  }

  /**
   * Get display name for role
   */
  static getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      'school_director': 'School Director',
      'principal': 'Principal',
      'teacher': 'Teacher',
      'parent': 'Parent',
      'finance_officer': 'Finance Officer',
      'hr': 'HR Manager'
    };
    
    return roleNames[role] || role;
  }

  /**
   * Get access type for a role (always school for school application)
   */
  static getAccessTypeForRole(role: string): 'school' | 'admin' {
    // School application only supports school access
    return 'school';
  }

  /**
   * Universal authentication method that determines user role and access type automatically
   * BLOCKED FOR ADMIN USERS - This is the school application only
   */
  static async authenticateUserUniversal(
    email: string, 
    password: string
  ): Promise<StrictLoginResult> {
    try {
      console.log('🔐 AuthService: Universal authentication for:', email);

      // First, authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        console.error('🔐 AuthService: Authentication error:', authError);
        return {
          success: false,
          error: this.getUserFriendlyError(authError.message)
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Authentication failed. Please check your credentials.'
        };
      }

      // Get user profile to determine role and access type
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, name, school_id, avatar_url, mfa_enabled, status')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('🔐 AuthService: Profile fetch error:', profileError);
        return {
          success: false,
          error: 'Unable to retrieve user profile. Please contact support.'
        };
      }

      // Check account status
      if (profile.status === 'inactive' || profile.status === 'suspended') {
        return {
          success: false,
          error: 'Your account has been deactivated. Please contact your administrator.'
        };
      }

      // Ensure only school-based roles can access this application
      if (!this.isSchoolUser(profile.role)) {
        console.log('🔐 AuthService: Invalid role for school application:', profile.role);
        return {
          success: false,
          error: 'Your account role is not authorized for this application.'
        };
      }

      // Set access type to school since this is the school application
      const accessType = 'school';

      // Create user object
      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email!,
        role: profile.role,
        name: profile.name,
        school_id: profile.school_id,
        avatar_url: profile.avatar_url,
        mfa_enabled: profile.mfa_enabled || false,
      };

      console.log('🔐 AuthService: Universal authentication successful:', {
        userId: user.id,
        role: user.role,
        accessType
      });

      return {
        success: true,
        user,
        accessType
      };

    } catch (error) {
      console.error('🔐 AuthService: Universal authentication exception:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  /**
   * Universal password reset that works for all user types
   */
  static async sendUniversalPasswordReset(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 AuthService: Universal password reset for:', email);

      // First, check if the user exists and get their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status, name')
        .eq('email', email)
        .single();

      if (profileError) {
        // Don't reveal if user exists or not for security
        console.log('🔐 AuthService: Password reset requested for non-existent or invalid email:', email);
        return { success: true }; // Return success to prevent email enumeration
      }

      // Check if user account is active
      if (profile.status === 'inactive' || profile.status === 'suspended') {
        return {
          success: false,
          error: 'Password reset is not available for deactivated accounts. Please contact your administrator.'
        };
      }

      // Generate password reset token
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('🔐 AuthService: Password reset error:', error);
        return {
          success: false,
          error: this.getUserFriendlyError(error.message)
        };
      }

      // Send custom email using our edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-password-reset', {
          body: {
            email: email,
            resetUrl: `${window.location.origin}/reset-password`,
            userRole: profile.role,
            userName: profile.name
          }
        });

        if (emailError) {
          console.error('🔐 AuthService: Custom email send error:', emailError);
          // Fall back to default Supabase email - reset was already sent above
        } else {
          console.log('🔐 AuthService: Custom password reset email sent successfully');
        }
      } catch (emailError) {
        console.error('🔐 AuthService: Custom email function error:', emailError);
        // Continue with success since the reset token was generated
      }

      return { success: true };

    } catch (error) {
      console.error('🔐 AuthService: Universal password reset exception:', error);
      return {
        success: false,
        error: 'Failed to send password reset email. Please try again.'
      };
    }
  }

  /**
   * Remember Me functionality
   */
  static saveRememberedEmail(email: string): void {
    try {
      localStorage.setItem('edufam_remembered_email', email);
      localStorage.setItem('edufam_remember_me', 'true');
    } catch (error) {
      console.warn('🔐 AuthService: Failed to save remembered email:', error);
    }
  }

  static getRememberedEmail(): string | null {
    try {
      const shouldRemember = localStorage.getItem('edufam_remember_me');
      if (shouldRemember === 'true') {
        return localStorage.getItem('edufam_remembered_email');
      }
      return null;
    } catch (error) {
      console.warn('🔐 AuthService: Failed to get remembered email:', error);
      return null;
    }
  }

  static clearRememberedEmail(): void {
    try {
      localStorage.removeItem('edufam_remembered_email');
      localStorage.removeItem('edufam_remember_me');
    } catch (error) {
      console.warn('🔐 AuthService: Failed to clear remembered email:', error);
    }
  }

  static isRememberMeEnabled(): boolean {
    try {
      return localStorage.getItem('edufam_remember_me') === 'true';
    } catch (error) {
      return false;
    }
  }
} 