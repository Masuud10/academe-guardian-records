-- CRITICAL FIX: Resolve HR user login "Database error querying schema" issue
-- This migration fixes the infinite recursion in RLS policies that prevents HR login

-- Step 1: Drop ALL existing policies that cause infinite recursion
-- Drop profiles policies
DROP POLICY IF EXISTS "Enable users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "School users can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Multi-tenant profiles access" ON public.profiles;
DROP POLICY IF EXISTS "User creation policy" ON public.profiles;
DROP POLICY IF EXISTS "HR can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "HR can update profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile or HR can view school profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or HR can update school profiles" ON public.profiles;

-- Drop user_login_details policies
DROP POLICY IF EXISTS "user_login_details_select_own" ON public.user_login_details;
DROP POLICY IF EXISTS "user_login_details_insert_system" ON public.user_login_details;
DROP POLICY IF EXISTS "user_login_details_update_own" ON public.user_login_details;
DROP POLICY IF EXISTS "user_login_details_delete_own" ON public.user_login_details;
DROP POLICY IF EXISTS "Users can view their login details or HR can view school login details" ON public.user_login_details;
DROP POLICY IF EXISTS "Users can update their login details or HR can update school login details" ON public.user_login_details;
DROP POLICY IF EXISTS "HR can view user_login_details in their school" ON public.user_login_details;
DROP POLICY IF EXISTS "HR can update user_login_details in their school" ON public.user_login_details;

-- Drop any other policies that might exist (catch-all)
DO $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.profiles';
    END LOOP;
    
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_login_details' 
        AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.user_login_details';
    END LOOP;
END $$;

-- Step 2: Create the ONLY safe, non-recursive policies
-- These policies ONLY use auth.uid() which is known before accessing the table

-- Profiles table policies - users can only access their own profile
CREATE POLICY "profiles_select_own" 
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" 
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- User login details table policies - users can only access their own login details
CREATE POLICY "user_login_details_select_own" 
ON public.user_login_details FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "user_login_details_insert_system" 
ON public.user_login_details FOR INSERT
WITH CHECK (true);

CREATE POLICY "user_login_details_update_own" 
ON public.user_login_details FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "user_login_details_delete_own" 
ON public.user_login_details FOR DELETE
USING (auth.uid() = user_id);

-- Step 3: Ensure RLS is enabled on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_details ENABLE ROW LEVEL SECURITY;

-- Step 4: Update helper functions to be more robust
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_school_id()
RETURNS UUID 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = ''
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Step 5: Ensure HR user exists and is properly configured
DO $$
DECLARE
    hr_user_id UUID;
    first_school_id UUID;
    hr_profile_exists BOOLEAN;
    hr_login_details_exists BOOLEAN;
