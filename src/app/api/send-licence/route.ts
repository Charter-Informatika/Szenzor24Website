import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaDB';
import { sendEmail } from '@/lib/email';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      console.error('Not authenticated:', session);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const email = session.user.email;
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch (dbErr) {
      console.error('DB error:', dbErr);
      return NextResponse.json({ error: 'DB error', details: String(dbErr) }, { status: 500 });
    }
    if (!user || !user.licence) {
      console.error('Licence not found for user:', email, user);
      return NextResponse.json({ error: 'Licence not found' }, { status: 404 });
    }
    try {
      await sendEmail({
        to: email,
        subject: 'Az Ön licensz kódja',
        html: `<p>Kedves felhasználó!</p><p>Az Ön licensz kódja: <b>${user.licence}</b></p>`
      });
    } catch (mailErr) {
      console.error('Email sending error:', mailErr);
      return NextResponse.json({ error: 'Email sending error', details: String(mailErr) }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Unknown server error:', e);
    return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 });
  }
}
