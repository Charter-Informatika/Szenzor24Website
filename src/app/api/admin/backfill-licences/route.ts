import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prismaDB'; // LICENCE DISABLED
// import { generateUniqueLicence } from '@/lib/licence'; // LICENCE DISABLED

export const runtime = 'nodejs';

// TEMP route to backfill licences for users still having placeholder value.
// Protect this in production (e.g., by checking an admin secret env variable)
// LICENCE DISABLED - entire route commented out
export async function POST() {
  return new NextResponse('Licence feature disabled', { status: 503 });
  // if (process.env.NODE_ENV === 'production') {
  //   return new NextResponse('Forbidden', { status: 403 });
  // }

  // const users = await prisma.user.findMany({ where: { licence: 'XXXXXXXXXXXXXXXX' } });
  // let updated = 0;
  // for (const u of users) {
  //   const licence = await generateUniqueLicence();
  //   await prisma.user.update({ where: { id: u.id }, data: { licence } });
  //   updated++;
  // }
  // return NextResponse.json({ updated });
}
