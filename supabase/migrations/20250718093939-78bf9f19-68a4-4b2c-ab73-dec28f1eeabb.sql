-- First, update the check constraint on user_login_details table to include school_director
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_login_details') THEN
    -- Drop the existing check constraint
    ALTER TABLE public.user_login_details DROP CONSTRAINT IF EXISTS user_login_details_role_check;
    
    -- Add the new constraint with school_director instead of school_owner
    ALTER TABLE public.user_login_details ADD CONSTRAINT user_login_details_role_check 
    CHECK (role IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin', 'hr'));
  END IF;
END$$;

-- Update all existing school_owner roles to school_director in profiles table
UPDATE public.profiles 
SET role = 'school_director' 
WHERE role = 'school_owner';

-- Update all existing school_owner roles to school_director in user_login_details table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_login_details') THEN
    UPDATE public.user_login_details 
    SET role = 'school_director' 
    WHERE role = 'school_owner';
  END IF;
END$$;

-- Update is_finance_officer_authorized_for_school function to use school_director
CREATE OR REPLACE FUNCTION public.is_finance_officer_authorized_for_school(p_school_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN (get_current_user_role() = ANY(ARRAY['elimisha_admin', 'edufam_admin'])) THEN true
    WHEN (get_current_user_role() = ANY(ARRAY['finance_officer', 'principal', 'school_director'])) 
         AND (get_current_user_school_id() = p_school_id) THEN true
    ELSE false
  END;
$$;

-- Update the ensure_principal_school_assignment function to include hr and school_director
CREATE OR REPLACE FUNCTION public.ensure_principal_school_assignment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If creating/updating roles that need school assignment without school_id, assign to first school
  IF NEW.role IN ('principal', 'school_director', 'hr', 'teacher', 'finance_officer') AND NEW.school_id IS NULL THEN
    SELECT id INTO NEW.school_id 
    FROM public.schools 
    ORDER BY created_at 
    LIMIT 1;
    
    -- If no schools exist, raise an error
    IF NEW.school_id IS NULL THEN
      RAISE EXCEPTION 'Cannot create % user: No schools exist in the system', NEW.role;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a function to validate HR user authentication
CREATE OR REPLACE FUNCTION public.validate_hr_authentication(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    user_profile record;
    result jsonb;
BEGIN
    -- Get HR user profile
    SELECT 
        p.id,
        p.email,
        p.role,
        p.name,
        p.school_id,
        p.status,
        p.created_at,
        p.updated_at
    INTO user_profile
    FROM public.profiles p
    WHERE p.email = user_email AND p.role = 'hr';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'HR user not found or invalid role'
        );
    END IF;
    
    -- Check if HR user has proper school assignment
    IF user_profile.school_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'HR user missing school assignment',
            'needs_assignment', true,
            'user_id', user_profile.id
        );
    END IF;
    
    -- Check if HR user is active
    IF user_profile.status != 'active' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'HR user account is not active',
            'status', user_profile.status,
            'user_id', user_profile.id
        );
    END IF;
    
    -- Return successful validation
    RETURN jsonb_build_object(
        'success', true,
        'user_id', user_profile.id,
        'email', user_profile.email,
        'name', user_profile.name,
        'role', user_profile.role,
        'school_id', user_profile.school_id,
        'status', user_profile.status,
        'message', 'HR user authentication validated successfully'
    );
END;
$$;

-- Ensure all HR users have active status and school assignment
UPDATE public.profiles 
SET 
  status = 'active',
  school_id = COALESCE(school_id, (SELECT id FROM public.schools ORDER BY created_at LIMIT 1)),
  updated_at = now()
WHERE role = 'hr' AND (status IS NULL OR status != 'active' OR school_id IS NULL);