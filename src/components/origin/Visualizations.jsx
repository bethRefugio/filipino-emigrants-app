import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { provincesByRegion } from './originNames';

export default function OriginVisualizations({ data, selectedProvinces }) {
  const [tab, setTab] = useState('bar');

  // Prepare data for province-based charts
  const provinceData = selectedProvinces.slice(0, 10).map(province => {
    const total = data.reduce((sum, record) => sum + (record[province] || 0), 0);
    return {
      name: province.length > 15 ? province.substring(0, 15) + '...' : province,
      fullName: province,
      value: total
    };
  }).sort((a, b) => b.value - a.value);

  // Time series data for top 5 provinces
  const timeSeriesData = data.map(record => {
    const yearData = { year: record.year };
    selectedProvinces.slice(0, 5).forEach(province => {
      yearData[province] = record[province] || 0;
    });
    return yearData;
  }).sort((a, b) => a.year - b.year);

  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].payload.fullName || label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Data Visualizations</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Top 10 Provinces by Total Emigrants
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={provinceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Line Chart */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Emigration Trends Over Time (Top 5 Provinces)
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {selectedProvinces.slice(0, 5).map((province, index) => (
                  <Line
                    key={province}
                    type="monotone"
                    dataKey={province}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={province.length > 20 ? province.substring(0, 20) + '...' : province}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-blue-600 font-semibold">Total Records</p>
            <p className="text-2xl font-bold text-blue-900">{data.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs text-green-600 font-semibold">Active Provinces</p>
            <p className="text-2xl font-bold text-green-900">{selectedProvinces.length}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-xs text-orange-600 font-semibold">Year Range</p>
            <p className="text-2xl font-bold text-orange-900">
              {data.length > 0 ? `${Math.min(...data.map(d => d.year))}-${Math.max(...data.map(d => d.year))}` : 'N/A'}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-xs text-purple-600 font-semibold">Active Regions</p>
            <p className="text-2xl font-bold text-purple-900">
              {
                Object.keys(provincesByRegion).filter(regionKey =>
                  provincesByRegion[regionKey].some(prov => selectedProvinces.includes(prov))
                ).length
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}