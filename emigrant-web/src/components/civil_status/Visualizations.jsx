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
  Label,
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

// Custom Legend Renderer
const renderCustomLegend = (props) => {
  const { payload } = props;
  
  return (
    <div style={{ textAlign: 'center', paddingTop: '10px' }}>
      <div style={{ 
        fontSize: '12px',  
        color: '#374151',
        marginBottom: '8px',
        textAlign: 'left'
      }}>
        Civil Status:
      </div>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '6px 12px',
        fontSize: '11px'
      }}>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <div style={{ 
              width: '20px', 
              height: '5px', 
              backgroundColor: entry.color,
              borderRadius: '1px'
            }} />
            <span style={{ color: '#374151' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
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
      <h3 className="text-xl font-bold mb-6 text-gray-800">Civil Status Visualizations</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stacked Bar Chart */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h4 className="font-semibold mb-4 text-gray-700">Stacked Bar Chart (Yearly Composition)</h4>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10 }}
                height={50}
              >
                <Label 
                  value="Year" 
                  offset={-5} 
                  position="insideBottom" 
                  style={{ fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
                />
              </XAxis>
              <YAxis tick={{ fontSize: 10 }}>
                <Label 
                  value="Number of Emigrants" 
                  angle={-90} 
                  position="insideLeft" 
                  style={{ textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
                  offset={5}
                />
              </YAxis>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '11px'
                }}
              />
              <Legend content={renderCustomLegend} />
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
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h4 className="font-semibold mb-4 text-gray-700">Line Chart by Category</h4>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10 }}
                height={50}
              >
                <Label 
                  value="Year" 
                  offset={-5} 
                  position="insideBottom" 
                  style={{ fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
                />
              </XAxis>
              <YAxis tick={{ fontSize: 10 }}>
                <Label 
                  value="Number of Emigrants" 
                  angle={-90} 
                  position="insideLeft" 
                  style={{ textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
                  offset={5}
                />
              </YAxis>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '11px'
                }}
              />
              <Legend content={renderCustomLegend} />
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