import { MaintenanceModeService } from '@/services/system/maintenanceModeService';

/**
 * Comprehensive test to verify maintenance mode functionality
 */
export const testMaintenanceMode = async () => {
  console.log('🧪 Testing Maintenance Mode Functionality...');
  
  try {
    // Test 1: Check current status
    console.log('\n1. Checking current maintenance status...');
    const currentStatus = await MaintenanceModeService.getMaintenanceStatus('teacher');
    console.log('Current status:', currentStatus);

    // Test 2: Enable maintenance mode
    console.log('\n2. Enabling maintenance mode...');
    const enableResult = await MaintenanceModeService.enableMaintenanceMode('Test maintenance mode - system will be inaccessible to non-admin users');
    if (!enableResult.success) {
      console.error('❌ Failed to enable maintenance mode:', enableResult.error);
      return false;
    }
    console.log('✅ Maintenance mode enabled successfully');

    // Test 3: Verify maintenance mode is enabled
    console.log('\n3. Verifying maintenance mode is enabled...');
    const isEnabled = await MaintenanceModeService.isMaintenanceModeEnabled();
    if (!isEnabled) {
      console.error('❌ Maintenance mode should be enabled but is not');
      return false;
    }
    console.log('✅ Maintenance mode is enabled');

    // Test 4: Check that non-admin users are blocked
    console.log('\n4. Testing user access control...');
    const nonAdminRoles = ['teacher', 'principal', 'parent', 'finance_officer', 'school_director', 'student'];
    
    for (const role of nonAdminRoles) {
      const access = await MaintenanceModeService.checkUserAccess(role);
      if (access.allowed) {
        console.error(`❌ ${role} should be blocked but has access`);
        return false;
      }
      console.log(`✅ ${role} correctly blocked`);
    }

    // Test 5: Check that admin users can access
    console.log('\n5. Testing admin access...');
    const adminAccess = await MaintenanceModeService.checkUserAccess('edufam_admin');
    if (!adminAccess.allowed) {
      console.error('❌ Admin should have access but is blocked');
      return false;
    }
    console.log('✅ Admin correctly has access');

    // Test 6: Check maintenance status for different roles
    console.log('\n6. Testing maintenance status for different roles...');
    const teacherStatus = await MaintenanceModeService.getMaintenanceStatus('teacher');
    const adminStatus = await MaintenanceModeService.getMaintenanceStatus('edufam_admin');
    
    console.log('Teacher status:', teacherStatus);
    console.log('Admin status:', adminStatus);
    
    if (!teacherStatus.inMaintenance || teacherStatus.canBypass) {
      console.error('❌ Teacher should be in maintenance and cannot bypass');
      return false;
    }
    
    if (!adminStatus.inMaintenance || !adminStatus.canBypass) {
      console.error('❌ Admin should be in maintenance but can bypass');
      return false;
    }
    
    console.log('✅ Status checks passed');

    // Test 7: Disable maintenance mode
    console.log('\n7. Disabling maintenance mode...');
    const disableResult = await MaintenanceModeService.disableMaintenanceMode();
    if (!disableResult.success) {
      console.error('❌ Failed to disable maintenance mode:', disableResult.error);
      return false;
    }
    console.log('✅ Maintenance mode disabled successfully');

    // Test 8: Verify all users can access after disabling
    console.log('\n8. Verifying all users can access after disabling...');
    const allRoles = ['teacher', 'principal', 'parent', 'finance_officer', 'school_director', 'student'];
    
    for (const role of allRoles) {
      const access = await MaintenanceModeService.checkUserAccess(role);
      if (!access.allowed) {
        console.error(`❌ ${role} should have access but is blocked`);
        return false;
      }
      console.log(`✅ ${role} correctly has access`);
    }

    console.log('\n🎉 All maintenance mode tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
};

/**
 * Test maintenance mode with real-time status checking
 */
export const testRealTimeMaintenance = async () => {
  console.log('🔄 Testing Real-Time Maintenance Mode...');
  
  try {
    // Enable maintenance mode
    await MaintenanceModeService.enableMaintenanceMode('Real-time test');
    
    // Test immediate blocking
    const teacherAccess = await MaintenanceModeService.checkUserAccess('teacher');
    const adminAccess = await MaintenanceModeService.checkUserAccess('edufam_admin');
    
    console.log('Teacher access:', teacherAccess.allowed ? '❌ ALLOWED (should be blocked)' : '✅ BLOCKED');
    console.log('Admin access:', adminAccess.allowed ? '✅ ALLOWED' : '❌ BLOCKED (should be allowed)');
    
    // Disable maintenance mode
    await MaintenanceModeService.disableMaintenanceMode();
    
    // Test immediate unblocking
    const teacherAccessAfter = await MaintenanceModeService.checkUserAccess('teacher');
    const adminAccessAfter = await MaintenanceModeService.checkUserAccess('edufam_admin');
    
    console.log('Teacher access after disable:', teacherAccessAfter.allowed ? '✅ ALLOWED' : '❌ BLOCKED (should be allowed)');
    console.log('Admin access after disable:', adminAccessAfter.allowed ? '✅ ALLOWED' : '❌ BLOCKED (should be allowed)');
    
    return true;
  } catch (error) {
    console.error('❌ Real-time test failed:', error);
    return false;
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).testMaintenanceMode = testMaintenanceMode;
  (window as unknown as Record<string, unknown>).testRealTimeMaintenance = testRealTimeMaintenance;
} 