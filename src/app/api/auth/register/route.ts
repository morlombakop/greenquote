import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { registrationSchema } from '@/lib/validations/registration';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registrationSchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;

      logger.warn(
        {
          path: '/api/auth/register',
          method: 'POST',
          errors: fieldErrors,
        },
        'Registration field validation constraints failed'
      );

      return NextResponse.json(
        { error: 'Invalid registration payload properties' },
        { status: 400 }
      );
    }

    const { fullName, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn(
        {
          path: '/api/auth/register',
          method: 'POST',
          conflictingEmail: email,
        },
        'Registration rejected: Email alias already registered'
      );

      return NextResponse.json(
        { error: 'User already exists with this email address' },
        { status: 409 }
      );
    }

    // Securely hash passwords before saving them
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role: 'USER',
      },
    });

    return NextResponse.json(
      { success: true, message: 'Account created successfully' },
      { status: 201 }
    );
  } catch (error) {
    logger.error(
      {
        path: '/api/auth/register',
        method: 'POST',
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      'Unhandled exception crash during user registration processing pipeline'
    );

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
