import { Search, Filter, Plus, Upload } from 'lucide-react';
import React from 'react';

export default function TopNavbar({
  searchTerm = "",
  setSearchTerm = () => {},
  selectedYear = "All",
  setSelectedYear = () => {},
  years = [],
  setShowAddModal = () => {},
  setShowImportModal = () => {}
}) {
  return (
    <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <div>
        <h2 className="text-2xl font-bold text-gray-800">Filipino Emigrants Dashboard</h2>
        <p className="text-sm text-gray-500">Comprehensive data visualization & analytics</p>
        </div>
     </div>
  );
}