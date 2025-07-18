import { supabase } from '@/integrations/supabase/client';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts?: number;
  resetTime?: Date;
}

interface SecurityEventMetadata {
  [key: string]: string | number | boolean | undefined;
}

export class SecurityUtils {
  static validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async checkRateLimit(
    identifier: string, 
    action: string, 
    maxAttempts: number = 5, 
    windowMinutes: number = 15
  ): Promise<RateLimitResult> {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_action: action,
        p_max_attempts: maxAttempts,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return { allowed: true }; // Fail open for availability
      }

      return { allowed: data === true };
    } catch (error) {
      console.error('Rate limit check exception:', error);
      return { allowed: true }; // Fail open for availability
    }
  }

  static async logSecurityEvent(
    action: string,
    resource: string,
    resourceId?: string,
    success: boolean = true,
    errorMessage?: string,
    metadata: SecurityEventMetadata = {}
  ): Promise<void> {
    try {
      await supabase.rpc('log_security_event', {
        p_action: action,
        p_resource: resource,
        p_resource_id: resourceId,
        p_success: success,
        p_error_message: errorMessage,
        p_metadata: metadata
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  static generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*(),.?":{}|<>';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static requiresMFA(role: string): boolean {
    return ['school_director', 'principal', 'finance_officer', 'hr'].includes(role);
  }

  static getClientIP(): string {
    // In a real application, this would get the actual client IP
    // For demo purposes, we'll use a placeholder
    return 'unknown';
  }

  static getUserAgent(): string {
    return navigator.userAgent || 'unknown';
  }
}
