import { Search, Plus, Upload, Filter } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

const categories = [
  { key: 'single', label: 'Single' },
  { key: 'married', label: 'Married' },
  { key: 'widower', label: 'Widower' },
  { key: 'separated', label: 'Separated' },
  { key: 'divorced', label: 'Divorced' },
  { key: 'notReported', label: 'Not Reported' }
];

export default function TopNavbar({
  searchTerm,
  setSearchTerm,
  selectedYear,
  setSelectedYear,
  years,
  selectedCategories,
  setSelectedCategories,
  setShowAddModal,
  setShowImportModal
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Handle checkbox toggle
  const handleCategoryChange = (key) => {
    if (selectedCategories.includes(key)) {
      setSelectedCategories(selectedCategories.filter(c => c !== key));
    } else {
      setSelectedCategories([...selectedCategories, key]);
    }
  };

  // "All" checkbox logic
  const allChecked = selectedCategories.length === categories.length;
  const handleAllChange = () => {
    if (allChecked) setSelectedCategories([]);
    else setSelectedCategories(categories.map(c => c.key));
  };

  return (
    <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Filipino Emigrants - Civil Status </h2>
        <p className="text-sm text-gray-500">Comprehensive data visualization & analytics</p>
      </div>
      <div className="flex items-center gap-4">
        {/*<div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>*/}
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
        {/* Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="px-4 py-2 bg-gray-100 border rounded-lg flex items-center gap-2 hover:bg-gray-200"
            type="button"
          >
            <Filter size={16} />
            Filter
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 p-4">
              <div className="font-semibold text-xs mb-2">Filter by Category</div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={handleAllChange}
                  />
                  All
                </label>
                {categories.map(cat => (
                  <label key={cat.key} className="flex items-center gap-2 text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.key)}
                      onChange={() => handleCategoryChange(cat.key)}
                    />
                    {cat.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
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