import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
  Label,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  CartesianGrid
} from "recharts";

// Pastel color palette
const EDUCATION_COLORS = {
  notOfSchoolingAge: "#6dc47c",
  noFormalEducation: "#ffd000",
  elementaryLevel: "#224268ff",
  elementaryGraduate: "#7b60c0",
  highSchoolLevel: "#ffb86b",
  highSchoolGraduate: "#ff6f6f",
  vocationalLevel: "#e9e46b",
  vocationalGraduate: "#6dc47c",
  collegeLevel: "#4ecdc4",
  collegeGraduate: "#2372a7ff",
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
      key: cat,
    };
  });
}

// Custom Legend Renderer
const renderCustomLegend = (props) => {
  const { payload } = props;
  
  return (
    <div style={{ paddingTop: '20px' }}>
      <div style={{ 
        fontSize: '12px', 
        fontWeight: 'bold', 
        color: '#374151',
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        Educational Attainment
      </div>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px 16px',
        fontSize: '11px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              backgroundColor: entry.color,
              borderRadius: '2px',
              flexShrink: 0
            }} />
            <span style={{ color: '#374151' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Visualizations({ data, selectedCategories }) {
  // Always show all categories for comparison
  const chartData = getCategoryTotals(data);

  // Get years for bubble chart
  const years = [
    ...new Set(data.map((e) => e.year).filter((y) => y !== undefined && y !== null)),
  ].sort((a, b) => a - b);

  // Calculate total for each category across all data
  const categoryTotals = Object.keys(EDUCATION_LABELS).map((cat) => ({
    key: cat,
    total: data.reduce((sum, e) => sum + (e[cat] || 0), 0),
  }));

  // Get top 5 categories
  const top5Categories = categoryTotals
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((c) => c.key);

  // Prepare data for bubble chart (only top 5 categories)
  const bubbleData = [];
  years.forEach((year) => {
    const yearData = data.filter((e) => e.year === year);
    top5Categories.forEach((cat) => {
      const value = yearData.reduce((sum, e) => sum + (e[cat] || 0), 0);
      if (value > 0) {
        bubbleData.push({
          year,
          category: EDUCATION_LABELS[cat],
          categoryKey: cat,
          value,
          size: value,
        });
      }
    });
  });

  return (
    <div className="mt-0.2 px-6 pb-10">
      <h3 className="text-xl font-bold mb-6 text-gray-800">Educational Attainment Visualizations</h3>
      
      {/* Horizontal Bar Chart */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h4 className="font-semibold text-lg mb-4 text-gray-700">Total Emigrants by Educational Attainment</h4>
        <ResponsiveContainer width="100%" height={550}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
          >
            <XAxis type="number">
              <Label 
                value="Number of Emigrants" 
                position="insideBottom" 
                offset={-10}
                style={{ fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
              />
            </XAxis>
            <YAxis
              type="category"
              dataKey="category"
              width={220}
              tick={{ fontSize: 11 }}
            >
              <Label 
                value="Educational Attainment" 
                angle={-90} 
                position="insideLeft"
                offset={10}
                style={{ textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
              />
            </YAxis>
            <Tooltip
              formatter={(value) => value.toLocaleString()}
              labelFormatter={(label) => label}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '11px'
              }}
            />
            <Bar dataKey="value" isAnimationActive={false}>
              <LabelList 
                dataKey="value" 
                position="right" 
                formatter={(v) => v.toLocaleString()} 
                style={{ fontSize: '10px', fill: '#374151' }}
              />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bubble Chart - Top 5 Educational Attainment */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h4 className="font-semibold text-lg mb-4 text-gray-700">
          Relationship Between Yearly Emigrant Counts and Top 5 Educational Attainment Groups ({years[0]}-{years[years.length - 1]})
        </h4>
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="year"
              name="Year"
              domain={['dataMin', 'dataMax']}
              ticks={years}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 10 }}
            >
              <Label 
                value="Year" 
                position="insideBottom" 
                offset={-15}
                style={{ fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="value"
              name="Emigrants"
              tickFormatter={(value) => value.toLocaleString()}
              tick={{ fontSize: 10 }}
            >
              <Label 
                value="Number of Emigrants" 
                angle={-90} 
                position="insideLeft"
                offset={5}
                style={{ textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
              />
            </YAxis>
            <ZAxis
              type="number"
              dataKey="size"
              range={[200, 4000]}
              name="Count"
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '11px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <p style={{ fontWeight: 'bold', marginBottom: '6px', color: '#1f2937' }}>
                        Year: {data.year}
                      </p>
                      <p style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          backgroundColor: EDUCATION_COLORS[data.categoryKey],
                          marginRight: '2px',
                          borderRadius: '50%',
                        }}></span>
                        {data.category}
                      </p>
                      <p style={{ color: '#374151' }}>Emigrants: <strong>{data.value.toLocaleString()}</strong></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 11,
                paddingTop: 15,
                lineHeight: "1.4em",
              }}
              iconSize={10}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              content={(props) => {
                const uniqueCategories = [...new Set(bubbleData.map(d => d.categoryKey))];
                return (
                  <div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#374151',
                      marginBottom: '8px',
                      textAlign: 'left'
                    }}>
                      Top 5 Educational Attainment :
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'left', 
                      flexWrap: 'wrap', 
                      gap: '12px',
                      padding: '10px'
                    }}>
                      {uniqueCategories.map((cat) => (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: EDUCATION_COLORS[cat],
                            borderRadius: '50%',
                          }}></div>
                          <span style={{ fontSize: '11px', color: '#374151' }}>{EDUCATION_LABELS[cat]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            />
            <Scatter
              data={bubbleData}
              isAnimationActive={false}
            >
              {bubbleData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={EDUCATION_COLORS[entry.categoryKey]}
                  fillOpacity={0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};