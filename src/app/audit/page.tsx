"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TOOLS_CONFIG,
  type SpendInput,
  type UseCase,
} from "@/lib/audit/engine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SpendAuditPage() {
  const router = useRouter();
  const [teamSize, setTeamSize] = useState<number>(5);
  const [useCase, setUseCase] = useState<UseCase>("coding");
  const [tools, setTools] = useState<SpendInput[]>([
    {
      toolId: "cursor",
      plan: "pro",
      currentMonthlySpend: 100,
      seats: 5,
      teamSize: 5,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("spend-audit-form");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTeamSize(data.teamSize || 5);
        setUseCase(data.useCase || "coding");
        setTools(data.tools || tools);
      } catch (e) {
        console.error("Failed to load saved form", e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(
      "spend-audit-form",
      JSON.stringify({ teamSize, useCase, tools }),
    );
  }, [teamSize, useCase, tools]);

  const addTool = () => {
    const toolIds = Object.keys(TOOLS_CONFIG) as Array<
      keyof typeof TOOLS_CONFIG
    >;
    const newTool: SpendInput = {
      toolId: toolIds[0],
      plan: "pro",
      currentMonthlySpend: 50,
      seats: 1,
      teamSize,
    };
    setTools([...tools, newTool]);
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const updateTool = (index: number, updates: Partial<SpendInput>) => {
    const newTools = [...tools];
    newTools[index] = { ...newTools[index], ...updates };
    setTools(newTools);
  };

  const handleRunAudit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tools,
          teamSize,
          useCase,
        }),
      });
      const data = await response.json();
      const resultId = data.id;
      router.push(`/results/${resultId}`);
    } catch (error) {
      console.error("Audit failed:", error);
      alert("Failed to run audit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Spend Audit
          </h1>
          <p className="text-xl text-gray-600">
            Find out where you're overspending on AI tools and unlock savings
          </p>
        </div>

        <Card className="bg-white shadow-lg rounded-2xl p-8">
          {/* Team Info Section */}
          <div className="mb-8 pb-8 border-b">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Your Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={teamSize}
                  onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Use Case
                </label>
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value as UseCase)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="coding">Coding</option>
                  <option value="writing">Writing</option>
                  <option value="data">Data Analysis</option>
                  <option value="research">Research</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tools Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Your AI Tools
            </h2>
            <div className="space-y-6">
              {tools.map((tool, index) => (
                <div
                  key={index}
                  className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tool
                      </label>
                      <select
                        value={tool.toolId}
                        onChange={(e) =>
                          updateTool(index, {
                            toolId: e.target.value as keyof typeof TOOLS_CONFIG,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(TOOLS_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan
                      </label>
                      <select
                        value={tool.plan}
                        onChange={(e) =>
                          updateTool(index, { plan: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(TOOLS_CONFIG[tool.toolId].plans).map(
                          ([key, plan]) => (
                            <option key={key} value={key}>
                              {plan.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seats
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tool.seats}
                        onChange={(e) =>
                          updateTool(index, {
                            seats: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Spend ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={tool.currentMonthlySpend}
                        onChange={(e) =>
                          updateTool(index, {
                            currentMonthlySpend:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeTool(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove Tool
                  </button>
                </div>
              ))}
            </div>
            <Button
              onClick={addTool}
              variant="outline"
              className="mt-4 w-full text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              + Add Another Tool
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleRunAudit}
              disabled={isLoading || tools.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold"
            >
              {isLoading ? "Running Audit..." : "Run Audit"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
