import { prisma } from "@/lib/prismaDB";
// import { generateUniqueLicence } from "@/lib/licence"; // LICENCE DISABLED
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import bcrypt from "bcrypt";

export const runtime = 'nodejs';

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  adapter: PrismaAdapter(prisma),
  // Use NEXTAUTH_SECRET (official var name). Previously referenced process.env.SECRET which was undefined in production and caused 500 errors.
  // You can also omit this line and NextAuth will automatically read NEXTAUTH_SECRET.
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(code, metadata) {
      console.error("[NextAuth][error]", code, metadata);
    },
    warn(code) {
      console.warn("[NextAuth][warn]", code);
    },
    debug(code, metadata) {
      // Avoid logging sensitive data
      if (process.env.NODE_ENV !== "production") {
        console.log("[NextAuth][debug]", code, metadata && Object.keys(metadata));
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {

      if (user) {
        token.id = user.id; // User ID hozzáadása a tokenhez
        token.licence = (user as any).licence;
        token.trialEnded = (user as any).trialEnded;
      }
      return token;
    },
    // Temporary: log signIn callback input for debugging
    async signIn({ user, account, profile, email, credentials }) {
      try {
        console.log("[NextAuth][callback][signIn]", {
          provider: account?.provider,
          providerType: account?.type,
          userId: user?.id ?? undefined,
          email: email ?? (user as any)?.email ?? undefined,
          profileKeys: profile ? Object.keys(profile) : undefined,
        });
      } catch (e) {
        console.error("[NextAuth][callback][signIn][log error]", e);
      }

      // allow sign in by default
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id; // User ID hozzáadása a session-höz
        session.user.licence = (token as any).licence;
        session.user.trialEnded = (token as any).trialEnded;
      }
      return session;
    },
  },
  events: {
    // Runs after a user is created by the adapter (OAuth / Email etc.)
    // LICENCE DISABLED - createUser event commented out
    // createUser: async ({ user }) => {
    //   try {
    //     if (!user.licence || user.licence === "XXXXXXXXXXXXXXXX") {
    //       const licence = await generateUniqueLicence();
    //       await prisma.user.update({
    //         where: { id: user.id },
    //         data: { licence },
    //       });
    //     }
    //   } catch (e) {
    //     console.error("Failed to assign licence to new user", e);
    //   }
    // },
    // Log sign-in events and NextAuth errors
    signIn: async ({ user, account, profile }) => {
      try {
        console.log("[NextAuth][event][signIn]", {
          userId: user?.id,
          provider: account?.provider,
        });
      } catch (e) {
        console.error("[NextAuth][event][signIn][log error]", e);
      }
    },
    error: async ({ error }) => {
      console.error("[NextAuth][event][error]", error);
    },
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Jhondoe" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text", placeholder: "Jhon Doe" },
      },

      async authorize(credentials) {
        // check to see if eamil and password is there
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email or password");
        }

        // check to see if user already exist
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // if user was not found
        if (!user || !user?.password) {
          throw new Error("No user found");
        }

        // check to see if passwords match
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return user;
      },
    }),

    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  // debug: process.env.NODE_ENV === "developement",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

