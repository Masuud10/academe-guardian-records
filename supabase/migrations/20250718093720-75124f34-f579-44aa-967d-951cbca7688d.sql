-- Update all school_owner references to school_director in database functions
-- Update create_comprehensive_school function to use school_director
CREATE OR REPLACE FUNCTION public.create_comprehensive_school(
  school_name text, 
  school_email text, 
  school_phone text, 
  school_address text, 
  school_type text DEFAULT 'primary'::text, 
  term_structure text DEFAULT '3-term'::text, 
  registration_number text DEFAULT NULL::text, 
  year_established integer DEFAULT NULL::integer, 
  logo_url text DEFAULT NULL::text, 
  website_url text DEFAULT NULL::text, 
  motto text DEFAULT NULL::text, 
  slogan text DEFAULT NULL::text, 
  director_name text DEFAULT NULL::text, 
  director_email text DEFAULT NULL::text, 
  director_phone text DEFAULT NULL::text, 
  director_information text DEFAULT NULL::text, 
  mpesa_paybill_number text DEFAULT NULL::text, 
  mpesa_consumer_key text DEFAULT NULL::text, 
  mpesa_consumer_secret text DEFAULT NULL::text, 
  mpesa_passkey text DEFAULT NULL::text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  school_id uuid;
  director_id uuid;
  current_user_role text;
BEGIN
  -- Check user role
  SELECT role INTO current_user_role
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF current_user_role NOT IN ('edufam_admin', 'elimisha_admin') THEN
    RETURN jsonb_build_object('error', 'Insufficient permissions');
  END IF;

  -- Validate required fields
  IF school_name IS NULL OR school_email IS NULL OR school_phone IS NULL OR school_address IS NULL THEN
    RETURN jsonb_build_object('error', 'Missing required fields');
  END IF;

  -- Check for existing school name
  IF EXISTS (SELECT 1 FROM public.schools WHERE name = school_name) THEN
    RETURN jsonb_build_object('error', 'School name already exists');
  END IF;

  -- Check for existing school email
  IF EXISTS (SELECT 1 FROM public.schools WHERE email = school_email) THEN
    RETURN jsonb_build_object('error', 'School email already exists');
  END IF;

  -- Check for existing registration number
  IF registration_number IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.schools s WHERE s.registration_number = create_comprehensive_school.registration_number
  ) THEN
    RETURN jsonb_build_object('error', 'Registration number already exists');
  END IF;

  -- Create school
  INSERT INTO public.schools (
    name, email, phone, address, school_type, term_structure,
    registration_number, year_established, logo_url, website_url,
    motto, slogan, status, subscription_plan
  ) VALUES (
    school_name, school_email, school_phone, school_address,
    school_type, term_structure, registration_number, year_established,
    logo_url, website_url, motto, slogan, 'active', 'basic'
  ) RETURNING id INTO school_id;

  -- Create school director if details provided
  IF director_name IS NOT NULL AND director_email IS NOT NULL THEN
    SELECT user_id INTO director_id
    FROM public.create_admin_user(
      director_email,
      'TempPassword123!',
      director_name,
      'school_director',
      school_id
    );
    
    -- Update school with director
    UPDATE public.schools 
    SET owner_id = director_id
    WHERE id = school_id;
  END IF;

  -- Create finance settings if MPESA details provided
  IF mpesa_paybill_number IS NOT NULL AND mpesa_consumer_key IS NOT NULL THEN
    INSERT INTO public.finance_settings (
      school_id, mpesa_enabled, mpesa_paybill_number,
      mpesa_consumer_key, mpesa_consumer_secret, mpesa_passkey
    ) VALUES (
      school_id, true, mpesa_paybill_number,
      mpesa_consumer_key, mpesa_consumer_secret, mpesa_passkey
    );
  END IF;

  -- Create default academic year
  INSERT INTO public.academic_years (
    school_id, year_name, start_date, end_date, is_current
  ) VALUES (
    school_id,
    EXTRACT(YEAR FROM CURRENT_DATE)::text,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 year',
    true
  );

  RETURN jsonb_build_object(
    'success', true,
    'school_id', school_id,
    'director_id', director_id,
    'message', 'School created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'create_comprehensive_school error: %', SQLERRM;
  RETURN jsonb_build_object('error', 'Failed to create school: ' || SQLERRM);
END;
$$;

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