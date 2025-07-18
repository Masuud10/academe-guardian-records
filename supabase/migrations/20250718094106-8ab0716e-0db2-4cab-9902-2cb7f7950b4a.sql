-- First, check what constraints exist and remove them all before updating data
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_login_details') THEN
    -- Drop ALL existing constraints on role column
    ALTER TABLE public.user_login_details DROP CONSTRAINT IF EXISTS user_login_details_role_check;
    ALTER TABLE public.user_login_details DROP CONSTRAINT IF EXISTS valid_user_roles;
    ALTER TABLE public.user_login_details DROP CONSTRAINT IF EXISTS check_valid_role;
    
    -- Update all existing school_owner roles to school_director now that constraints are removed
    UPDATE public.user_login_details 
    SET role = 'school_director' 
    WHERE role = 'school_owner';
    
    -- Now add the proper constraint with all valid roles including school_director
    ALTER TABLE public.user_login_details ADD CONSTRAINT user_login_details_role_check 
    CHECK (role IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'edufam_admin', 'elimisha_admin', 'hr'));
  END IF;
END$$;

-- Update all existing school_owner roles to school_director in profiles table
UPDATE public.profiles 
SET role = 'school_director' 
WHERE role = 'school_owner';

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

-- Ensure all HR users have active status and school assignment
UPDATE public.profiles 
SET 
  status = 'active',
  school_id = COALESCE(school_id, (SELECT id FROM public.schools ORDER BY created_at LIMIT 1)),
  updated_at = now()
WHERE role = 'hr' AND (status IS NULL OR status != 'active' OR school_id IS NULL);