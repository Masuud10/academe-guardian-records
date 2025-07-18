-- CRITICAL FIX: Resolve infinite recursion in RLS policies for HR login
-- This migration fixes the "infinite recursion detected in policy" error

-- Step 1: Disable RLS temporarily to clear all policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_details DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (this will clear any recursive ones)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "HR can view school staff profiles" ON public.profiles;
DROP POLICY IF EXISTS "HR can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "HR can update profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Enable HR to view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "Enable HR to manage users in their school" ON public.profiles;
DROP POLICY IF EXISTS "School directors can view staff profiles" ON public.profiles;
DROP POLICY IF EXISTS "Principals can view staff profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_can_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "school_managers_can_view_school_profiles" ON public.profiles;

DROP POLICY IF EXISTS "user_login_details_select_own" ON public.user_login_details;
DROP POLICY IF EXISTS "user_login_details_insert_own" ON public.user_login_details;
DROP POLICY IF EXISTS "user_login_details_update_own" ON public.user_login_details;
DROP POLICY IF EXISTS "HR can view user_login_details in their school" ON public.user_login_details;
DROP POLICY IF EXISTS "HR can update user_login_details in their school" ON public.user_login_details;
DROP POLICY IF EXISTS "users_can_read_own_login_details" ON public.user_login_details;
DROP POLICY IF EXISTS "users_can_insert_own_login_details" ON public.user_login_details;
DROP POLICY IF EXISTS "users_can_update_own_login_details" ON public.user_login_details;

-- Step 3: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_details ENABLE ROW LEVEL SECURITY;

-- Step 4: Create minimal, non-recursive policies
-- Users can always access their own profile
CREATE POLICY "basic_profile_access"
ON public.profiles FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can always access their own login details
CREATE POLICY "basic_login_details_access"
ON public.user_login_details FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 5: Create HR user for testing
DO $$
DECLARE
    hr_user_id UUID;
    first_school_id UUID;
    hr_profile_exists BOOLEAN;
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
        INSERT INTO public.profiles (id, email, name, role, school_id, status, created_at, updated_at)
        VALUES (hr_user_id, 'hr@edufam.com', 'HR Manager', 'hr', first_school_id, 'active', now(), now());
        RAISE NOTICE 'Created HR profile in profiles table';
    ELSE
        -- Update existing HR profile to ensure it's correct
        UPDATE public.profiles 
        SET 
            email = 'hr@edufam.com',
            name = 'HR Manager',
            role = 'hr',
            school_id = first_school_id,
            status = 'active',
            updated_at = now()
        WHERE id = hr_user_id;
        
        RAISE NOTICE 'Updated existing HR profile';
    END IF;
    
    -- Ensure user_login_details exists for HR user
    IF NOT EXISTS (SELECT 1 FROM public.user_login_details WHERE user_id = hr_user_id) THEN
        INSERT INTO public.user_login_details (
            user_id, 
            role, 
            access_level,
            employee_id,
            department,
            login_attempts,
            is_locked,
            locked_until,
            last_login,
            created_at,
            updated_at
        ) VALUES (
            hr_user_id,
            'hr',
            2, -- HR has access level 2
            'EMP' || EXTRACT(EPOCH FROM now())::TEXT,
            'Human Resources',
            0,
            false,
            NULL,
            NULL,
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