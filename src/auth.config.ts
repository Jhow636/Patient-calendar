import type { NextAuthConfig } from "next-auth";

// Configuração "leve", sem Prisma/bcrypt, para poder rodar no Edge Runtime do middleware.
// A configuração completa (com o provider de credenciais) fica em src/auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.papel = (user as { papel?: string }).papel;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.papel = token.papel as string;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
