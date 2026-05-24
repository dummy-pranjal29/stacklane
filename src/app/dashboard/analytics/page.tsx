"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

import axios from "axios";

const COLORS = ["#00C49F", "#0088FE", "#FFBB28", "#FF8042", "#A855F7"];

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
  const [aiInsights, setAiInsights] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const categoryData = analytics
    ? Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const vendorData = analytics
    ? Object.entries(analytics.vendorBreakdown).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await axios.get("/api/analytics");

        setAnalytics(response.data.analytics);
        setAiLoading(true);

        const aiResponse = await axios.get("/api/ai-insights");

        setAiLoading(false);

        setAiInsights(aiResponse.data.insights);
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
      <div className="border rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4">AI Financial Insights</h2>

        <div className="border border-blue-500/30 bg-blue-500/10 rounded-lg p-4 whitespace-pre-wrap text-sm leading-7">
          {aiLoading ? (
            <div className="space-y-3 animate-pulse">
              <div>Reading verified spend totals...</div>

              <div>Checking vendor and category concentration...</div>

              <div>Reviewing recurring spend metric...</div>

              <div>Preparing evidence-bounded summary...</div>
            </div>
          ) : (
            aiInsights
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border rounded-xl p-4 h-[400px]">
          <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border rounded-xl p-4 h-[400px]">
          <h2 className="text-xl font-semibold mb-4">Vendor Spend</h2>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vendorData}>
              <XAxis dataKey="name" stroke="#d1d5db" />

              <YAxis stroke="#d1d5db" />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  color: "#fff",
                }}
              />

              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
