import { FormValidator } from '@/utils/apiOptimization';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  dependsOn?: string;
  dependsOnValue?: any;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class FormValidationService {
  /**
   * Validates a form against a schema
   */
  static validateForm(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [fieldName, rules] of Object.entries(schema)) {
      const value = data[fieldName];
      const error = this.validateField(value, rules, data);
      if (error) {
        errors[fieldName] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validates a single field
   */
  static validateField(value: any, rules: ValidationRule, allData?: Record<string, any>): string | null {
    // Check dependencies first
    if (rules.dependsOn && rules.dependsOnValue !== undefined) {
      const dependsOnValue = allData?.[rules.dependsOn];
      if (dependsOnValue !== rules.dependsOnValue) {
        return null; // Skip validation if dependency condition not met
      }
    }

    // Required validation
    if (rules.required) {
      const requiredError = FormValidator.validateRequired(value, 'This field');
      if (requiredError) return requiredError;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // Length validation
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `Minimum length is ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Maximum length is ${rules.maxLength} characters`;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.test(value)) {
        return 'Invalid format';
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) return customError;
    }

    return null;
  }

  /**
   * School registration validation schema
   */
  static getSchoolRegistrationSchema(): ValidationSchema {
    return {
      school_name: {
        required: true,
        minLength: 2,
        maxLength: 100
      },
      school_email: {
        required: true,
        custom: (value: string) => FormValidator.validateEmail(value)
      },
      school_phone: {
        required: true,
        custom: (value: string) => FormValidator.validatePhone(value)
      },
      school_address: {
        required: true,
        minLength: 10,
        maxLength: 500
      },
      registration_number: {
        minLength: 3,
        maxLength: 50
      },
      year_established: {
        custom: (value: number) => {
          const currentYear = new Date().getFullYear();
          if (value < 1800 || value > currentYear) {
            return `Year must be between 1800 and ${currentYear}`;
          }
          return null;
        }
      },
      max_students: {
        custom: (value: number) => {
          if (value < 1 || value > 10000) {
            return 'Maximum students must be between 1 and 10,000';
          }
          return null;
        }
      },
      owner_email: {
        custom: (value: string) => FormValidator.validateEmail(value)
      },
      principal_email: {
        custom: (value: string) => FormValidator.validateEmail(value)
      },
      website_url: {
        custom: (value: string) => FormValidator.validateUrl(value)
      },
      mpesa_paybill_number: {
        dependsOn: 'mpesa_enabled',
        dependsOnValue: true,
        required: true,
        minLength: 5,
        maxLength: 10
      },
      mpesa_business_name: {
        dependsOn: 'mpesa_enabled',
        dependsOnValue: true,
        required: true,
        minLength: 2,
        maxLength: 100
      },
      mpesa_shortcode: {
        dependsOn: 'mpesa_enabled',
        dependsOnValue: true,
        required: true,
        minLength: 5,
        maxLength: 10
      }
    };
  }

  /**
   * User creation validation schema
   */
  static getUserCreationSchema(): ValidationSchema {
    return {
      name: {
        required: true,
        minLength: 2,
        maxLength: 100
      },
      email: {
        required: true,
        custom: (value: string) => FormValidator.validateEmail(value)
      },
      password: {
        required: true,
        minLength: 8,
        custom: (value: string) => {
          if (!/[A-Z]/.test(value)) {
            return 'Password must contain at least one uppercase letter';
          }
          if (!/[a-z]/.test(value)) {
            return 'Password must contain at least one lowercase letter';
          }
          if (!/[0-9]/.test(value)) {
            return 'Password must contain at least one number';
          }
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            return 'Password must contain at least one special character';
          }
          return null;
        }
      },
      role: {
        required: true,
        custom: (value: string) => {
          const validRoles = [
            'elimisha_admin', 'edufam_admin', 'school_owner', 
            'principal', 'teacher', 'parent', 'finance_officer', 'hr'
          ];
          if (!validRoles.includes(value)) {
            return 'Invalid role selected';
          }
          return null;
        }
      },
      schoolId: {
        custom: (value: string, allData?: Record<string, any>) => {
          const role = allData?.role;
          if (role && role !== 'edufam_admin' && role !== 'elimisha_admin' && !value) {
            return 'School assignment is required for this role';
          }
          return null;
        }
      }
    };
  }

  /**
   * Subject creation validation schema
   */
  static getSubjectCreationSchema(): ValidationSchema {
    return {
      name: {
        required: true,
        minLength: 2,
        maxLength: 100
      },
      code: {
        required: true,
        minLength: 2,
        maxLength: 10,
        pattern: /^[A-Z0-9]+$/
      },
      class_id: {
        required: true
      },
      credit_hours: {
        custom: (value: number) => {
          if (value < 1 || value > 10) {
            return 'Credit hours must be between 1 and 10';
          }
          return null;
        }
      },
      assessment_weight: {
        custom: (value: number) => {
          if (value < 1 || value > 100) {
            return 'Assessment weight must be between 1 and 100';
          }
          return null;
        }
      }
    };
  }

  /**
   * Grade entry validation schema
   */
  static getGradeEntrySchema(): ValidationSchema {
    return {
      student_id: {
        required: true
      },
      subject_id: {
        required: true
      },
      grade: {
        required: true,
        custom: (value: any) => {
          if (typeof value === 'number') {
            if (value < 0 || value > 100) {
              return 'Grade must be between 0 and 100';
            }
          } else if (typeof value === 'string') {
            const validGrades = ['A', 'B', 'C', 'D', 'E', 'F'];
            if (!validGrades.includes(value.toUpperCase())) {
              return 'Invalid grade format';
            }
          }
          return null;
        }
      },
      term: {
        required: true,
        custom: (value: string) => {
          const validTerms = ['term1', 'term2', 'term3', 'final'];
          if (!validTerms.includes(value)) {
            return 'Invalid term selected';
          }
          return null;
        }
      }
    };
  }

  /**
   * Attendance validation schema
   */
  static getAttendanceSchema(): ValidationSchema {
    return {
      student_id: {
        required: true
      },
      date: {
        required: true,
        custom: (value: string) => {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return 'Invalid date format';
          }
          const today = new Date();
          if (date > today) {
            return 'Attendance date cannot be in the future';
          }
          return null;
        }
      },
      status: {
        required: true,
        custom: (value: string) => {
          const validStatuses = ['present', 'absent', 'late', 'excused'];
          if (!validStatuses.includes(value)) {
            return 'Invalid attendance status';
          }
          return null;
        }
      }
    };
  }

  /**
   * Fee payment validation schema
   */
  static getFeePaymentSchema(): ValidationSchema {
    return {
      student_id: {
        required: true
      },
      amount: {
        required: true,
        custom: (value: number) => {
          if (value <= 0) {
            return 'Amount must be greater than 0';
          }
          if (value > 1000000) {
            return 'Amount cannot exceed 1,000,000';
          }
          return null;
        }
      },
      payment_method: {
        required: true,
        custom: (value: string) => {
          const validMethods = ['mpesa', 'cash', 'bank_transfer', 'cheque'];
          if (!validMethods.includes(value)) {
            return 'Invalid payment method';
          }
          return null;
        }
      },
      reference_number: {
        minLength: 5,
        maxLength: 50
      }
    };
  }

  /**
   * Real-time validation for a field
   */
  static validateFieldRealTime(
    fieldName: string, 
    value: any, 
    schema: ValidationSchema, 
    allData?: Record<string, any>
  ): string | null {
    const rules = schema[fieldName];
    if (!rules) return null;
    
    return this.validateField(value, rules, allData);
  }

  /**
   * Clear validation errors when user starts typing
   */
  static clearFieldError(
    fieldName: string, 
    errors: Record<string, string>
  ): Record<string, string> {
    const newErrors = { ...errors };
    delete newErrors[fieldName];
    return newErrors;
  }

  /**
   * Get validation summary for display
   */
  static getValidationSummary(validation: ValidationResult): {
    totalErrors: number;
    errorFields: string[];
    isValid: boolean;
  } {
    return {
      totalErrors: Object.keys(validation.errors).length,
      errorFields: Object.keys(validation.errors),
      isValid: validation.isValid
    };
  }
} 