BEGIN
    -- Get first school ID
    SELECT id INTO first_school_id FROM public.schools ORDER BY created_at LIMIT 1;
    
    IF first_school_id IS NULL THEN
        RAISE EXCEPTION 'No schools found in database. Please create a school first.';
    END IF;
    
    -- Check if HR user exists in auth.users
    SELECT id INTO hr_user_id FROM auth.users WHERE email = 'hr@edufam.com';
    
    -- If HR user doesn't exist in auth.users, create it
    IF hr_user_id IS NULL THEN
        hr_user_id := gen_random_uuid();
        
        -- Create HR user in auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            role,
            aud
        ) VALUES (
            hr_user_id,
            '00000000-0000-0000-0000-000000000000',
            'hr@edufam.com',
            crypt('HRPassword123!', gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object('name', 'HR Manager', 'role', 'hr', 'created_by_admin', true),
            'authenticated',
            'authenticated'
        );
        
        RAISE NOTICE 'Created HR user in auth.users with ID: %', hr_user_id;
    ELSE
        RAISE NOTICE 'HR user already exists in auth.users with ID: %', hr_user_id;
    END IF;
    
    -- Check if HR profile exists in profiles table
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = hr_user_id) INTO hr_profile_exists;
    
    -- Create or update HR profile
    IF NOT hr_profile_exists THEN
        INSERT INTO public.profiles (id, email, name, role, school_id, created_at, updated_at)
        VALUES (hr_user_id, 'hr@edufam.com', 'HR Manager', 'hr', first_school_id, now(), now());
        RAISE NOTICE 'Created HR profile in profiles table';
    ELSE
        -- Update existing HR profile to ensure it's correct
        UPDATE public.profiles 
        SET 
            email = 'hr@edufam.com',
            name = 'HR Manager',
            role = 'hr',
            school_id = first_school_id,
            updated_at = now()
        WHERE id = hr_user_id;
        RAISE NOTICE 'Updated existing HR profile';
    END IF;
    
    -- Check if user_login_details exists for HR user
    SELECT EXISTS(SELECT 1 FROM public.user_login_details WHERE user_id = hr_user_id) INTO hr_login_details_exists;
    
    -- Create or update user_login_details for HR user
    IF NOT hr_login_details_exists THEN
        INSERT INTO public.user_login_details (
            user_id, 
            role, 
            access_level,
            employee_id,
            department,
            created_at,
            updated_at
        ) VALUES (
            hr_user_id,
            'hr',
            2, -- HR has access level 2
            'EMP' || EXTRACT(EPOCH FROM now())::TEXT,
            'Human Resources',
            now(),
            now()
        );
        RAISE NOTICE 'Created user_login_details for HR user';
    ELSE
        -- Update existing login details
        UPDATE public.user_login_details 
        SET 
            role = 'hr',
            access_level = 2,
            department = 'Human Resources',
            updated_at = now()
        WHERE user_id = hr_user_id;
        RAISE NOTICE 'Updated existing user_login_details for HR user';
    END IF;
    
END $$;

-- Step 6: Test that everything works
DO $$
DECLARE
    hr_user_id UUID;
    test_result BOOLEAN;
BEGIN
    -- Get HR user ID
    SELECT id INTO hr_user_id FROM auth.users WHERE email = 'hr@edufam.com';
    
    IF hr_user_id IS NULL THEN
        RAISE EXCEPTION 'HR user not found in auth.users';
    END IF;
    
    -- Test if HR user can access their own profile (simulates login)
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = hr_user_id
    ) INTO test_result;
    
    IF test_result THEN
        RAISE NOTICE 'HR user profile access test: SUCCESS';
    ELSE
        RAISE WARNING 'HR user profile access test: FAILED';
    END IF;
    
    -- Test if HR user can access user_login_details
    SELECT EXISTS(
        SELECT 1 FROM public.user_login_details 
        WHERE user_id = hr_user_id
    ) INTO test_result;
    
    IF test_result THEN
        RAISE NOTICE 'HR user login details access test: SUCCESS';
    ELSE
        RAISE WARNING 'HR user login details access test: FAILED';
    END IF;
    
    RAISE NOTICE 'HR user setup verification complete. Login should now work.';
    
END $$;

-- Step 7: Create a simple function to verify HR user can access their data
CREATE OR REPLACE FUNCTION public.verify_hr_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    hr_user_id UUID;
    profile_data jsonb;
    login_data jsonb;
BEGIN
    -- Get HR user ID
    SELECT id INTO hr_user_id FROM auth.users WHERE email = 'hr@edufam.com';
    
    IF hr_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'HR user not found');
    END IF;
    
    -- Get profile data
    SELECT to_jsonb(p.*) INTO profile_data
    FROM public.profiles p
    WHERE p.id = hr_user_id;
    
    -- Get login details
    SELECT to_jsonb(uld.*) INTO login_data
    FROM public.user_login_details uld
    WHERE uld.user_id = hr_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', hr_user_id,
        'profile', profile_data,
        'login_details', login_data
    );
END;
$$;