-- PHASE 1: Complete Rebuild of HR Role Database Foundation
-- This is a forensic, deep-dive rebuild to fix HR login failures

-- 1. Clean up and rebuild CHECK constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_roles;  
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS role_must_be_lowercase;

-- Create the definitive, single role constraint including HR
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY[
    'school_director'::text, 
    'principal'::text, 
    'teacher'::text, 
    'parent'::text, 
    'finance_officer'::text, 
    'hr'::text
]));

-- 2. Fix the critical RLS policies that are blocking HR login
-- The current "profiles_select_own" policy is too restrictive for auth flows

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

-- Create comprehensive RLS policies that support HR users
CREATE POLICY "Enable users to read their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Enable users to insert their own profile"  
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable users to update their own profile"
ON public.profiles FOR UPDATE  
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- HR and school directors can view staff profiles in their school
CREATE POLICY "HR can view school staff profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() != id AND 
  EXISTS (
    SELECT 1 FROM public.profiles requester 
    WHERE requester.id = auth.uid() 
    AND requester.role IN ('hr', 'school_director', 'principal')
    AND requester.school_id = profiles.school_id
  )
);

-- 3. Fix school assignment constraints for HR
-- HR users MUST have school assignment
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_school_assignment_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_school_assignment_check 
CHECK (
  -- All school roles require school_id (no exceptions for HR)
  (role IN ('school_director', 'principal', 'teacher', 'parent', 'finance_officer', 'hr') AND school_id IS NOT NULL)
);

-- 4. Ensure HR user has correct password hash
UPDATE auth.users 
SET encrypted_password = crypt('HRPassword123!', gen_salt('bf'))
WHERE email = 'hr@edufam.com';

-- 5. Verify HR user profile is correctly set up
UPDATE public.profiles
SET 
  role = 'hr',
  status = 'active',
  name = 'HR Manager',
  updated_at = now()
WHERE email = 'hr@edufam.com';

-- 6. Test the setup with a validation query
DO $$
DECLARE
    hr_check record;
BEGIN
    -- Validate HR user setup
    SELECT 
        au.id,
        au.email,
        au.encrypted_password IS NOT NULL as has_password,
        au.email_confirmed_at IS NOT NULL as email_confirmed,
        p.role,
        p.name,
        p.school_id,
        p.status
    INTO hr_check
    FROM auth.users au
    JOIN public.profiles p ON au.id = p.id
    WHERE au.email = 'hr@edufam.com';
    
    IF hr_check.id IS NULL THEN
        RAISE EXCEPTION 'CRITICAL: HR user not found or profile missing';
    END IF;
    
    IF hr_check.role != 'hr' THEN
        RAISE EXCEPTION 'CRITICAL: HR user role is %, expected hr', hr_check.role;
    END IF;
    
    IF hr_check.school_id IS NULL THEN
        RAISE EXCEPTION 'CRITICAL: HR user missing school assignment';
    END IF;
    
    IF hr_check.status != 'active' THEN
        RAISE EXCEPTION 'CRITICAL: HR user status is %, expected active', hr_check.status;
    END IF;
    
    RAISE NOTICE 'SUCCESS: HR user validation passed - ID: %, Role: %, School: %, Status: %', 
        hr_check.id, hr_check.role, hr_check.school_id, hr_check.status;
END $$;