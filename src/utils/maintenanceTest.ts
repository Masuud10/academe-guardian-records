import { MaintenanceModeService } from '@/services/system/maintenanceModeService';
import { maintenanceMiddleware } from '@/middleware/maintenanceMiddleware';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

export class MaintenanceTestSuite {
  private results: TestResult[] = [];

  /**
   * Run all maintenance tests
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Maintenance Test Suite...');
    
    try {
      await this.testDatabaseConnection();
      await this.testSettingsRetrieval();
      await this.testToggleFunctionality();
      await this.testUserAccessControl();
      await this.testMiddlewareFunctionality();
      await this.testAuditLogging();
      await this.testRoleBasedAccess();
      await this.testRealTimeBlocking();
      
      console.log('✅ All maintenance tests completed');
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.addResult({
        testName: 'Test Suite',
        passed: false,
        error: `Test suite execution failed: ${error}`
      });
    }

    return this.results;
  }

  /**
   * Test database connection
   */
  private async testDatabaseConnection(): Promise<void> {
    try {
      const { data, error } = await MaintenanceModeService.getMaintenanceModeSettings();
      
      if (error) {
        this.addResult({
          testName: 'Database Connection',
          passed: false,
          error: `Database connection failed: ${error}`
        });
        return;
      }

      this.addResult({
        testName: 'Database Connection',
        passed: true,
        details: { hasSettings: !!data }
      });
    } catch (error) {
      this.addResult({
        testName: 'Database Connection',
        passed: false,
        error: `Database connection test failed: ${error}`
      });
    }
  }

  /**
   * Test settings retrieval
   */
  private async testSettingsRetrieval(): Promise<void> {
    try {
      const { data, error } = await MaintenanceModeService.getMaintenanceModeSettings();
      
      if (error) {
        this.addResult({
          testName: 'Settings Retrieval',
          passed: false,
          error: `Settings retrieval failed: ${error}`
        });
        return;
      }

      if (!data) {
        this.addResult({
          testName: 'Settings Retrieval',
          passed: false,
          error: 'No maintenance settings found'
        });
        return;
      }

      this.addResult({
        testName: 'Settings Retrieval',
        passed: true,
        details: {
          enabled: data.enabled,
          hasMessage: !!data.message,
          allowedRoles: data.allowed_roles
        }
      });
    } catch (error) {
      this.addResult({
        testName: 'Settings Retrieval',
        passed: false,
        error: `Settings retrieval test failed: ${error}`
      });
    }
  }

  /**
   * Test toggle functionality
   */
  private async testToggleFunctionality(): Promise<void> {
    try {
      // Test enabling maintenance mode
      const enableResult = await MaintenanceModeService.enableMaintenanceMode('Test maintenance mode');
      
      if (!enableResult.success) {
        this.addResult({
          testName: 'Toggle Functionality',
          passed: false,
          error: `Failed to enable maintenance mode: ${enableResult.error}`
        });
        return;
      }

      // Verify maintenance mode is enabled
      const status = await MaintenanceModeService.getMaintenanceStatus();
      if (!status.inMaintenance) {
        this.addResult({
          testName: 'Toggle Functionality',
          passed: false,
          error: 'Maintenance mode not properly enabled'
        });
        return;
      }

      // Test disabling maintenance mode
      const disableResult = await MaintenanceModeService.disableMaintenanceMode();
      
      if (!disableResult.success) {
        this.addResult({
          testName: 'Toggle Functionality',
          passed: false,
          error: `Failed to disable maintenance mode: ${disableResult.error}`
        });
        return;
      }

      // Verify maintenance mode is disabled
      const finalStatus = await MaintenanceModeService.getMaintenanceStatus();
      if (finalStatus.inMaintenance) {
        this.addResult({
          testName: 'Toggle Functionality',
          passed: false,
          error: 'Maintenance mode not properly disabled'
        });
        return;
      }

      this.addResult({
        testName: 'Toggle Functionality',
        passed: true,
        details: {
          enableSuccess: enableResult.success,
          disableSuccess: disableResult.success,
          finalStatus: finalStatus.inMaintenance
        }
      });
    } catch (error) {
      this.addResult({
        testName: 'Toggle Functionality',
        passed: false,
        error: `Toggle functionality test failed: ${error}`
      });
    }
  }

