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
  Cell
} from "recharts";

const AGE_COLORS = {
   '14-below': "#e6194b",     // Red
  '15-19': "#3cb44b",        // Green
  '20-24': "#ffe119",        // Yellow
  '25-29': "#4363d8",        // Blue
  '30-34': "#f58231",        // Orange
  '35-39': "#911eb4",        // Purple
  '40-44': "#46f0f0",        // Cyan
  '45-49': "#f032e6",        // Magenta
  '50-54': "#bcf60c",        // Lime
  '55-59': "#fabebe",        // Pink
  '60-64': "#008080",        // Teal
  '65-69': "#e6beff",        // Lavender
  '70-above': "#9a6324",     // Brown
  notReported: "#ffae00ff",  
};

const AGE_LABELS = {
  '14-below': "14-below",
  '15-19': "15-19",
  '20-24': "20-24",
  '25-29': "25-29",
  '30-34': "30-34",
  '35-39': "35-39",
  '40-44': "40-44",
  '45-49': "45-49",
  '50-54': "50-54",
  '55-59': "55-59",
  '60-64': "60-64",
  '65-69': "65-69",
  '70-above': "70-above",
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
    Object.keys(AGE_LABELS).forEach((cat) => {
      entry[cat] = yearData.reduce((sum, e) => sum + (e[cat] || 0), 0);
    });
    return entry;
  });

  // Only show selected categories
  const visibleCategories = selectedCategories && selectedCategories.length > 0
    ? selectedCategories
    : Object.keys(AGE_LABELS);

  const grandTotals = visibleCategories.map((cat) => ({
    category: AGE_LABELS[cat],
    value: data.reduce((sum, e) => sum + (e[cat] || 0), 0),
    color: AGE_COLORS[cat] || "#8884d8",
  }));

  return (
    <div className="mt-0.2 px-6 pb-10">
      <h3 className="text-lg font-semibold mb-4">Age Group Visualizations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vertical Bar Chart for Grand Totals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h4 className="font-semibold mb-2">Total Emigrants by Age Group</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={grandTotals}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <XAxis 
                dataKey="category" 
                type="category" 
                tick={{ fontSize: 14, angle: -30, dy: 20 }} 
                interval={0}
              />
              <YAxis type="number" />
              <Tooltip
                formatter={(value) => value.toLocaleString()}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="value" isAnimationActive={false}>
                {grandTotals.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Line Chart (Trends by Category) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h4 className="font-semibold mb-2">Line Chart by Age Group</h4>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={
              // Prepare data for line chart: group by year, sum each category
              [...new Set(data.map((e) => e.year).filter((y) => y !== undefined && y !== null))]
                .sort((a, b) => a - b)
                .map((year) => {
                  const yearData = data.filter((e) => e.year === year);
                  const entry = { year: String(year) };
                  Object.keys(AGE_LABELS).forEach((cat) => {
                    entry[cat] = yearData.reduce((sum, e) => sum + (e[cat] || 0), 0);
                  });
                  return entry;
                })
            }>
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
                  stroke={AGE_COLORS[cat] || "#8884d8"}
                  name={AGE_LABELS[cat]}
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