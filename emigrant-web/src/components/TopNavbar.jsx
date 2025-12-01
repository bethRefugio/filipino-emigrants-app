import { Search, Filter, Plus, Upload } from 'lucide-react';
import React from 'react';

export default function TopNavbar({
  searchTerm,
  setSearchTerm,
  selectedYear,
  setSelectedYear,
  years,
  setShowAddModal,
  setShowImportModal
}) {
  return (
    <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <div>
        <h2 className="text-2xl font-bold text-gray-800">Filipino Emigrants Dashboard</h2>
        <p className="text-sm text-gray-500">Comprehensive data visualization & analytics</p>
        </div>
        
        <div className="flex items-center gap-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        
        <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option>All</option>
            {years.map(year => (
            <option key={year}>{year}</option>
            ))}
        </select>

        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter size={18} />
            Filter
        </button>

            <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
            <Plus size={18} />
            Add New
        </button>
        <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
            <Upload size={18} />
            Import CSV
        </button>
        </div>
    </div>
  );
}