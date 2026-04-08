import ResetPassword from "@/components/Auth/ResetPassword";
import { prisma } from "@/lib/prismaDB";
import { redirect } from "next/navigation";

type PropsType = {
  params: Promise<{ token: string }>;
};

const verifyToken = async (token: string) => {
  if (!token) throw new Error("Hiányzó token");

  const user = await prisma.user.findUnique({
    where: {
      passwordResetToken: token,
      passwordResetTokenExp: {
        gte: new Date(), 
      },
    },
  });

  if (!user) {
    throw new Error("Érvénytelen vagy lejárt token");
  }

  return user.email;
};

export default async function Page(props: PropsType) {
  const params = await props.params;

  let userEmail;

  try {
    userEmail = await verifyToken(params.token);
  } catch (error) {
    redirect("/auth/forget-password?error=invalid_token");
  }

  return <ResetPassword userEmail={userEmail} />;
}