import React, { Suspense } from 'react';
import LoginFormContent from './components/LoginFormContent';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Sign in to GreenQuote
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your active solar quotes pipeline
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">
                Loading credentials interface...
              </p>
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
