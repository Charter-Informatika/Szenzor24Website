import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prismaDB";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return new NextResponse("Missing Fields", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return NextResponse.json("User not found", { status: 404 });
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const passwordResetTokenExp = new Date();
  passwordResetTokenExp.setHours(passwordResetTokenExp.getHours() + 1);

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      passwordResetToken: resetToken,
      passwordResetTokenExp,
    },
  });

  const resetURL = `${process.env.SITE_URL}/auth/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: ` 
      <div>
        <h1>You requested a password reset</h1>
        <p>Click the link below to reset your password</p>
        <a href="${resetURL}" target="_blank">Reset Password</a>
      </div>
      `,
    });

    return NextResponse.json("An email has been sent to your email", {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json("An error has occurred. Please try again!", {
      status: 500,
    });
  }
}
