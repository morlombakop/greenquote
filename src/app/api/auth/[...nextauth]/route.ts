import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import { logger } from '@/lib/logger'; // Mapped to your structured logger engine
import { type Role } from '@/types/next-auth';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 Days session lifecycle
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.warn(
            {},
            'Auth pipeline halted: Missing email or password strings.'
          );
          return null;
        }

        // 🕵️‍♂️ Trace authentication intent safely (Context Object first, Message String second)
        logger.info(
          { email: credentials.email },
          'NextAuth database user verification lookup matching identity.'
        );

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            logger.warn(
              { email: credentials.email },
              'Auth failed: Identity record not found in persistence layer.'
            );
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            logger.warn(
              { email: credentials.email },
              'Auth failed: Invalid cryptographic password match.'
            );
            return null;
          }

          logger.info(
            { userId: user.id, role: user.role },
            'User identity validated. Access Token generation initiated.'
          );

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as unknown as Role,
          };
        } catch (error) {
          if (error instanceof Error) {
            logger.error(
              {
                email: credentials.email,
                errorMessage: error.message,
                errorStack: error.stack,
              },
              'Critical crash inside credential authorizing runtime pipeline.'
            );
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  // Overriding internal framework logging to match our structural parameters schema
  logger: {
    error(code, metadata) {
      logger.error(
        { frameworkCode: code, internalMeta: metadata },
        'NextAuth Framework Core Error caught.'
      );
    },
    warn(code) {
      logger.warn(
        { frameworkCode: code },
        'NextAuth Framework Core Warning triggered.'
      );
    },
    debug(code, metadata) {
      logger.info(
        { frameworkCode: code, internalMeta: metadata },
        'NextAuth Framework Diagnostic Trace recorded.'
      );
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