  /**
   * Test user access control
   */
  private async testUserAccessControl(): Promise<void> {
    try {
      // Enable maintenance mode for testing
      await MaintenanceModeService.enableMaintenanceMode('Test access control');

      // Test admin access
      const adminAccess = await MaintenanceModeService.checkUserAccess('edufam_admin');
      if (!adminAccess.allowed) {
        this.addResult({
          testName: 'User Access Control',
          passed: false,
          error: 'Admin user should have access during maintenance'
        });
        return;
      }

      // Test non-admin access - should be blocked
      const userAccess = await MaintenanceModeService.checkUserAccess('teacher');
      if (userAccess.allowed) {
        this.addResult({
          testName: 'User Access Control',
          passed: false,
          error: 'Non-admin user should not have access during maintenance'
        });
        return;
      }

      // Test other roles - should all be blocked
      const rolesToTest = ['principal', 'parent', 'finance_officer', 'school_director', 'teacher'];
      for (const role of rolesToTest) {
        const roleAccess = await MaintenanceModeService.checkUserAccess(role);
        if (roleAccess.allowed) {
          this.addResult({
            testName: 'User Access Control',
            passed: false,
            error: `${role} should not have access during maintenance`
          });
          return;
        }
      }

      // Disable maintenance mode
      await MaintenanceModeService.disableMaintenanceMode();

      // Test normal access - all users should have access
      const normalAccess = await MaintenanceModeService.checkUserAccess('teacher');
      if (!normalAccess.allowed) {
        this.addResult({
          testName: 'User Access Control',
          passed: false,
          error: 'All users should have access when maintenance is disabled'
        });
        return;
      }

      this.addResult({
        testName: 'User Access Control',
        passed: true,
        details: {
          adminAccess: adminAccess.allowed,
          userAccessBlocked: !userAccess.allowed,
          normalAccess: normalAccess.allowed,
          rolesTested: rolesToTest.length
        }
      });
    } catch (error) {
      this.addResult({
        testName: 'User Access Control',
        passed: false,
        error: `User access control test failed: ${error}`
      });
    }
  }

  /**
   * Test middleware functionality
   */
  private async testMiddlewareFunctionality(): Promise<void> {
    try {
      // Enable maintenance mode
      await MaintenanceModeService.enableMaintenanceMode('Test middleware');

      // Test route access for non-admin
      const routeAccess = await maintenanceMiddleware.canAccessRoute('/dashboard', 'teacher');
      if (routeAccess.allowed) {
        this.addResult({
          testName: 'Middleware Functionality',
          passed: false,
          error: 'Non-admin should not have route access during maintenance'
        });
        return;
      }

      // Test admin route access
      const adminRouteAccess = await maintenanceMiddleware.canAccessRoute('/dashboard', 'edufam_admin');
      if (!adminRouteAccess.allowed) {
        this.addResult({
          testName: 'Middleware Functionality',
          passed: false,
          error: 'Admin should have route access during maintenance'
        });
        return;
      }

      // Test allowed route access (maintenance page)
      const allowedRouteAccess = await maintenanceMiddleware.canAccessRoute('/maintenance', 'teacher');
      if (!allowedRouteAccess.allowed) {
        this.addResult({
          testName: 'Middleware Functionality',
          passed: false,
          error: 'Maintenance page should be accessible during maintenance'
        });
        return;
      }

      // Test API access for non-admin
      const apiAccess = await maintenanceMiddleware.canAccessApi('/api/dashboard', 'teacher');
      if (apiAccess.allowed) {
        this.addResult({
          testName: 'Middleware Functionality',
          passed: false,
          error: 'Non-admin should not have API access during maintenance'
        });
        return;
      }

      // Test API access for admin
      const adminApiAccess = await maintenanceMiddleware.canAccessApi('/api/dashboard', 'edufam_admin');
      if (!adminApiAccess.allowed) {
        this.addResult({
          testName: 'Middleware Functionality',
          passed: false,
          error: 'Admin should have API access during maintenance'
        });
        return;
      }

      // Disable maintenance mode
      await MaintenanceModeService.disableMaintenanceMode();

      this.addResult({
        testName: 'Middleware Functionality',
        passed: true,
        details: {
          routeBlocked: !routeAccess.allowed,
          adminRouteAllowed: adminRouteAccess.allowed,
          allowedRouteAccessible: allowedRouteAccess.allowed,
          apiBlocked: !apiAccess.allowed,
          adminApiAllowed: adminApiAccess.allowed
        }
      });
    } catch (error) {
      this.addResult({
        testName: 'Middleware Functionality',
        passed: false,
        error: `Middleware functionality test failed: ${error}`
      });
    }
  }

