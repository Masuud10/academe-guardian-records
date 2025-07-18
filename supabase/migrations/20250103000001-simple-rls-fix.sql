-- SIMPLE FIX: Resolve infinite recursion in RLS policies
-- This is a minimal fix that just removes the problematic policies

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

-- Step 5: Create a simple function to test HR login
CREATE OR REPLACE FUNCTION public.test_hr_login()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    hr_user_id UUID;
    hr_profile record;
BEGIN
    -- Find HR user
    SELECT id INTO hr_user_id FROM auth.users WHERE email = 'hr@edufam.com';
    
    IF hr_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'HR user not found in auth.users'
        );
    END IF;
    
    -- Check profile
    SELECT * INTO hr_profile FROM public.profiles WHERE id = hr_user_id;
    
    IF hr_profile IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'HR profile not found'
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', hr_user_id,
        'email', hr_profile.email,
        'role', hr_profile.role,
        'school_id', hr_profile.school_id,
        'status', hr_profile.status
    );
END;
$$; 