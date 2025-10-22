import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter } from 'recharts';
import React from 'react';

export default function ChartsGrid({
  comparisonData,
  pieData,
  COLORS,
  trendData,
  distributionData,
  scatterData,
  geoData
}) {
  return (
    <div className="p-6 grid grid-cols-2 gap-6">
        {/* 1. COMPARISON - Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Comparison by Marital Status</h3>
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
        </div>

        {/* 2. COMPOSITION - Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Composition Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
            <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="count"
            >
                {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip />
            </PieChart>
        </ResponsiveContainer>
        </div>

        {/* 3. TRENDS - Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Yearly Trends</h3>
        <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
        </ResponsiveContainer>
        </div>

        {/* 4. DISTRIBUTION - Stacked Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Distribution by Year</h3>
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="single" stackId="a" fill="#3b82f6" />
            <Bar dataKey="married" stackId="a" fill="#10b981" />
            <Bar dataKey="other" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
        </div>

        {/* 5. RELATIONSHIPS - Scatter Plot */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Single vs Married Relationship</h3>
        <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="single" name="Single" tick={{ fontSize: 12 }} />
            <YAxis dataKey="married" name="Married" tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Emigrants" data={scatterData} fill="#8b5cf6" />
            </ScatterChart>
        </ResponsiveContainer>
        </div>

        {/* 6. GEOGRAPHIC - Country Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Geographic Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={geoData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="country" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="total" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
        </div>
    </div>
  );
}