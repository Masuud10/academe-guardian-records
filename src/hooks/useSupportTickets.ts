import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportTicket {
  id: string;
  school_id?: string;
  created_by: string;
  title: string;
  description: string;
  type: 'technical' | 'feature_request' | 'billing' | 'feedback';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  attachments?: string[];
  created_at: string;
  resolved_at?: string;
  creator_name?: string;
  school_name?: string;
}

interface DatabaseTicket {
  id: string;
  school_id?: string;
  created_by: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  assigned_to?: string;
  attachments?: string[];
  created_at: string;
  resolved_at?: string;
  profiles?: { name: string };
  schools?: { name: string };
}

export type NewSupportTicket = Omit<SupportTicket, 'id' | 'created_at' | 'created_by' | 'school_id' | 'status' | 'creator_name' | 'resolved_at' | 'assigned_to' | 'attachments'>

function createTimeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    )
  ]);
}

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          profiles!support_tickets_created_by_fkey(name),
          schools(name)
        `)
        .order('created_at', { ascending: false });

      // Only school staff can see all tickets, others see only their own
      if (user.role !== 'principal' && user.role !== 'school_director') {
        query = query.eq('created_by', user.id);
      }

      console.log('🎫 Fetching support tickets for user:', user.role, user.id);

      const { data, error: fetchError } = await createTimeoutPromise(
        Promise.resolve(query),
        7000
      );

      if (fetchError) throw fetchError;

      const formattedData = data?.map((item: DatabaseTicket) => ({
        id: item.id,
        school_id: item.school_id,
        created_by: item.created_by,
        title: item.title,
        description: item.description,
        type: item.type as 'technical' | 'feature_request' | 'billing' | 'feedback',
        status: item.status as 'open' | 'in_progress' | 'resolved' | 'closed',
        priority: item.priority as 'low' | 'medium' | 'high' | 'urgent',
        assigned_to: item.assigned_to,
        attachments: item.attachments,
        created_at: item.created_at,
        resolved_at: item.resolved_at,
        creator_name: item.profiles?.name,
        school_name: item.schools?.name
      })) || [];

      console.log('🎫 Support tickets fetched:', formattedData.length, 'tickets for role:', user.role);
      setTickets(formattedData);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch support tickets';
      console.error('🎫 Error fetching support tickets:', message);
      setError(message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTickets();
    } else {
      setTickets([]);
      setLoading(false);
    }
  }, [user, fetchTickets]);

  const createTicket = async (ticket: NewSupportTicket) => {
    if (!user) return { data: null, error: new Error("User not authenticated") };

    try {
      console.log('🎫 Creating support ticket for user:', user.id);
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          ...ticket,
          created_by: user.id,
          school_id: user.school_id
        })
        .select()
        .single();

      if (error) throw error;
      console.log('🎫 Support ticket created successfully:', data.id);
      await fetchTickets();
      return { data, error: null };
    } catch (error: unknown) {
      console.error('🎫 Error creating support ticket:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    if (!user) return { data: null, error: new Error("User not authenticated") };
    
    if (user.role !== 'principal' && user.role !== 'school_director') {
      return { data: null, error: new Error("Only school administrators can update ticket status") };
    }

    try {
      console.log('🎫 Updating ticket status:', ticketId, newStatus);
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ 
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      console.log('🎫 Ticket status updated successfully');
      await fetchTickets();
      return { data, error: null };
    } catch (error: unknown) {
      console.error('🎫 Error updating ticket status:', error);
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  return {
    tickets,
    loading,
    error,
    createTicket,
    updateTicketStatus,
    refetch: fetchTickets,
    retry: fetchTickets,
  };
};
