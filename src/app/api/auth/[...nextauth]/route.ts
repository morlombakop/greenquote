import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma"; 

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials payload");
        }

        // Fetch user records from your SQLite/Postgres database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error("Invalid login credentials provided");
        }

        // Compare the submitted password against the hashed database value
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid login credentials provided");
        }

        const role = user.role === "ADMIN" ? "ADMIN" : "USER";

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
        };
      }
    })
  ],
  callbacks: {
    // Inject the user role and ID directly into the encrypted JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Make the role and ID properties accessible to frontend components and server hooks
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt", // Cookie-based encrypted session tracking
    maxAge: 24 * 60 * 60, // 1 Day session expiry
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Custom sign-in landing point redirection
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
