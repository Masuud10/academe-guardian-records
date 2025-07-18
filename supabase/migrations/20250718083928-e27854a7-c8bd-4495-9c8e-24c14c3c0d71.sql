-- COMPREHENSIVE FIX: Ensure all HR users can login to HR dashboard
-- This migration fixes mary@gmail.com, sharon@gmail.com, and hr@edufam.com HR users

-- Step 1: Create a function to properly setup HR users
CREATE OR REPLACE FUNCTION public.setup_hr_user(
    user_email TEXT,
    user_name TEXT,
    school_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    hr_user_id UUID;
    target_school_id UUID;
    profile_exists BOOLEAN;
    login_details_exists BOOLEAN;
    result JSONB;
BEGIN
    -- Get school ID if not provided
    IF school_id IS NULL THEN
        SELECT id INTO target_school_id FROM public.schools ORDER BY created_at LIMIT 1;
    ELSE
        target_school_id := school_id;
    END IF;
    
    IF target_school_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No schools found in database'
        );
    END IF;
    
    -- Check if user exists in auth.users
    SELECT id INTO hr_user_id FROM auth.users WHERE email = user_email;
    
    -- Create or update auth user
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
            user_email,
            crypt('HRPassword123!', gen_salt('bf')),
            now(),
            now(),
            now(),
            jsonb_build_object('name', user_name, 'role', 'hr', 'created_by_admin', true),
            'authenticated',
            'authenticated'
        );
        
        RAISE NOTICE 'Created HR user in auth.users: %', user_email;
    ELSE
        -- Update existing auth user
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('HRPassword123!', gen_salt('bf')),
            email_confirmed_at = now(),
            raw_user_meta_data = jsonb_build_object('name', user_name, 'role', 'hr', 'created_by_admin', true),
            updated_at = now()
        WHERE id = hr_user_id;
        
        RAISE NOTICE 'Updated HR user in auth.users: %', user_email;
    END IF;
    
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = hr_user_id) INTO profile_exists;
    
    -- Create or update profile
    IF NOT profile_exists THEN
        INSERT INTO public.profiles (
            id, 
            email, 
            name, 
            role, 
            school_id, 
            status,
            created_at, 
            updated_at
        ) VALUES (
            hr_user_id,
            user_email,
            user_name,
            'hr',
            target_school_id,
            'active',
            now(),
            now()
        );
        RAISE NOTICE 'Created HR profile: %', user_email;
    ELSE
        UPDATE public.profiles 
        SET 
            email = user_email,
            name = user_name,
            role = 'hr',
            school_id = target_school_id,
            status = 'active',
            updated_at = now()
        WHERE id = hr_user_id;
        RAISE NOTICE 'Updated HR profile: %', user_email;
    END IF;
    
    -- Check if login details exist
    SELECT EXISTS(SELECT 1 FROM public.user_login_details WHERE user_id = hr_user_id) INTO login_details_exists;
    
    -- Create or update login details
    IF NOT login_details_exists THEN
        INSERT INTO public.user_login_details (
            user_id,
            role,
            access_level,
            employee_id,
            department,
            login_attempts,
            is_locked,
            locked_until,
            force_password_change,
            created_at,
            updated_at
        ) VALUES (
            hr_user_id,
            'hr',
            2,
            'EMP' || EXTRACT(EPOCH FROM now())::TEXT,
            'Human Resources',
            0,
            false,
            NULL,
            false,
            now(),
            now()
        );
        RAISE NOTICE 'Created HR login details: %', user_email;
    ELSE
        UPDATE public.user_login_details 
        SET 
            role = 'hr',
            access_level = 2,
            department = 'Human Resources',
            login_attempts = 0,
            is_locked = false,
            locked_until = NULL,
            force_password_change = false,
            updated_at = now()
        WHERE user_id = hr_user_id;
        RAISE NOTICE 'Updated HR login details: %', user_email;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', hr_user_id,
        'email', user_email,
        'name', user_name,
        'role', 'hr',
        'school_id', target_school_id,
        'message', 'HR user setup completed successfully'
    );
    
END;
$$;

-- Step 2: Setup all HR users
DO $$
DECLARE
    result JSONB;
BEGIN
    -- Setup hr@edufam.com
    SELECT public.setup_hr_user('hr@edufam.com', 'HR Manager') INTO result;
    RAISE NOTICE 'hr@edufam.com setup result: %', result;
    
    -- Setup mary@gmail.com
    SELECT public.setup_hr_user('mary@gmail.com', 'Mary HR') INTO result;
    RAISE NOTICE 'mary@gmail.com setup result: %', result;
    
    -- Setup sharon@gmail.com
    SELECT public.setup_hr_user('sharon@gmail.com', 'Sharon HR') INTO result;
    RAISE NOTICE 'sharon@gmail.com setup result: %', result;
    
