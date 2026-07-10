import React from 'react';
import { RegisterForm } from '@/app/register/components/RegisterForm';

export const metadata = {
  title: 'Create an Account | GreenQuote',
  description:
    'Get started with your custom solar layout quote evaluation pipeline.',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Get started with your solar quote evaluation
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
