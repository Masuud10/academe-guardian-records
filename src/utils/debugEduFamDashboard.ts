import { supabase } from '@/integrations/supabase/client';

export interface DashboardDebugInfo {
  authentication: {
    status: 'connected' | 'error' | 'loading';
    userId?: string;
    userRole?: string;
    userEmail?: string;
    errors?: string[];
  };
  schoolContext: {
    status: 'connected' | 'error' | 'loading';
    schoolId?: string;
    isReady: boolean;
    errors?: string[];
  };
  database: {
    status: 'connected' | 'error' | 'timeout' | 'loading';
    lastQuery?: Date;
    errors: string[];
    slowQueries: string[];
  };
  components: {
    stats: 'loaded' | 'loading' | 'error';
    schools: 'loaded' | 'loading' | 'error';
    users: 'loaded' | 'loading' | 'error';
    analytics: 'loaded' | 'loading' | 'error';
    billing: 'loaded' | 'loading' | 'error';
    reports: 'loaded' | 'loading' | 'error';
    support: 'loaded' | 'loading' | 'error';
  };
  permissions: {
    canAccessSchools: boolean;
    canAccessUsers: boolean;
    canAccessAnalytics: boolean;
    canAccessBilling: boolean;
    canAccessReports: boolean;
    canAccessSupport: boolean;
    canAccessSettings: boolean;
  };
  performance: {
    queryCount: number;
    averageQueryTime: number;
    slowQueries: Array<{ query: string; duration: number }>;
    memoryUsage?: number;
  };
  errors: Array<{
    type: 'auth' | 'database' | 'permission' | 'validation' | 'network';
    message: string;
    timestamp: Date;
    context: string;
  }>;
}

export class EduFamDashboardDebugger {
  private static instance: EduFamDashboardDebugger;
  private debugInfo: DashboardDebugInfo;
  private queryTimes: Map<string, number> = new Map();
  private errorLog: Array<{ type: string; message: string; timestamp: Date; context: string }> = [];

  private constructor() {
    this.debugInfo = {
      authentication: { status: 'loading', errors: [] },
      schoolContext: { status: 'loading', isReady: false, errors: [] },
      database: { status: 'loading', errors: [], slowQueries: [] },
      components: {
        stats: 'loading',
        schools: 'loading',
        users: 'loading',
        analytics: 'loading',
        billing: 'loading',
        reports: 'loading',
        support: 'loading'
      },
      permissions: {
        canAccessSchools: false,
        canAccessUsers: false,
        canAccessAnalytics: false,
        canAccessBilling: false,
        canAccessReports: false,
        canAccessSupport: false,
        canAccessSettings: false
      },
      performance: {
        queryCount: 0,
        averageQueryTime: 0,
        slowQueries: []
      },
      errors: []
    };
  }

  static getInstance(): EduFamDashboardDebugger {
    if (!EduFamDashboardDebugger.instance) {
      EduFamDashboardDebugger.instance = new EduFamDashboardDebugger();
    }
    return EduFamDashboardDebugger.instance;
  }

  // Authentication debugging
  async debugAuthentication(user: { id?: string; email?: string; role?: string }): Promise<void> {
    try {
      if (!user) {
        this.debugInfo.authentication = {
          status: 'error',
          errors: ['No user object found']
        };
        this.logError('auth', 'No user object found', 'Authentication check');
        return;
      }

      // Validate user object structure
      const requiredFields = ['id', 'email', 'role'];
      const missingFields = requiredFields.filter(field => !user[field as keyof typeof user]);
      
      if (missingFields.length > 0) {
        this.debugInfo.authentication = {
          status: 'error',
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          errors: [`Missing required fields: ${missingFields.join(', ')}`]
        };
        this.logError('auth', `Missing required fields: ${missingFields.join(', ')}`, 'Authentication validation');
        return;
      }

      // Validate role
      const validRoles = ['principal', 'teacher', 'parent', 'school_director', 'finance_officer', 'hr'];
      if (!validRoles.includes(user.role!)) {
        this.debugInfo.authentication = {
          status: 'error',
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          errors: [`Invalid role: ${user.role}`]
        };
        this.logError('auth', `Invalid role: ${user.role}`, 'Role validation');
        return;
      }

      // Check if user is EduFam admin
      const isEduFamAdmin = user.role === 'edufam_admin' || user.role === 'elimisha_admin';
      
      this.debugInfo.authentication = {
        status: 'connected',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role
      };

      // Update permissions based on role
      this.debugInfo.permissions = {
        canAccessSchools: isEduFamAdmin,
        canAccessUsers: isEduFamAdmin,
        canAccessAnalytics: isEduFamAdmin,
        canAccessBilling: isEduFamAdmin,
        canAccessReports: isEduFamAdmin,
        canAccessSupport: isEduFamAdmin,
        canAccessSettings: isEduFamAdmin
      };

      console.log('✅ Authentication debug completed:', this.debugInfo.authentication);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication debug failed';
      this.debugInfo.authentication = {
        status: 'error',
        errors: [errorMessage]
      };
      this.logError('auth', errorMessage, 'Authentication debug');
    }
  }

