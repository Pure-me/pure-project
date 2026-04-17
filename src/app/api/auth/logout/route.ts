import { NextResponse } from 'next/server';
import { signOut } from '@/lib/auth';

export async function POST() {
  try {
    await signOut();
  } catch {
    // signOut can fail if session already expired — that's fine
  }
  return NextResponse.json({ success: true });
}
