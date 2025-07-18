
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EnhancedAnnouncement {
  id: string;
  title: string;
  content: string;
  target_audience: string[];
  created_by: string;
  school_id?: string;
  expiry_date?: string;
  attachments?: string[];
  is_global: boolean;
  created_at: string;
  creator_name?: string;
  region?: string;
  school_type?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  delivery_channels: string[];
  auto_archive_date?: string;
  is_archived: boolean;
  tags?: string[];
  read_count: number;
  total_recipients: number;
}

export interface AnnouncementFilters {
  priority?: string;
  region?: string;
  school_type?: string;
  target_audience?: string[];
  is_archived?: boolean;
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export const useEnhancedAnnouncements = (filters?: AnnouncementFilters) => {
  const [announcements, setAnnouncements] = useState<EnhancedAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    } else {
      setLoading(false);
      setAnnouncements([]);
    }
  }, [user, filters]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('announcements')
        .select(`
          *,
          profiles!announcements_created_by_fkey(name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters safely
      if (filters?.is_archived !== undefined) {
        query = query.eq('is_archived', filters.is_archived);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.region) {
        query = query.eq('region', filters.region);
      }

      if (filters?.school_type) {
        query = query.eq('school_type', filters.school_type);
      }

      if (filters?.target_audience && filters.target_audience.length > 0) {
        query = query.overlaps('target_audience', filters.target_audience);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters?.date_range) {
        query = query
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Announcements fetch error:', error);
        throw error;
      }

      // Process data safely
      const formattedData: EnhancedAnnouncement[] = (data || []).map(item => {
        try {
          return {
            id: item.id || '',
            title: item.title || '',
            content: item.content || '',
            target_audience: Array.isArray(item.target_audience) ? item.target_audience : [],
            created_by: item.created_by || '',
            school_id: item.school_id,
            expiry_date: item.expiry_date,
            attachments: Array.isArray(item.attachments) ? item.attachments : [],
            is_global: Boolean(item.is_global),
            created_at: item.created_at || new Date().toISOString(),
            creator_name: item.profiles?.name,
            region: item.region,
            school_type: item.school_type,
            priority: (['low', 'medium', 'high', 'urgent'].includes(item.priority) 
              ? item.priority 
              : 'medium') as 'low' | 'medium' | 'high' | 'urgent',
            delivery_channels: Array.isArray(item.delivery_channels) ? item.delivery_channels : ['web'],
            auto_archive_date: item.auto_archive_date,
            is_archived: Boolean(item.is_archived),
            tags: Array.isArray(item.tags) ? item.tags : [],
            read_count: Number(item.read_count) || 0,
            total_recipients: Number(item.total_recipients) || 0
          };
        } catch (itemError) {
          console.warn('Error processing announcement item:', itemError);
          return null;
        }
      }).filter(Boolean) as EnhancedAnnouncement[];

      setAnnouncements(formattedData);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      setError(error?.message || 'Failed to fetch announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const createBroadcastAnnouncement = async (announcement: Omit<EnhancedAnnouncement, 'id' | 'created_at' | 'created_by' | 'read_count' | 'total_recipients'>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          ...announcement,
          created_by: user?.id,
          is_global: user?.role === 'edufam_admin'
        })
        .select()
        .single();

      if (error) throw error;

      // Create recipient records
      await createAnnouncementRecipients(data.id, announcement);
      
      await fetchAnnouncements();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      return { data: null, error };
    }
  };

  const createAnnouncementRecipients = async (announcementId: string, announcement: any) => {
    try {
      // Get users matching target criteria
      let query = supabase
        .from('profiles')
        .select('id, role, school_id');

      // Convert target audience roles to database roles
      const dbRoles = (announcement.target_audience || []).map((role: string) => {
        switch (role) {
          case 'school_owners': return 'school_director';
          case 'principals': return 'principal';
          case 'teachers': return 'teacher';
          case 'parents': return 'parent';
          case 'finance_officers': return 'finance_officer';
          default: return role;
        }
      });

      if (dbRoles.length > 0) {
        query = query.in('role', dbRoles);
      }

      const { data: users, error } = await query;

      if (error) {
        console.warn('Error fetching users for recipients:', error);
        return;
      }

      const recipients = (users || []).map(user => ({
        announcement_id: announcementId,
        user_id: user.id,
        school_id: user.school_id,
        user_role: user.role,
        region: announcement.region,
        school_type: announcement.school_type,
        delivery_channel: announcement.delivery_channels?.[0] || 'web'
      }));

      if (recipients.length > 0) {
        await supabase
          .from('announcement_recipients')
          .insert(recipients);
      }
    } catch (error: any) {
      console.error('Error creating announcement recipients:', error);
    }
  };

  const markAsRead = async (announcementId: string) => {
    try {
      if (!user?.id) return;
      
      await supabase
        .from('announcement_recipients')
        .update({
          read_at: new Date().toISOString(),
          delivery_status: 'read'
        })
        .eq('announcement_id', announcementId)
        .eq('user_id', user.id);
    } catch (error: any) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const archiveAnnouncement = async (announcementId: string) => {
    try {
      await supabase
        .from('announcements')
        .update({ is_archived: true })
        .eq('id', announcementId);
      
      await fetchAnnouncements();
    } catch (error: any) {
      console.error('Error archiving announcement:', error);
    }
  };

  return {
    announcements,
    loading,
    error,
    createBroadcastAnnouncement,
    markAsRead,
    archiveAnnouncement,
    refetch: fetchAnnouncements
  };
};
