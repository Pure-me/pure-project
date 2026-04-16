import { NextRequest, NextResponse } from 'next/server';
import { register, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Alle velden zijn verplicht' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Wachtwoord moet minstens 6 tekens zijn' }, { status: 400 });
    }
    const result = await register(name, email, password);
    if (!result || result.error) {
      return NextResponse.json({ error: result?.error || 'Dit e-mailadres is al geregistreerd' }, { status: 409 });
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
