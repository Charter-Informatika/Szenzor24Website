import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ exists: false });
    }

    const user = await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase().trim() 
      },
      select: { 
        id: true
      }
    });

    return NextResponse.json({ exists: !!user });
    
  } catch (error) {
    console.error("Hiba az email ellenőrzésekor:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}