import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
  Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
  authorize: async (credentials) => {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: { signIn: "/auth/login" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
  async jwt({ token, user }) {
      if (user) {
    // add id to token on login
    (token as JWT & { id?: string }).id = (user as { id?: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const id = (token as JWT & { id?: string }).id;
        if (id) {
          (session.user as typeof session.user & { id: string }).id = id;
        }
      }
      return session;
    },
  },
};
