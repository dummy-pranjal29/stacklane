"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

type User = {
  name?: string;
  email: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/auth/me");

        setUser(response.data.user);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {user ? (
        <div className="mt-4 space-y-2">
          <p>Welcome, {user.name}</p>

          <p>{user.email}</p>
        </div>
      ) : (
        <p className="mt-4">Loading user...</p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link className="border rounded-lg p-4" href="/dashboard/upload">
          <div className="font-semibold">Upload</div>

          <div className="mt-2 text-sm text-gray-600">
            Ingest financial source files.
          </div>
        </Link>

        <Link className="border rounded-lg p-4" href="/dashboard/analytics">
          <div className="font-semibold">Analytics</div>

          <div className="mt-2 text-sm text-gray-600">
            Review deterministic spend metrics.
          </div>
        </Link>

        <Link className="border rounded-lg p-4" href="/dashboard/ingestion">
          <div className="font-semibold">Ingestion Audit</div>

          <div className="mt-2 text-sm text-gray-600">
            Inspect batch status and evidence coverage.
          </div>
        </Link>
      </div>
    </div>
  );
}
