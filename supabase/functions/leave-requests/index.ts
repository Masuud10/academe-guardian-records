import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    leave_requests: {
      Row: {
        id: number;
        requester_id: string;
        start_date: string;
        end_date: string;
        reason: string | null;
        status: string;
        reviewed_by: string | null;
        reviewed_at: string | null;
        created_at: string;
      };
      Insert: {
        requester_id: string;
        start_date: string;
        end_date: string;
        reason?: string;
        status?: string;
      };
    };
    profiles: {
      Row: {
        id: string;
        name: string;
        role: string;
      };
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname;

    // POST /leave-requests - Create new leave request
    if (req.method === 'POST' && path.endsWith('/leave-requests')) {
      const body = await req.json();
      console.log('Creating leave request for user:', user.id);

      const { start_date, end_date, reason } = body;

      if (!start_date || !end_date) {
        return new Response(
          JSON.stringify({ error: 'Start date and end date are required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Validate dates
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        return new Response(
          JSON.stringify({ error: 'Start date cannot be in the past' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      if (endDate < startDate) {
        return new Response(
          JSON.stringify({ error: 'End date cannot be before start date' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const { data, error } = await supabaseClient
        .from('leave_requests')
        .insert({
          requester_id: user.id,
          start_date,
          end_date,
          reason: reason || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Leave request creation error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create leave request' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // GET /leave-requests/my-history - Get user's leave request history
    if (req.method === 'GET' && path.endsWith('/leave-requests/my-history')) {
      console.log('Fetching leave request history for user:', user.id);

      const { data, error } = await supabaseClient
        .from('leave_requests')
        .select(`
          id,
          start_date,
          end_date,
          reason,
          status,
          reviewed_at,
          created_at,
          profiles!leave_requests_reviewed_by_fkey(name)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Leave request history fetch error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch leave request history' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});