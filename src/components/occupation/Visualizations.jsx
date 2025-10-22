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

const OCCUPATION_COLORS = {
  professional_technical_related: "#60a5fa",
  managerial_executive_admin: "#34d399",
  clerical_workers: "#fbbf24",
  sales_workers: "#f87171",
  service_workers: "#a78bfa",
  agri_animal_forestry_fishermen: "#f472b6",
  production_transport_equipment_laborers: "#f59e42",
  armed_forces: "#6366f1",
  housewives: "#facc15",
  retirees: "#10b981",
  students: "#818cf8",
  minors_below_7: "#ed0f31ff",
  out_of_school_youth: "#d688b1ff",
  refugees: "#a3e635",
  no_occupation_reported: "#9ca3af",
};

const OCCUPATION_LABELS = {
  professional_technical_related: "Professional, Technical & Related Workers",
  managerial_executive_admin: "Managerial, Executive & Administrative Workers",
  clerical_workers: "Clerical Workers",
  sales_workers: "Sales Workers",
  service_workers: "Service Workers",
  agri_animal_forestry_fishermen: "Agri, Animal Husbandry, Forestry Workers & Fishermen",
  production_transport_equipment_laborers: "Production Process, Transport Equipment Operators & Laborers",
  armed_forces: "Members of the Armed Forces",
  housewives: "Housewives",
  retirees: "Retirees",
  students: "Students",
  minors_below_7: "Minors (Below 7)",
  out_of_school_youth: "Out-of-School Youth",
  refugees: "Refugees",
  no_occupation_reported: "No Occupation Reported",
};

export default function Visualizations({ data, selectedCategories }) {
  // Prepare data for charts: group by year, sum each category
  const years = [
    ...new Set(data.map((e) => e.year).filter((y) => y !== undefined && y !== null)),
  ].sort((a, b) => a - b);

  // Only show selected categories
  const visibleCategories = selectedCategories && selectedCategories.length > 0
    ? selectedCategories
    : Object.keys(OCCUPATION_LABELS);

  // Prepare data for 100% stacked bar chart by year
  const stackedBarData = years.map((year) => {
    const yearData = data.filter((e) => e.year === year);
    const entry = { year: String(year) };
    // Sum for each category
    let yearTotal = 0;
    visibleCategories.forEach((cat) => {
      entry[cat] = yearData.reduce((sum, e) => sum + (e[cat] || 0), 0);
      yearTotal += entry[cat];
    });
    // Convert to percent
    visibleCategories.forEach((cat) => {
      entry[cat] = yearTotal ? (entry[cat] / yearTotal) * 100 : 0;
    });
    return entry;
  });

  // Prepare data for line chart (absolute values)
  const chartData = years.map((year) => {
    const yearData = data.filter((e) => e.year === year);
    const entry = { year: String(year) };
    Object.keys(OCCUPATION_LABELS).forEach((cat) => {
      entry[cat] = yearData.reduce((sum, e) => sum + (e[cat] || 0), 0);
    });
    return entry;
  });
  

  return (
  <div className="mt-0.2 px-6 pb-10">
    <h3 className="text-lg font-semibold mb-4">Occupation Visualizations</h3>
    {/* 100% Stacked Bar Chart by Year */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
      <h4 className="font-semibold mb-2">
        100% Stacked Bar Chart by Year
      </h4>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={stackedBarData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <XAxis dataKey="year" />
          <YAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '10px',
              fontSize: '10px',
              opacity: 100,
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
          />
          <Legend
            wrapperStyle={{
              fontSize: 11,
              paddingTop: 8,
              paddingBottom: 0,
              marginTop: 0,
              marginBottom: 0,
              lineHeight: "1.1em",
              maxHeight: 80
            }}
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
          {visibleCategories.map((cat) => (
            <Bar
              key={cat}
              dataKey={cat}
              stackId="a"
              fill={OCCUPATION_COLORS[cat] || "#8884d8"}
              name={OCCUPATION_LABELS[cat]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
    {/* Line Chart */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h4 className="font-semibold mb-2">Line Chart (Trends by Category)</h4>
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '10px',
              fontSize: '10px',
              opacity: 100,
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
          />
          <Legend
            wrapperStyle={{
              fontSize: 11,
              paddingTop: 0,
              paddingBottom: 0,
              marginTop: 0,
              marginBottom: 0,
              lineHeight: "1.1em",
              maxHeight: 60,
              zIndex: 100,
            }}
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
          {visibleCategories.map((cat) => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={OCCUPATION_COLORS[cat] || "#8884d8"}
              name={OCCUPATION_LABELS[cat]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);
}