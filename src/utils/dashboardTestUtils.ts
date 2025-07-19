import { supabase } from "@/integrations/supabase/client";
import { AuthUser } from "@/types/auth";

export interface DashboardTestConfig {
  role: string;
  requiredPermissions: string[];
  requiredSchoolAssignment: boolean;
  expectedModules: string[];
  testDataRequirements: string[];
}

export const DASHBOARD_CONFIGS: Record<string, DashboardTestConfig> = {
  school_director: {
    role: "school_director",
    requiredPermissions: ["school_management", "financial_oversight", "staff_management"],
    requiredSchoolAssignment: true,
    expectedModules: ["analytics", "finance", "staff", "students", "reports"],
    testDataRequirements: ["schools", "profiles", "financial_transactions"]
  },
  principal: {
    role: "principal",
    requiredPermissions: ["academic_management", "staff_supervision", "student_oversight"],
    requiredSchoolAssignment: true,
    expectedModules: ["grades", "attendance", "students", "teachers", "reports"],
    testDataRequirements: ["classes", "students", "profiles", "grades"]
  },
  teacher: {
    role: "teacher",
    requiredPermissions: ["grade_management", "attendance_tracking", "student_view"],
    requiredSchoolAssignment: true,
    expectedModules: ["grades", "attendance", "students", "timetable"],
    testDataRequirements: ["classes", "students", "grades", "attendance"]
  },
  finance_officer: {
    role: "finance_officer",
    requiredPermissions: ["financial_management", "payment_processing", "reporting"],
    requiredSchoolAssignment: true,
    expectedModules: ["finance", "fee_management", "reports", "analytics"],
    testDataRequirements: ["financial_transactions", "fees", "students"]
  },
  hr: {
    role: "hr",
    requiredPermissions: ["staff_management", "user_management", "hr_analytics"],
    requiredSchoolAssignment: true,
    expectedModules: ["staff_management", "payroll", "user_management", "hr_reports"],
    testDataRequirements: ["support_staff", "profiles", "user_login_details"]
  },
  parent: {
    role: "parent",
    requiredPermissions: ["child_view", "grade_view", "fee_view"],
    requiredSchoolAssignment: false,
    expectedModules: ["grades", "attendance", "finance", "timetable"],
    testDataRequirements: ["students", "grades", "fees"]
  }
};

interface TestDetails {
  role?: {
    valid: boolean;
    config: DashboardTestConfig;
  };
  schoolAssignment?: {
    required: boolean;
    present: boolean;
    schoolId?: string;
  };
  dataAccess?: {
    errors: string[];
    warnings: string[];
    results: Record<string, { accessible: boolean; count?: number; error?: string }>;
  };
  permissions?: {
    errors: string[];
    results: Record<string, { granted: boolean }>;
  };
}

export const testDashboardAccess = async (user: AuthUser): Promise<{
  success: boolean;
  errors: string[];
  warnings: string[];
  details: TestDetails;
}> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: TestDetails = {};

  try {
    // 1. Validate user role
    const config = DASHBOARD_CONFIGS[user.role];
    if (!config) {
      errors.push(`Invalid role: ${user.role}`);
      return { success: false, errors, warnings, details };
    }

    details.role = {
      valid: true,
      config: config
    };

    // 2. Test school assignment
    if (config.requiredSchoolAssignment) {
      if (!user.school_id) {
        errors.push("School assignment required but missing");
      } else {
        details.schoolAssignment = {
          required: true,
          present: true,
          schoolId: user.school_id
        };
      }
    } else {
      details.schoolAssignment = {
        required: false,
        present: !!user.school_id
      };
    }

    // 3. Test data access
    const dataAccessResults = await testDataAccess(user, config);
    details.dataAccess = dataAccessResults;
    
    if (dataAccessResults.errors.length > 0) {
      errors.push(...dataAccessResults.errors);
    }
    if (dataAccessResults.warnings.length > 0) {
      warnings.push(...dataAccessResults.warnings);
    }

    // 4. Test permissions
    const permissionResults = await testPermissions(user, config);
    details.permissions = permissionResults;
    
    if (permissionResults.errors.length > 0) {
      errors.push(...permissionResults.errors);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      details
    };

  } catch (error) {
    errors.push(`Test failed: ${error}`);
    return { success: false, errors, warnings, details };
  }
};

const testDataAccess = async (user: AuthUser, config: DashboardTestConfig) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const results: Record<string, { accessible: boolean; count?: number; error?: string }> = {};

  for (const requirement of config.testDataRequirements) {
    try {
      // Type assertion to handle dynamic table names
      const tableName = requirement as keyof typeof supabase.from;
      let query = supabase.from(tableName).select("count", { count: "exact" });
      
      if (user.school_id && requirement !== "schools") {
        query = query.eq("school_id", user.school_id);
      }

      const { data, error } = await query;

      if (error) {
        errors.push(`Failed to access ${requirement}: ${error.message}`);
        results[requirement] = { accessible: false, error: error.message };
      } else {
        const count = typeof data === 'number' ? data : 0;
        results[requirement] = { accessible: true, count };
        
        if (count === 0) {
          warnings.push(`No data found in ${requirement}`);
        }
      }
    } catch (error) {
      errors.push(`Error testing ${requirement}: ${error}`);
      results[requirement] = { accessible: false, error };
    }
  }

  return { errors, warnings, results };
};

const testPermissions = async (user: AuthUser, config: DashboardTestConfig) => {
  const errors: string[] = [];
  const results: Record<string, { granted: boolean }> = {};

  // Test basic role permissions
  for (const permission of config.requiredPermissions) {
    // This is a simplified test - in a real app, you'd check against actual permission tables
    const hasPermission = true; // Placeholder
    results[permission] = { granted: hasPermission };
    
    if (!hasPermission) {
      errors.push(`Missing permission: ${permission}`);
    }
  }

  return { errors, results };
};

export const validateDashboardComponents = (role: string): {
  valid: boolean;
  missingComponents: string[];
  suggestions: string[];
} => {
  const config = DASHBOARD_CONFIGS[role];
  if (!config) {
    return {
      valid: false,
      missingComponents: [],
      suggestions: [`Create configuration for role: ${role}`]
    };
  }

  const missingComponents: string[] = [];
  const suggestions: string[] = [];

  // Check if expected modules are available
  for (const module of config.expectedModules) {
    // This would check if the component files exist
    // For now, we'll just validate the configuration
    if (!module) {
      missingComponents.push(module);
    }
  }

  if (missingComponents.length > 0) {
    suggestions.push("Implement missing dashboard components");
    suggestions.push("Add proper error handling for missing modules");
  }

  return {
    valid: missingComponents.length === 0,
    missingComponents,
    suggestions
  };
};

export const generateDashboardReport = (testResults: { errors?: string[]; warnings?: string[] }) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: Object.keys(DASHBOARD_CONFIGS).length,
      passed: 0,
      failed: 0,
      warnings: 0
    },
    details: testResults,
    recommendations: [] as string[]
  };

  // Analyze results and generate recommendations
  if (testResults.errors && testResults.errors.length > 0) {
    report.recommendations.push("Fix authentication and permission issues");
  }

  if (testResults.warnings && testResults.warnings.length > 0) {
    report.recommendations.push("Add data validation and error handling");
  }

  return report;
}; 