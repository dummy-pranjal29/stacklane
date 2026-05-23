"use client";

import { useEffect, useState } from "react";

import axios from "axios";

type Analytics = {
  totalSpend: number;

  recurringSpend: number;

  currencyBreakdown: Record<string, number>;

  vendorBreakdown: Record<string, number>;

  categoryBreakdown: Record<string, number>;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await axios.get("/api/analytics");

        setAnalytics(response.data.analytics);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-6">Failed to load analytics</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Financial Analytics</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-xl p-4">
          <h2 className="text-sm text-gray-500">Total Spend</h2>

          <p className="text-2xl font-bold">{analytics.totalSpend}</p>
        </div>

        <div className="border rounded-xl p-4">
          <h2 className="text-sm text-gray-500">Recurring Spend</h2>

          <p className="text-2xl font-bold">{analytics.recurringSpend}</p>
        </div>
      </div>

      <div className="border rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Vendor Breakdown</h2>

        <div className="space-y-2">
          {Object.entries(analytics.vendorBreakdown).map(([vendor, amount]) => (
            <div key={vendor} className="flex justify-between">
              <span>{vendor}</span>

              <span>{amount}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>

        <div className="space-y-2">
          {Object.entries(analytics.categoryBreakdown).map(
            ([category, amount]) => (
              <div key={category} className="flex justify-between">
                <span>{category}</span>

                <span>{amount}</span>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="border rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">Currency Breakdown</h2>

        <div className="space-y-2">
          {Object.entries(analytics.currencyBreakdown).map(
            ([currency, amount]) => (
              <div key={currency} className="flex justify-between">
                <span>{currency}</span>

                <span>{amount}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