  /**
   * Test audit logging
   */
  private async testAuditLogging(): Promise<void> {
    try {
      // Test logging maintenance actions
      await MaintenanceModeService.logMaintenanceAction('test', 'Test audit logging');
      
      this.addResult({
        testName: 'Audit Logging',
        passed: true,
        details: { actionLogged: true }
      });
    } catch (error) {
      this.addResult({
        testName: 'Audit Logging',
        passed: false,
        error: `Audit logging test failed: ${error}`
      });
    }
  }

  /**
   * Test role-based access specifically
   */
  private async testRoleBasedAccess(): Promise<void> {
    try {
      // Enable maintenance mode
      await MaintenanceModeService.enableMaintenanceMode('Test role-based access');

      // Test all roles
      const roles = [
        { role: 'edufam_admin', shouldAccess: true },
        { role: 'principal', shouldAccess: false },
        { role: 'teacher', shouldAccess: false },
        { role: 'parent', shouldAccess: false },
        { role: 'finance_officer', shouldAccess: false },
        { role: 'school_director', shouldAccess: false },
        { role: 'student', shouldAccess: false },
        { role: undefined, shouldAccess: false }
      ];

      const results = [];
      for (const { role, shouldAccess } of roles) {
        const access = await MaintenanceModeService.checkUserAccess(role);
        const passed = access.allowed === shouldAccess;
        results.push({ role, expected: shouldAccess, actual: access.allowed, passed });
        
        if (!passed) {
          this.addResult({
            testName: 'Role-Based Access',
            passed: false,
            error: `${role || 'undefined'} role access test failed. Expected: ${shouldAccess}, Actual: ${access.allowed}`
          });
          return;
        }
      }

      // Disable maintenance mode
      await MaintenanceModeService.disableMaintenanceMode();

      this.addResult({
        testName: 'Role-Based Access',
        passed: true,
        details: {
          rolesTested: roles.length,
          allPassed: results.every(r => r.passed)
        }
      });
    } catch (error) {
      this.addResult({
        testName: 'Role-Based Access',
        passed: false,
        error: `Role-based access test failed: ${error}`
      });
    }
  }

  /**
   * Test real-time blocking functionality
   */
  private async testRealTimeBlocking(): Promise<void> {
    try {
      // Enable maintenance mode
      await MaintenanceModeService.enableMaintenanceMode('Test real-time blocking');

      // Test immediate blocking
      const immediateBlock = await MaintenanceModeService.checkUserAccess('teacher');
      if (immediateBlock.allowed) {
        this.addResult({
          testName: 'Real-Time Blocking',
          passed: false,
          error: 'User should be immediately blocked when maintenance is enabled'
        });
        return;
      }

      // Test admin still has access
      const adminAccess = await MaintenanceModeService.checkUserAccess('edufam_admin');
      if (!adminAccess.allowed) {
        this.addResult({
          testName: 'Real-Time Blocking',
          passed: false,
          error: 'Admin should still have access when maintenance is enabled'
        });
        return;
      }

      // Test status consistency
      const status1 = await MaintenanceModeService.getMaintenanceStatus('teacher');
      const status2 = await MaintenanceModeService.getMaintenanceStatus('edufam_admin');
      
      if (status1.inMaintenance !== status2.inMaintenance) {
        this.addResult({
          testName: 'Real-Time Blocking',
          passed: false,
          error: 'Maintenance status should be consistent across all users'
        });
        return;
      }

      // Disable maintenance mode
      await MaintenanceModeService.disableMaintenanceMode();

      // Test immediate unblocking
      const immediateUnblock = await MaintenanceModeService.checkUserAccess('teacher');
      if (!immediateUnblock.allowed) {
        this.addResult({
          testName: 'Real-Time Blocking',
          passed: false,
          error: 'User should be immediately unblocked when maintenance is disabled'
        });
        return;
      }

      this.addResult({
        testName: 'Real-Time Blocking',
        passed: true,
        details: {
          immediateBlock: !immediateBlock.allowed,
          adminAccess: adminAccess.allowed,
          statusConsistent: status1.inMaintenance === status2.inMaintenance,
          immediateUnblock: immediateUnblock.allowed
        }
      });
    } catch (error) {
      this.addResult({
        testName: 'Real-Time Blocking',
        passed: false,
        error: `Real-time blocking test failed: ${error}`
      });
    }
  }

  private addResult(result: TestResult): void {
    this.results.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.testName}: ${result.passed ? 'PASSED' : 'FAILED'}`);
    if (result.error) {
      console.error(`   Error: ${result.error}`);
    }
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  }
}

// Export utility function to run tests
export const runMaintenanceTests = async (): Promise<TestResult[]> => {
  const testSuite = new MaintenanceTestSuite();
  return await testSuite.runAllTests();
}; 