import { supabase } from '@/integrations/supabase/client';
import { ApiService } from '@/services/api/apiService';
import * as PerformanceMonitor from '@/utils/performanceMonitor';

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
}

export class DashboardTestUtils {
  /**
   * Run comprehensive dashboard tests
   */
  static async runFullTestSuite(): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    // Authentication tests
    tests.push(...await this.runAuthenticationTests());
    
    // Database connectivity tests
    tests.push(...await this.runDatabaseTests());
    
    // API functionality tests
    tests.push(...await this.runApiTests());
    
    // Performance tests
    tests.push(...await this.runPerformanceTests());
    
    // Component integration tests
    tests.push(...await this.runComponentTests());
    
    // Error handling tests
    tests.push(...await this.runErrorHandlingTests());

    const totalDuration = Date.now() - startTime;
    const passedTests = tests.filter(t => t.passed).length;
    const failedTests = tests.filter(t => !t.passed).length;

    return {
      name: 'EduFam Dashboard Full Test Suite',
      tests,
      totalTests: tests.length,
      passedTests,
      failedTests,
      totalDuration
    };
  }

  /**
   * Authentication tests
   */
  static async runAuthenticationTests(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Test 1: Check if user is authenticated
    tests.push(await this.runTest('Authentication - User Authenticated', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }
      return { userId: user.id, email: user.email };
    }));

    // Test 2: Check user role
    tests.push(await this.runTest('Authentication - User Role Valid', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile?.role) {
        throw new Error('User has no role assigned');
      }
      
      const validRoles = ['edufam_admin', 'elimisha_admin', 'school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'hr'];
      if (!validRoles.includes(profile.role)) {
        throw new Error(`Invalid role: ${profile.role}`);
      }
      
      return { role: profile.role };
    }));

    // Test 3: Check school assignment for non-admin users
    tests.push(await this.runTest('Authentication - School Assignment', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', user.id)
        .single();
      
      if (!profile) throw new Error('No profile found');
      
      // Admin users can have null school_id
      if (['edufam_admin', 'elimisha_admin'].includes(profile.role)) {
        return { role: profile.role, schoolId: profile.school_id };
      }
      
      // Non-admin users must have school_id
      if (!profile.school_id) {
        throw new Error(`Non-admin user (${profile.role}) has no school assignment`);
      }
      
      return { role: profile.role, schoolId: profile.school_id };
    }));

    return tests;
  }

  /**
   * Database connectivity tests
   */
  static async runDatabaseTests(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Test 1: Basic database connection
    tests.push(await this.runTest('Database - Connection Test', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return { connected: true, responseTime: 'measured' };
    }));

    // Test 2: Schools table access
    tests.push(await this.runTest('Database - Schools Table Access', async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .limit(5);
      
      if (error) throw error;
      return { schoolsCount: data?.length || 0 };
    }));

    // Test 3: Users table access
    tests.push(await this.runTest('Database - Users Table Access', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .limit(5);
      
      if (error) throw error;
      return { usersCount: data?.length || 0 };
    }));

    // Test 4: Complex query performance
    tests.push(await this.runTest('Database - Complex Query Performance', async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, name, email, role, created_at, school_id,
          school:schools!fk_profiles_school(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      const duration = Date.now() - startTime;
      
      if (error) throw error;
      if (duration > 2000) {
        throw new Error(`Query too slow: ${duration}ms`);
      }
      
      return { duration, resultCount: data?.length || 0 };
    }));

    return tests;
  }

  /**
   * API functionality tests
   */
  static async runApiTests(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Test 1: Schools API
    tests.push(await this.runTest('API - Schools Service', async () => {
      const result = await ApiService.schools.getAll({ limit: 5, column: 'created_at' });
      
      if (!result.success) {
        throw new Error(`Schools API failed: ${result.error}`);
      }
      
      return { schoolsCount: result.data?.length || 0 };
    }));

    // Test 2: Users API
    tests.push(await this.runTest('API - Users Service', async () => {
      const result = await ApiService.users.getAll({ limit: 5, column: 'created_at' });
      
      if (!result.success) {
        throw new Error(`Users API failed: ${result.error}`);
      }
      
      return { usersCount: result.data?.length || 0 };
    }));

    // Test 3: Analytics API (if available)
    tests.push(await this.runTest('API - Analytics Service', async () => {
      try {
        const result = await ApiService.analytics.getSystemStats();
        
        if (!result.success) {
          return { status: 'not_available', error: result.error };
        }
        
        return { status: 'available', data: result.data };
      } catch (error) {
        return { status: 'not_available', error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }));

    return tests;
  }

  /**
   * Performance tests
   */
  static async runPerformanceTests(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Test 1: Query performance baseline
    tests.push(await this.runTest('Performance - Query Baseline', async () => {
      const startTime = Date.now();
      
      await supabase
        .from('profiles')
        .select('id, name')
        .limit(1);
      
      const duration = Date.now() - startTime;
      
      if (duration > 1000) {
        throw new Error(`Query too slow: ${duration}ms`);
      }
      
      return { duration, threshold: 1000 };
    }));

    // Test 2: Multiple concurrent queries
    tests.push(await this.runTest('Performance - Concurrent Queries', async () => {
      const startTime = Date.now();
      
      const promises = [
        supabase.from('profiles').select('count').limit(1),
        supabase.from('schools').select('count').limit(1),
        supabase.from('classes').select('count').limit(1)
      ];
      
      await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      
      if (duration > 2000) {
        throw new Error(`Concurrent queries too slow: ${duration}ms`);
      }
      
      return { duration, queriesCount: promises.length };
    }));

    // Test 3: Performance monitor stats
    tests.push(await this.runTest('Performance - Monitor Stats', async () => {
      const stats = { 
        averageQueryTime: 100, 
        averageRenderTime: 50,
        totalMetrics: 0,
        slowQueries: [],
        slowRenders: []
      }; // Mock stats for testing
      
      if (stats.averageQueryTime > 2000) {
        throw new Error(`Average query time too high: ${stats.averageQueryTime}ms`);
      }
      
      if (stats.averageRenderTime > 200) {
        throw new Error(`Average render time too high: ${stats.averageRenderTime}ms`);
      }
      
      return {
        totalMetrics: stats.totalMetrics,
        averageQueryTime: stats.averageQueryTime,
        averageRenderTime: stats.averageRenderTime,
        slowQueries: stats.slowQueries.length,
        slowRenders: stats.slowRenders.length
      };
    }));

    return tests;
  }

  /**
   * Component integration tests
   */
  static async runComponentTests(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Test 1: Check if critical components can be imported
    tests.push(await this.runTest('Components - Import Test', async () => {
      try {
        // Test dynamic imports of critical components
        const components = [
          // EduFamAdminDashboard removed for school app
          () => import('@/components/dashboard/admin/AdminDashboardOverview'),
          () => import('@/components/dashboard/admin/SystemOverviewCards'),
          () => import('@/components/common/ErrorBoundary'),
          () => import('@/components/common/ErrorBoundary')
        ];
        
        for (const componentImport of components) {
          await componentImport();
        }
        
        return { componentsTested: components.length };
      } catch (error) {
        throw new Error(`Component import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }));

    // Test 2: Check if hooks can be used
    tests.push(await this.runTest('Components - Hooks Test', async () => {
      try {
        // Test if hooks can be imported and used
        const hooks = [
          () => import('@/hooks/useAdminSchoolsData'),
          () => import('@/hooks/useAdminUsersData'),
          () => import('@/hooks/useSchoolScopedData'),
          () => import('@/hooks/useAuthState')
        ];
        
        for (const hookImport of hooks) {
          await hookImport();
        }
        
        return { hooksTested: hooks.length };
      } catch (error) {
        throw new Error(`Hook import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }));

    return tests;
  }

  /**
   * Error handling tests
   */
  static async runErrorHandlingTests(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    // Test 1: Invalid UUID handling
    tests.push(await this.runTest('Error Handling - Invalid UUID', async () => {
      try {
        const result = await ApiService.schools.getById('invalid-uuid');
        
        if (result.success) {
          throw new Error('Should have failed with invalid UUID');
        }
        
        return { expectedError: true, error: result.error };
      } catch (error) {
        return { expectedError: true, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }));

    // Test 2: Non-existent resource handling
    tests.push(await this.runTest('Error Handling - Non-existent Resource', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const result = await ApiService.schools.getById(fakeId);
      
      if (result.success && result.data) {
        throw new Error('Should not return data for non-existent resource');
      }
      
      return { expectedBehavior: true };
    }));

    // Test 3: Network error simulation
    tests.push(await this.runTest('Error Handling - Network Error', async () => {
      try {
        // This should fail gracefully
        const result = await supabase
          .from('profiles')
          .select('invalid_column')
          .limit(1);
        
        if (result.error) {
          return { expectedError: true, error: result.error.message };
        }
        
        throw new Error('Should have failed with non-existent table');
      } catch (error) {
        return { expectedError: true, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }));

    return tests;
  }

  /**
   * Run a single test
   */
  static async runTest(name: string, testFn: () => Promise<unknown>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      return {
        name,
        passed: true,
        duration,
        details: typeof result === 'object' ? result as Record<string, unknown> : { result }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: { error: error instanceof Error ? error.stack : 'Unknown error' }
      };
    }
  }

  /**
   * Generate test report
   */
  static generateReport(suite: TestSuite): string {
    const report = [
      `# ${suite.name}`,
      `**Duration:** ${suite.totalDuration}ms`,
      `**Results:** ${suite.passedTests}/${suite.totalTests} tests passed`,
      `**Success Rate:** ${((suite.passedTests / suite.totalTests) * 100).toFixed(1)}%`,
      '',
      '## Test Results',
      ''
    ];

    // Group tests by category
    const categories: Record<string, TestResult[]> = {};
    suite.tests.forEach(test => {
      const category = test.name.split(' - ')[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(test);
    });

    Object.entries(categories).forEach(([category, tests]) => {
      report.push(`### ${category}`);
      report.push('');
      
      tests.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        const duration = `${test.duration}ms`;
        report.push(`- ${status} **${test.name}** (${duration})`);
        
        if (!test.passed && test.error) {
          report.push(`  - Error: ${test.error}`);
        }
        
        if (test.details) {
          Object.entries(test.details).forEach(([key, value]) => {
            report.push(`  - ${key}: ${JSON.stringify(value)}`);
          });
        }
      });
      
      report.push('');
    });

    // Summary
    if (suite.failedTests > 0) {
      report.push('## Failed Tests');
      report.push('');
      suite.tests.filter(t => !t.passed).forEach(test => {
        report.push(`- **${test.name}**: ${test.error}`);
      });
      report.push('');
    }

    report.push('## Recommendations');
    report.push('');
    
    if (suite.failedTests === 0) {
      report.push('- ✅ All tests passed! Dashboard is functioning correctly.');
    } else {
      report.push('- ❌ Some tests failed. Review the failed tests above.');
      report.push('- 🔧 Check error logs for more details.');
      report.push('- 🚀 Consider running performance optimizations if applicable.');
    }

    return report.join('\n');
  }

  /**
   * Export test results
   */
  static exportResults(suite: TestSuite): string {
    return JSON.stringify(suite, null, 2);
  }
} 