import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    profiles: {
      Row: {
        id: string;
        email: string;
        name: string;
        role: string;
        school_id: string;
        phone: string | null;
        bio: string | null;
        avatar_url: string | null;
        status: string;
        created_at: string;
        updated_at: string;
      };
    };
    staff_employment_details: {
      Row: {
        user_id: string;
        salary: number | null;
        total_leave_days_per_year: number;
        leave_days_taken: number;
        updated_at: string;
      };
    };
    schools: {
      Row: {
        id: string;
        name: string;
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

    // GET /my-profile - Get complete profile data with employment details
    if (req.method === 'GET' && path.endsWith('/my-profile')) {
      console.log('Fetching profile data for user:', user.id);

      // Get profile data with school information
      let { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select(`
          *,
          schools!profiles_school_id_fkey(name)
        `)
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create one automatically
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found, creating new profile for user:', user.id);
        
        // Determine role based on email patterns
        let userRole = 'parent'; // Default role
        const userSchoolId = null;
        
        if (user.email?.includes('@elimisha.com') || user.email === 'masuud@gmail.com') {
          userRole = 'elimisha_admin';
        } else if (user.email?.includes('admin')) {
          userRole = 'edufam_admin';
        } else if (user.email?.includes('principal')) {
          userRole = 'principal';
        } else if (user.email?.includes('teacher')) {
          userRole = 'teacher';
        } else if (user.email?.includes('owner')) {
          userRole = 'school_owner';
        } else if (user.email?.includes('finance')) {
          userRole = 'finance_officer';
        }

        // Create the profile
        const { data: newProfile, error: createError } = await supabaseClient
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: userRole,
            school_id: userSchoolId,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select(`
            *,
            schools!profiles_school_id_fkey(name)
          `)
          .single();

        if (createError) {
          console.error('Profile creation error:', createError);
          return new Response(
            JSON.stringify({ error: 'Failed to create profile' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }

        profileData = newProfile;
      } else if (profileError) {
        console.error('Profile fetch error:', profileError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch profile' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Get employment details if user is not a parent
      let employmentDetails = null;
      if (profileData.role !== 'parent') {
        const { data: empData, error: empError } = await supabaseClient
          .from('staff_employment_details')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (empError && empError.code === 'PGRST116') {
          // Employment details don't exist, create default ones
          console.log('Employment details not found, creating default for user:', user.id);
          
          const { data: newEmpData, error: createEmpError } = await supabaseClient
            .from('staff_employment_details')
            .insert({
              user_id: user.id,
              salary: null,
              total_leave_days_per_year: 21, // Default annual leave
              leave_days_taken: 0,
              updated_at: new Date().toISOString()
            })
            .select('*')
            .single();

          if (createEmpError) {
            console.error('Employment details creation error:', createEmpError);
          } else {
            employmentDetails = newEmpData;
          }
        } else if (empError) {
          console.error('Employment details fetch error:', empError);
        } else {
          employmentDetails = empData;
        }
      }

      const response = {
        ...profileData,
        employment_details: employmentDetails,
      };

      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // PATCH /my-profile - Update profile data
    if (req.method === 'PATCH' && path.endsWith('/my-profile')) {
      const body = await req.json();
      console.log('Updating profile for user:', user.id);

      // Only allow updating non-sensitive fields
      const allowedFields = ['name', 'phone', 'bio'];
      const updateData: Record<string, unknown> = {};
      
      allowedFields.forEach(field => {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid fields to update' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      updateData.updated_at = new Date().toISOString();

      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Profile doesn't exist, create it first
        console.log('Profile not found during update, creating new profile for user:', user.id);
        
        // Determine role based on email patterns
        let userRole = 'parent'; // Default role
        const userSchoolId = null;
        
        if (user.email?.includes('@elimisha.com') || user.email === 'masuud@gmail.com') {
          userRole = 'elimisha_admin';
        } else if (user.email?.includes('admin')) {
          userRole = 'edufam_admin';
        } else if (user.email?.includes('principal')) {
          userRole = 'principal';
        } else if (user.email?.includes('teacher')) {
          userRole = 'teacher';
        } else if (user.email?.includes('owner')) {
          userRole = 'school_owner';
        } else if (user.email?.includes('finance')) {
          userRole = 'finance_officer';
        }

        // Create the profile with update data
        const { data, error } = await supabaseClient
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: updateData.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: userRole,
            school_id: userSchoolId,
            status: 'active',
            phone: updateData.phone || null,
            bio: updateData.bio || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Profile creation error during update:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to create profile' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }

        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } else if (checkError) {
        console.error('Profile check error:', checkError);
        return new Response(
          JSON.stringify({ error: 'Failed to check profile' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Profile exists, update it
      const { data, error } = await supabaseClient
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update profile' }),
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