  // School context debugging
  async debugSchoolContext(schoolId: string | null, isReady: boolean): Promise<void> {
    try {
      if (!isReady) {
        this.debugInfo.schoolContext = {
          status: 'loading',
          isReady: false,
          errors: ['School context not ready']
        };
        return;
      }

      if (!schoolId) {
        this.debugInfo.schoolContext = {
          status: 'error',
          isReady: true,
          errors: ['No school ID available']
        };
        this.logError('validation', 'No school ID available', 'School context check');
        return;
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(schoolId)) {
        this.debugInfo.schoolContext = {
          status: 'error',
          schoolId,
          isReady: true,
          errors: [`Invalid UUID format: ${schoolId}`]
        };
        this.logError('validation', `Invalid UUID format: ${schoolId}`, 'School ID validation');
        return;
      }

      this.debugInfo.schoolContext = {
        status: 'connected',
        schoolId,
        isReady: true
      };

      console.log('✅ School context debug completed:', this.debugInfo.schoolContext);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'School context debug failed';
      this.debugInfo.schoolContext = {
        status: 'error',
        isReady,
        errors: [errorMessage]
      };
      this.logError('validation', errorMessage, 'School context debug');
    }
  }

  // Database connection debugging
  async debugDatabaseConnection(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('schools')
        .select('id')
        .limit(1);

      const queryTime = Date.now() - startTime;
      this.recordQueryTime('database_connection_test', queryTime);

      if (error) {
        this.debugInfo.database = {
          status: 'error',
          lastQuery: new Date(),
          errors: [error.message],
          slowQueries: []
        };
        this.logError('database', error.message, 'Database connection test');
        return;
      }

      // Test admin-specific queries
      const adminQueries = [
        { name: 'schools_count', query: () => supabase.from('schools').select('id', { count: 'exact', head: true }) },
        { name: 'users_count', query: () => supabase.from('profiles').select('id', { count: 'exact', head: true }) },
        { name: 'analytics_data', query: () => supabase.from('grades').select('id').limit(1) }
      ];

      for (const { name, query } of adminQueries) {
        const queryStart = Date.now();
        try {
          const result = await query();
          const duration = Date.now() - queryStart;
          this.recordQueryTime(name, duration);
          
          if (result.error) {
            this.debugInfo.database.errors.push(`${name}: ${result.error.message}`);
            this.logError('database', result.error.message, name);
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          this.debugInfo.database.errors.push(`${name}: ${errorMessage}`);
          this.logError('database', errorMessage, name);
        }
      }

      this.debugInfo.database = {
        status: 'connected',
        lastQuery: new Date(),
        errors: this.debugInfo.database.errors,
        slowQueries: this.getSlowQueries()
      };

      console.log('✅ Database debug completed:', this.debugInfo.database);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Database connection failed';
      this.debugInfo.database = {
        status: 'error',
        lastQuery: new Date(),
        errors: [errorMessage],
        slowQueries: []
      };
      this.logError('database', errorMessage, 'Database connection test');
    }
  }

  // Component status debugging
  async debugComponentStatus(): Promise<void> {
    try {
      // Test each component's data loading
      const componentTests = [
        { name: 'stats', test: () => this.testStatsComponent() },
        { name: 'schools', test: () => this.testSchoolsComponent() },
        { name: 'users', test: () => this.testUsersComponent() },
        { name: 'analytics', test: () => this.testAnalyticsComponent() },
        { name: 'billing', test: () => this.testBillingComponent() },
        { name: 'reports', test: () => this.testReportsComponent() },
        { name: 'support', test: () => this.testSupportComponent() }
      ];

      for (const { name, test } of componentTests) {
        try {
          await test();
          this.debugInfo.components[name as keyof typeof this.debugInfo.components] = 'loaded';
        } catch (error: unknown) {
          this.debugInfo.components[name as keyof typeof this.debugInfo.components] = 'error';
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logError('component', errorMessage, `${name} component test`);
        }
      }

      console.log('✅ Component status debug completed:', this.debugInfo.components);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Component status debug failed';
      this.logError('component', errorMessage, 'Component status debug');
    }
  }

