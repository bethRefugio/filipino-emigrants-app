import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const SEX_COLORS = {
  male: "#60a5fa", // blue-400
  female: "#f87171", // pink-400
};

const SEX_LABELS = {
  male: "Male",
  female: "Female",
};

export default function Visualizations({ data, selectedCategories }) {
  // Prepare data for charts: group by year, sum each category
  const years = [
    ...new Set(data.map((e) => e.year).filter((y) => y !== undefined && y !== null)),
  ].sort((a, b) => a - b);

  const chartData = years.map((year) => {
    const yearData = data.filter((e) => e.year === year);
    const entry = { year: String(year) };
    Object.keys(SEX_LABELS).forEach((cat) => {
      entry[cat] = yearData.reduce((sum, e) => sum + (e[cat] || 0), 0);
    });
    return entry;
  });

  // Only show selected categories
  const visibleCategories = selectedCategories && selectedCategories.length > 0
    ? selectedCategories
    : Object.keys(SEX_LABELS);

  // Grand totals for male and female (all years)
  const grandTotals = Object.keys(SEX_LABELS).reduce((acc, cat) => {
    acc[cat] = data.reduce((sum, e) => sum + (e[cat] || 0), 0);
    return acc;
  }, {});

  // Donut chart data: grand totals for male and female
  const donutData = visibleCategories.map((cat) => ({
    name: SEX_LABELS[cat],
    value: grandTotals[cat] || 0,
    key: cat,
  }));

  return (
    <div className="mt-0.2 px-6 pb-10">
      <h3 className="text-lg font-semibold mb-4">Sex Visualizations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h4 className="font-semibold mb-2">
            Donut Chart (Grand Total)
          </h4>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
              >
                {donutData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={SEX_COLORS[entry.key] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h4 className="font-semibold mb-2">Line Chart (Trends by Category)</h4>
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
                  stroke={SEX_COLORS[cat] || "#8884d8"}
                  name={SEX_LABELS[cat]}
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