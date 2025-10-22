import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const CIVIL_STATUS_COLORS = {
  single: "#60a5fa", // blue-400
  married: "#34d399", // green-400
  widower: "#fbbf24", // yellow-400
  separated: "#f87171", // red-400
  divorced: "#a78bfa", // purple-400
  notReported: "#9ca3af", // gray-400
};

const CIVIL_STATUS_LABELS = {
  single: "Single",
  married: "Married",
  widower: "Widower",
  separated: "Separated",
  divorced: "Divorced",
  notReported: "Not Reported",
};

export default function Visualizations({ data, selectedCategories }) {
  // Prepare data for charts: group by year, sum each category
  const years = [
    ...new Set(data.map((e) => e.year).filter((y) => y !== undefined && y !== null)),
  ].sort((a, b) => a - b);

  const chartData = years.map((year) => {
    const yearData = data.filter((e) => e.year === year);
    const entry = { year: String(year) };
    Object.keys(CIVIL_STATUS_LABELS).forEach((cat) => {
      entry[cat] = yearData.reduce((sum, e) => sum + (e[cat] || 0), 0);
    });
    return entry;
  });

  // Only show selected categories
  const visibleCategories = selectedCategories && selectedCategories.length > 0
    ? selectedCategories
    : Object.keys(CIVIL_STATUS_LABELS);

  return (
    <div className="mt-0.2 px-6 pb-10">
      <h3 className="text-lg font-semibold mb-4">Civil Status Visualizations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stacked Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h4 className="font-semibold mb-2">Stacked Bar Chart (Yearly Composition)</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              {visibleCategories.map((cat) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  stackId="a"
                  fill={CIVIL_STATUS_COLORS[cat] || "#8884d8"}
                  name={CIVIL_STATUS_LABELS[cat]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h4 className="font-semibold mb-2">Line Chart by Category</h4>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              {visibleCategories.map((cat) => (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={CIVIL_STATUS_COLORS[cat] || "#8884d8"}
                  name={CIVIL_STATUS_LABELS[cat]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}