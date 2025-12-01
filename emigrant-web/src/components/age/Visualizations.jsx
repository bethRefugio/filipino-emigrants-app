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
  Cell,
  Label
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

// Custom Tooltip Component for Line Chart
const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: '160px',
        maxWidth: '200px',
        zIndex: 1000,
        position: 'relative'
      }}>
        <p style={{ 
          fontWeight: 'bold', 
          marginBottom: '6px', 
          fontSize: '11px',
          color: '#1f2937',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '4px'
        }}>
          Year: {label}
        </p>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '4px 8px',
          fontSize: '10px'
        }}>
          {payload
            .filter(entry => entry.value > 0)
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => (
              <React.Fragment key={index}>
                <span style={{ color: entry.color, fontWeight: '500' }}>
                  {entry.name}:
                </span>
                <span style={{ fontWeight: 'bold', color: '#374151', textAlign: 'right' }}>
                  {entry.value.toLocaleString()}
                </span>
              </React.Fragment>
            ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Legend Renderer
const renderCustomLegend = (props) => {
  const { payload } = props;
  
  return (
    <div style={{ paddingTop: '10px' }}>
      <div style={{ 
        fontSize: '12px', 
        fontWeight: 'bold', 
        color: '#374151',
        marginBottom: '8px'
      }}>
        Age Group
      </div>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: '8px 16px',
        fontSize: '11px'
      }}>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
      <h3 className="text-xl font-bold mb-6 text-gray-800">Age Group Visualizations</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vertical Bar Chart for Grand Totals */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h4 className="font-semibold mb-4 text-gray-700">Total Emigrants by Age Group</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={grandTotals}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                dataKey="category" 
                type="category" 
                tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} 
                interval={0}
                height={60}
              >
                <Label 
                  value="Age Group" 
                  offset={-5} 
                  position="insideBottom" 
                  style={{ fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
                />
              </XAxis>
              <YAxis type="number" tick={{ fontSize: 12 }}>
                <Label 
                  value="Number of Emigrants" 
                  angle={-90} 
                  position="insideLeft" 
                  style={{ textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
                  offset={5}
                />
              </YAxis>
              <Tooltip
                formatter={(value) => value.toLocaleString()}
                labelFormatter={(label) => label}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Bar dataKey="value" isAnimationActive={false} radius={[3, 3, 0, 0]}>
                {grandTotals.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Line Chart (Trends by Category) */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h4 className="font-semibold mb-4 text-gray-700">Line Chart by Age Group</h4>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart 
              data={
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
              }
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
              <Tooltip content={<CustomLineTooltip />} />
              <Legend content={renderCustomLegend} />
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