import { NextRequest, NextResponse } from 'next/server';
import { login, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail en wachtwoord zijn verplicht' }, { status: 400 });
    }
    const result = await login(email, password);
    if (!result || result.error) {
      return NextResponse.json({ error: result?.error || 'Onjuiste inloggegevens' }, { status: 401 });
    }
    const { user } = result;
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