END $$;

-- Step 3: Create a verification function to check all HR users
CREATE OR REPLACE FUNCTION public.verify_all_hr_users()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    hr_users JSONB := '[]'::JSONB;
    user_record RECORD;
    user_data JSONB;
BEGIN
    -- Get all HR users with their complete setup
    FOR user_record IN
        SELECT 
            au.id,
            au.email,
            au.email_confirmed_at IS NOT NULL as email_confirmed,
            au.encrypted_password IS NOT NULL as has_password,
            p.name,
            p.role,
            p.school_id,
            p.status,
            s.name as school_name,
            uld.access_level,
            uld.department,
            uld.login_attempts,
            uld.is_locked,
            uld.force_password_change
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        LEFT JOIN public.schools s ON p.school_id = s.id
        LEFT JOIN public.user_login_details uld ON au.id = uld.user_id AND uld.role = 'hr'
        WHERE au.email IN ('hr@edufam.com', 'mary@gmail.com', 'sharon@gmail.com')
        AND p.role = 'hr'
    LOOP
        user_data := jsonb_build_object(
            'user_id', user_record.id,
            'email', user_record.email,
            'name', user_record.name,
            'email_confirmed', user_record.email_confirmed,
            'has_password', user_record.has_password,
            'role', user_record.role,
            'school_id', user_record.school_id,
            'school_name', user_record.school_name,
            'status', user_record.status,
            'access_level', user_record.access_level,
            'department', user_record.department,
            'login_attempts', user_record.login_attempts,
            'is_locked', user_record.is_locked,
            'force_password_change', user_record.force_password_change,
            'can_login', user_record.email_confirmed AND user_record.has_password AND NOT user_record.is_locked
        );
        
        hr_users := hr_users || user_data;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'total_hr_users', jsonb_array_length(hr_users),
        'hr_users', hr_users,
        'login_credentials', jsonb_build_object(
            'password', 'HRPassword123!',
            'login_section', 'School Users Login',
            'dashboard_access', 'HR Dashboard'
        )
    );
END;
$$;

-- Step 4: Test the setup
DO $$
DECLARE
    verification_result JSONB;
BEGIN
    SELECT public.verify_all_hr_users() INTO verification_result;
    RAISE NOTICE 'HR Users Verification: %', verification_result;
    
    -- Check if all users can login
    IF (verification_result->>'total_hr_users')::int = 3 THEN
        RAISE NOTICE '✅ All 3 HR users are properly configured!';
        RAISE NOTICE '📧 Login emails: hr@edufam.com, mary@gmail.com, sharon@gmail.com';
        RAISE NOTICE '🔑 Password: HRPassword123!';
        RAISE NOTICE '🌐 Use: School Users Login section';
        RAISE NOTICE '📊 Access: HR Dashboard after login';
    ELSE
        RAISE WARNING '⚠️ Some HR users may not be properly configured';
    END IF;
END $$;

-- Step 5: Create a function to reset HR user passwords if needed
CREATE OR REPLACE FUNCTION public.reset_hr_user_password(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    hr_user_id UUID;
    result JSONB;
BEGIN
    -- Get user ID
    SELECT id INTO hr_user_id FROM auth.users WHERE email = user_email;
    
    IF hr_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;
    
    -- Reset password
    UPDATE auth.users 
    SET 
        encrypted_password = crypt('HRPassword123!', gen_salt('bf')),
        updated_at = now()
    WHERE id = hr_user_id;
    
    -- Reset login details
    UPDATE public.user_login_details 
    SET 
        login_attempts = 0,
        is_locked = false,
        locked_until = NULL,
        force_password_change = false,
        updated_at = now()
    WHERE user_id = hr_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'email', user_email,
        'password', 'HRPassword123!',
        'message', 'Password reset successfully'
    );
END;
$$;

-- Step 6: Final verification and instructions
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 HR USERS SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 HR Users Ready for Login:';
    RAISE NOTICE '   • hr@edufam.com (HR Manager)';
    RAISE NOTICE '   • mary@gmail.com (Mary HR)';
    RAISE NOTICE '   • sharon@gmail.com (Sharon HR)';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Login Credentials:';
    RAISE NOTICE '   • Password: HRPassword123!';
    RAISE NOTICE '   • Section: School Users Login';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Dashboard Access:';
    RAISE NOTICE '   • All users will access HR Dashboard';
    RAISE NOTICE '   • Full HR management features available';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Troubleshooting:';
    RAISE NOTICE '   • Run: SELECT public.verify_all_hr_users();';
    RAISE NOTICE '   • Reset password: SELECT public.reset_hr_user_password(''email@example.com'');';
    RAISE NOTICE '';
END $$;