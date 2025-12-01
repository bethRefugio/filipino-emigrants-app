import { Users, Award, Calendar, Clock } from 'lucide-react';
import React from 'react';

export default function KpiCards({
  grandTotal,
  topCategoryName,
  topCategoryTotal,
  lastYear,
  lastYearTotal,
  duration
}) {
  return (
    <div className="p-6 grid grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Grand Total</p>
          <Users className="text-blue-500" size={20} />
        </div>
        <p className="text-3xl font-bold text-gray-800">{grandTotal.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1">All emigrants</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Top Category</p>
          <Award className="text-green-500" size={20} />
        </div>
        <p className="text-3xl font-bold text-gray-800">
          {topCategoryName
            ? (topCategoryName.toLowerCase() === 'usa' ? topCategoryName.toUpperCase() : topCategoryName)
            : 'N/A'}
        </p>
        <p className="text-sm text-gray-500 mt-1">{topCategoryTotal.toLocaleString()} emigrants</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Last Year ({lastYear})</p>
          <Calendar className="text-orange-500" size={20} />
        </div>
        <p className="text-3xl font-bold text-gray-800">{lastYearTotal.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1">Emigrants in {lastYear}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">Record Duration</p>
          <Clock className="text-purple-500" size={20} />
        </div>
        <p className="text-3xl font-bold text-gray-800">{duration}</p>
        <p className="text-sm text-gray-500 mt-1">Year Range</p>
      </div>
    </div>
  );
}