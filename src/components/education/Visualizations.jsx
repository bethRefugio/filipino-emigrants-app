import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from "recharts";

// Pastel color palette
const EDUCATION_COLORS = {
  notOfSchoolingAge: "#6dc47c",
  noFormalEducation: "#ffd000",
  elementaryLevel: "#5390d9",
  elementaryGraduate: "#7b60c0",
  highSchoolLevel: "#ffb86b",
  highSchoolGraduate: "#ff6f6f",
  vocationalLevel: "#e9e46b",
  vocationalGraduate: "#6dc47c",
  collegeLevel: "#4ecdc4",
  collegeGraduate: "#3498db",
  postGraduateLevel: "#a084ca",        
  postGraduate: "#4bbf73",             
  nonFormalEducation: "#c77dff",       
  notReported: "#90a4ae",  
};

const EDUCATION_LABELS = {
  notOfSchoolingAge: "Not of Schooling Age",
  noFormalEducation: "No Formal Education",
  elementaryLevel: "Elementary Level",
  elementaryGraduate: "Elementary Graduate",
  highSchoolLevel: "High School Level",
  highSchoolGraduate: "High School Graduate",
  vocationalLevel: "Vocational Level",
  vocationalGraduate: "Vocational Graduate",
  collegeLevel: "College Level",
  collegeGraduate: "College Graduate",
  postGraduateLevel: "Post Graduate Level",
  postGraduate: "Post Graduate",
  nonFormalEducation: "Non-Formal Education",
  notReported: "Not Reported",
};

function getCategoryTotals(data) {
  // Always include all categories, even if zero
  return Object.keys(EDUCATION_LABELS).map((cat) => {
    const total = data.reduce((sum, e) => sum + (e[cat] || 0), 0);
    return {
      category: EDUCATION_LABELS[cat] || cat,
      value: total,
      color: EDUCATION_COLORS[cat] || "#bdbdbd",
    };
  });
}

export default function Visualizations({ data, selectedCategories }) {
  // Always show all categories for comparison
  const chartData = getCategoryTotals(data);

  return (
    <div className="mt-0.2 px-6 pb-10">
      <h3 className="text-lg font-semibold mb-4">Total Emigrants by Educational Attainment</h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4" style={{ minHeight: 480 }}>
        <ResponsiveContainer width="80%" height={480}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
          >
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="category"
              width={220}
              tick={{ fontSize: 14 }}
            />
            <Tooltip
              formatter={(value) => value.toLocaleString()}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="value" isAnimationActive={false}>
              <LabelList dataKey="value" position="right" formatter={(v) => v.toLocaleString()} />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}