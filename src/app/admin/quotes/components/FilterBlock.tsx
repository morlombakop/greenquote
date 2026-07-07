"use client";

import React, { startTransition } from "react";
import { useRouter } from "next/navigation";

type UserOption = {
  id: string;
  name: string | null;
  email: string;
};

type FilterBlockProps = {
  searchQuery: string;
  selectedUserId: string;
  uniqueUsers: UserOption[];
};

export default function FilterBlock({
  searchQuery,
  selectedUserId,
  uniqueUsers,
}: FilterBlockProps) {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    const userId = formData.get("userId") as string;

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (userId) params.set("userId", userId);

    // Using startTransition allows Next.js to update the URL smoothly without full page flickering
    startTransition(() => {
      router.push(`/admin/quotes?${params.toString()}`);
    });
  };

  const handleClear = () => {
    startTransition(() => {
      router.push("/admin/quotes");
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        {/* Text Search Input */}
        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-xs font-semibold text-gray-700 mb-1"
          >
            Search Name / Email
          </label>
          <input
            type="text"
            name="search"
            id="search"
            defaultValue={searchQuery}
            placeholder="Search consumer or partner account..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
          />
        </div>

        {/* Dropdown Selection Filter */}
        <div className="w-full sm:w-64">
          <label
            htmlFor="userId"
            className="block text-xs font-semibold text-gray-700 mb-1"
          >
            Filter by Partner Account
          </label>
          <select
            name="userId"
            id="userId"
            defaultValue={selectedUserId}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 font-medium"
          >
            <option value="" className="text-gray-900">
              All Accounts
            </option>
            {uniqueUsers.map((u) => (
              <option key={u.id} value={u.id} className="text-gray-900">
                {u.name || u.email}
              </option>
            ))}
          </select>
        </div>

        {/* Form Actions */}
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            Filter
          </button>
          {(searchQuery || selectedUserId) && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md text-center transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
