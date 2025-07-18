import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category?: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  academic_context?: {
    class_id?: string;
    subject_id?: string;
  };
  data?: any;
}

export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createNotification(
    userId: string,
    notification: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First, create an admin communication
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const communicationData = {
        title: notification.title,
        message: notification.message,
        created_by: user.id,
        target_roles: ['all'], // Target all roles for system notifications
        priority: notification.type === 'error' ? 'high' : 
                  notification.type === 'warning' ? 'medium' : 'low',
        dismissible: true,
        is_active: true
      };

      const { data: communication, error: commError } = await supabase
        .from('admin_communications')
        .insert(communicationData)
        .select()
        .single();

      if (commError) throw commError;

      // The trigger will automatically create notifications for all users
      // But we can also manually create one for the specific user
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          announcement_id: communication.id,
          is_read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (notifError) throw notifError;

      return { success: true };
    } catch (error: any) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create notifications for multiple users
   */
  static async createNotificationsForUsers(
    userIds: string[],
    notification: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First, create an admin communication
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const communicationData = {
        title: notification.title,
        message: notification.message,
        created_by: user.id,
        target_roles: ['all'], // Target all roles for system notifications
        priority: notification.type === 'error' ? 'high' : 
                  notification.type === 'warning' ? 'medium' : 'low',
        dismissible: true,
        is_active: true
      };

      const { data: communication, error: commError } = await supabase
        .from('admin_communications')
        .insert(communicationData)
        .select()
        .single();

      if (commError) throw commError;

      // Create notifications for specific users
      const notifications = userIds.map(userId => ({
        user_id: userId,
        announcement_id: communication.id,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) throw notifError;

      return { success: true };
    } catch (error: any) {
      console.error('Error creating notifications for users:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a system-wide announcement that creates notifications for all users
   */
  static async createSystemAnnouncement(
    announcement: {
      title: string;
      message: string;
      priority: 'low' | 'medium' | 'high';
      targetRoles?: string[];
      createdBy?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First create the admin communication
      const { data: commData, error: commError } = await supabase
        .from('admin_communications')
        .insert({
          title: announcement.title,
          message: announcement.message,
          priority: announcement.priority,
          target_roles: announcement.targetRoles || ['all'],
          is_active: true,
          created_by: announcement.createdBy || '',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (commError) throw commError;

      // The trigger will automatically create notifications for all target users
      return { success: true };
    } catch (error: any) {
      console.error('Error creating system announcement:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 50,
    unreadOnly: boolean = false
  ): Promise<{ data: Notification[]; count: number; error?: string }> {
    try {
      const offset = (page - 1) * limit;
      
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      return { 
        data: (data || []).map(item => ({
          ...item,
          title: 'Announcement',
          message: item.announcement_id || '',
          type: 'info' as const
        })),
        count: count || 0 
      };
    } catch (error: any) {
      console.error('Error fetching user notifications:', error);
      return { data: [], count: 0, error: error.message };
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(
    notificationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(
    notificationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(
    userId: string
  ): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return { count: count || 0 };
    } catch (error: any) {
      console.error('Error getting unread count:', error);
      return { count: 0, error: error.message };
    }
  }

  /**
   * Academic context-aware notifications
   */
  static async notifyGradeSubmission(
    teacherId: string,
    principalId: string,
    gradeData: any
  ): Promise<void> {
    try {
      // Notify principal about new grade submission
      await this.createNotification(principalId, {
        title: 'New Grade Submission',
        message: `Teacher ${gradeData.teacher_name} has submitted grades for ${gradeData.subject} - ${gradeData.class_name}`,
        type: 'info',
        category: 'grades',
        action_url: `/grades/pending`,
        academic_context: {
          class_id: gradeData.class_id,
          subject_id: gradeData.subject_id
        }
      });
    } catch (error) {
      console.error('Error notifying grade submission:', error);
    }
  }

  static async notifyGradeApproval(
    teacherId: string,
    gradeData: any
  ): Promise<void> {
    try {
      // Notify teacher about grade approval
      await this.createNotification(teacherId, {
        title: 'Grade Approved',
        message: `Your grades for ${gradeData.subject} - ${gradeData.class_name} have been approved by the principal.`,
        type: 'success',
        category: 'grades',
        action_url: `/grades`,
        academic_context: {
          class_id: gradeData.class_id,
          subject_id: gradeData.subject_id
        }
      });
    } catch (error) {
      console.error('Error notifying grade approval:', error);
    }
  }

  static async notifyGradeRejection(
    teacherId: string,
    gradeData: any,
    reason: string
  ): Promise<void> {
    try {
      // Notify teacher about grade rejection
      await this.createNotification(teacherId, {
        title: 'Grade Rejected',
        message: `Your grades for ${gradeData.subject} - ${gradeData.class_name} have been rejected. Reason: ${reason}`,
        type: 'warning',
        category: 'grades',
        action_url: `/grades/pending`,
        academic_context: {
          class_id: gradeData.class_id,
          subject_id: gradeData.subject_id
        }
      });
    } catch (error) {
      console.error('Error notifying grade rejection:', error);
    }
  }

  static async notifyExamCreated(
    teacherIds: string[],
    examData: any
  ): Promise<void> {
    try {
      // Notify teachers about new exam
      await this.createNotificationsForUsers(teacherIds, {
        title: 'New Examination Created',
        message: `A new examination "${examData.title}" has been created for ${examData.subject} - ${examData.class_name}`,
        type: 'info',
        category: 'examinations',
        action_url: `/examinations`,
        academic_context: {
          class_id: examData.class_id,
          subject_id: examData.subject_id
        }
      });
    } catch (error) {
      console.error('Error notifying exam creation:', error);
    }
  }

  static async notifyAttendanceReminder(
    teacherId: string,
    classData: any
  ): Promise<void> {
    try {
      // Notify teacher about attendance reminder
      await this.createNotification(teacherId, {
        title: 'Attendance Reminder',
        message: `Please mark attendance for ${classData.class_name} today.`,
        type: 'info',
        category: 'attendance',
        action_url: `/attendance`,
        academic_context: {
          class_id: classData.class_id
        }
      });
    } catch (error) {
      console.error('Error notifying attendance reminder:', error);
    }
  }

  static async notifyReportGenerated(
    userId: string,
    reportData: any
  ): Promise<void> {
    try {
      // Notify user about report generation
      await this.createNotification(userId, {
        title: 'Report Generated',
        message: `Your ${reportData.type} report for ${reportData.period} has been generated successfully.`,
        type: 'success',
        category: 'reports',
        action_url: `/reports`,
        data: reportData
      });
    } catch (error) {
      console.error('Error notifying report generation:', error);
    }
  }

  static async notifyDataIssue(
    adminIds: string[],
    issueData: any
  ): Promise<void> {
    try {
      // Notify admins about data issues
      await this.createNotificationsForUsers(adminIds, {
        title: 'Data Issue Detected',
        message: `A data issue has been detected: ${issueData.description}`,
        type: 'warning',
        category: 'system',
        action_url: `/admin/issues`,
        data: issueData
      });
    } catch (error) {
      console.error('Error notifying data issue:', error);
    }
  }

  static async notifySystemMaintenance(
    message: string,
    scheduledTime: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.createSystemAnnouncement({
        title: 'System Maintenance Notice',
        message: `Scheduled maintenance will occur on ${scheduledTime}. ${message}`,
        priority: 'high',
        targetRoles: ['all']
      });
    } catch (error: any) {
      console.error('Error notifying system maintenance:', error);
      return { success: false, error: error.message };
    }
  }

  static async notifyFeatureUpdate(
    message: string,
    targetRoles?: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.createSystemAnnouncement({
        title: 'Feature Update',
        message,
        priority: 'medium',
        targetRoles: targetRoles || ['all']
      });
    } catch (error: any) {
      console.error('Error notifying feature update:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notification preferences for a user
   */
  static async getNotificationPreferences(
    userId: string
  ): Promise<{ data: any; error?: string }> {
    try {
      // @ts-ignore - Deep type instantiation issue with Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      return { data: data || null };
    } catch (error: any) {
      console.error('Error fetching notification preferences:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update notification preferences for a user
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use profiles table instead of notification_preferences
      const { error } = await supabase
        .from('profiles')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a test notification for debugging
   */
  static async createTestNotification(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create an admin communication for testing
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const communicationData = {
        title: 'Test Notification',
        message: 'This is a test notification to verify the notification system is working properly.',
        created_by: user.id,
        target_roles: ['teacher', 'principal', 'school_director', 'finance_officer', 'parent', 'hr'], // Target all roles for testing
        priority: 'medium',
        dismissible: true,
        is_active: true
      };

      const { data: communication, error: commError } = await supabase
        .from('admin_communications')
        .insert(communicationData)
        .select()
        .single();

      if (commError) throw commError;

      // Create a specific notification for the user
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          announcement_id: communication.id,
          is_read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (notifError) throw notifError;

      return { success: true };
    } catch (error: any) {
      console.error('Error creating test notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a test system announcement
   */
  static async createTestAnnouncement(): Promise<{ success: boolean; error?: string }> {
    try {
      // Create an admin communication for testing
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const communicationData = {
        title: 'Test System Announcement',
        message: 'This is a test system announcement to verify the notification system is working properly.',
        created_by: user.id,
        target_roles: ['teacher', 'principal', 'school_director', 'finance_officer', 'parent', 'hr'], // Target all roles for testing
        priority: 'medium',
        dismissible: true,
        is_active: true
      };

      const { data: communication, error: commError } = await supabase
        .from('admin_communications')
        .insert(communicationData)
        .select()
        .single();

      if (commError) throw commError;

      // The trigger will automatically create notifications for all users
      return { success: true };
    } catch (error: any) {
      console.error('Error creating test announcement:', error);
      return { success: false, error: error.message };
    }
  }
}

export default NotificationService;