  // Performance monitoring
  private recordQueryTime(queryName: string, duration: number): void {
    this.queryTimes.set(queryName, duration);
    this.debugInfo.performance.queryCount++;
    
    if (duration > 1000) { // Log slow queries (>1 second)
      this.debugInfo.performance.slowQueries.push({ query: queryName, duration });
      console.warn(`🐌 Slow query detected: ${queryName} took ${duration}ms`);
    }
    
    // Update average query time
    const times = Array.from(this.queryTimes.values());
    this.debugInfo.performance.averageQueryTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  private getSlowQueries(): string[] {
    return this.debugInfo.performance.slowQueries.map(q => `${q.query} (${q.duration}ms)`);
  }

  // Component-specific tests
  private async testStatsComponent(): Promise<void> {
    const { data, error } = await supabase
      .from('schools')
      .select('id', { count: 'exact', head: true });
    
    if (error) throw error;
  }

  private async testSchoolsComponent(): Promise<void> {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, email')
      .limit(5);
    
    if (error) throw error;
  }

  private async testUsersComponent(): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, role')
      .limit(5);
    
    if (error) throw error;
  }

  private async testAnalyticsComponent(): Promise<void> {
    const { data, error } = await supabase
      .from('grades')
      .select('id, score')
      .limit(1);
    
    if (error) throw error;
  }

  private async testBillingComponent(): Promise<void> {
    // Test if billing tables exist
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('id')
      .limit(1);
    
    if (error && !error.message.includes('relation "financial_transactions" does not exist')) {
      throw error;
    }
  }

  private async testReportsComponent(): Promise<void> {
    const { data, error } = await supabase
      .from('grades')
      .select('id, term, exam_type')
      .limit(1);
    
    if (error) throw error;
  }

  private async testSupportComponent(): Promise<void> {
    // Test if support tables exist
    const { data, error } = await supabase
      .from('support_tickets')
      .select('id')
      .limit(1);
    
    if (error && !error.message.includes('relation "support_tickets" does not exist')) {
      throw error;
    }
  }

  // Error logging
  private logError(type: string, message: string, context: string): void {
    const error = {
      type: type as 'auth' | 'database' | 'permission' | 'validation' | 'network',
      message,
      timestamp: new Date(),
      context
    };
    
    this.debugInfo.errors.push(error);
    this.errorLog.push(error);
    
    console.error(`❌ [${type.toUpperCase()}] ${context}:`, message);
  }

  // Get comprehensive debug report
  getDebugReport(): DashboardDebugInfo {
    return {
      ...this.debugInfo,
      performance: {
        ...this.debugInfo.performance,
        memoryUsage: this.getMemoryUsage()
      }
    };
  }

  private getMemoryUsage(): number | undefined {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      return memory ? memory.usedJSHeapSize / 1024 / 1024 : undefined; // MB
    }
    return undefined;
  }

  // Clear debug data
  clearDebugData(): void {
    this.queryTimes.clear();
    this.errorLog = [];
    this.debugInfo.errors = [];
    this.debugInfo.performance.slowQueries = [];
  }

  // Export debug data for analysis
  exportDebugData(): string {
    return JSON.stringify(this.getDebugReport(), null, 2);
  }
}

// React hook for using the debugger
export const useEduFamDashboardDebugger = () => {
  const debuggerInstance = EduFamDashboardDebugger.getInstance();
  
  const runFullDiagnostic = async () => {
    console.log('🔍 Starting EduFam Dashboard diagnostic...');
    
    // Clear previous debug data
    debuggerInstance.clearDebugData();
    
    // Run all diagnostics
    await debuggerInstance.debugDatabaseConnection();
    await debuggerInstance.debugComponentStatus();
    
    const report = debuggerInstance.getDebugReport();
    console.log('📊 Diagnostic report:', report);
    
    return report;
  };

  const debugAuth = async (user: { id?: string; email?: string; role?: string }) => {
    await debuggerInstance.debugAuthentication(user);
  };

  const debugSchoolContext = async (schoolId: string | null, isReady: boolean) => {
    await debuggerInstance.debugSchoolContext(schoolId, isReady);
  };

  const getReport = () => {
    return debuggerInstance.getDebugReport();
  };

  const exportData = () => {
    return debuggerInstance.exportDebugData();
  };

  return {
    runFullDiagnostic,
    debugAuth,
    debugSchoolContext,
    getReport,
    exportData
  };
}; 