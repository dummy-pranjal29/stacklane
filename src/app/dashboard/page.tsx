"use client";

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
    </div>
  );
}
