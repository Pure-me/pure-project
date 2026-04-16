/**
 * Pure Project — Authentication Layer
 * ─────────────────────────────────────
 * Uses Supabase Auth for session management.
 * Server-side only (uses cookies).
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User } from './db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createAuthClient() {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        const cookieStore = await cookies();
        return cookieStore.getAll();
      },
      async setAll(cookiesToSet) {
        const cookieStore = await cookies();
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}

export async function getSession(): Promise<User | null> {
  try {
    const client = createAuthClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return null;

    // Fetch profile from profiles table
    const { supabaseAdmin } = await import('./supabase');
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id as string,
      name: profile.name as string,
      email: profile.email as string,
      passwordHash: '',
      role: profile.role as User['role'],
      avatar: profile.avatar_url as string | undefined,
      language: (profile.language as 'nl' | 'en') || 'nl',
      createdAt: profile.created_at as string,
    };
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string): Promise<{ user: User; error?: string } | null> {
  try {
    const client = createAuthClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { user: null as unknown as User, error: error?.message || 'Login mislukt' };

    const session = await getSession();
    if (!session) return null;
    return { user: session };
  } catch (e) {
    return { user: null as unknown as User, error: String(e) };
  }
}

export async function signOut(): Promise<void> {
  const client = createAuthClient();
  await client.auth.signOut();
}

export async function signUp(email: string, password: string, name: string, role: User['role'] = 'member'): Promise<{ user: User; error?: string } | null> {
  try {
    const client = createAuthClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error || !data.user) return { user: null as unknown as User, error: error?.message || 'Registratie mislukt' };
    const session = await getSession();
    if (!session) return { user: { id: data.user.id, name, email, passwordHash: '', role, createdAt: new Date().toISOString() } };
    return { user: session };
  } catch (e) {
    return { user: null as unknown as User, error: String(e) };
  }
}

// Legacy exports kept for backward-compat
export const COOKIE_NAME = 'sb-session';

export async function hashPassword(password: string): Promise<string> {
  // In Supabase mode, Supabase handles password hashing
  return password;
}

export async function login(email: string, password: string) {
  return signIn(email, password);
}

export async function register(name: string, email: string, password: string) {
  return signUp(email, password, name, 'admin');
}
