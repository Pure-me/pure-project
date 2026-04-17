-- 003: handle_new_user trigger inclusief subscription defaults
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role, subscription_status, trial_ends_at, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    'trialing',
    NOW() + INTERVAL '14 days',
    'solo'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
