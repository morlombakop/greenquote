"use client"; // Error components must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 🚀 Send the error to your logging API or an external service here
    console.error("Client-side crash caught:", error);
  }, [error]);

  return (
    <div className="p-6 text-center space-y-4">
      <h2 className="text-xl font-bold text-red-600">Something went wrong!</h2>
      <button 
        onClick={() => reset()} 
        className="bg-gray-800 text-white px-4 py-2 rounded"
      >
        Try again
      </button>
    </div>
  );
}
