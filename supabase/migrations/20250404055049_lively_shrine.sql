/*
  # Fix test lender creation

  1. Changes
    - Properly declare user_id variable
    - Add proper error handling
    - Ensure user and profile are created correctly
*/

DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Create test user if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'lender@test.com'
  ) THEN
    -- Insert user and get their ID
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change_token_current,
      email_change_token_new,
      recovery_token,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'lender@test.com',
      crypt('lender123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '',
      '',
      '',
      '',
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{}'::jsonb,
      false
    ) RETURNING id INTO user_id;

    -- Create lender profile
    INSERT INTO lender_profiles (
      user_id,
      cpf,
      name,
      whatsapp,
      email
    ) VALUES (
      user_id,
      '123.456.789-00',
      'Lender Test',
      '(45) 99999-9999',
      'lender@test.com'
    );

    RAISE NOTICE 'Created test lender with ID: %', user_id;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating test lender: %', SQLERRM;
    RAISE;
END $$;