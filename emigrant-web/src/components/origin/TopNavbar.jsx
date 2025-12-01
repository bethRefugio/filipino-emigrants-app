import { Search, Plus, Upload, Filter } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { regions, provincesByRegion } from './originNames';
import useUserRole from '../isPrivileged';

export default function TopNavbar({
  searchTerm,
  setSearchTerm,
  selectedYear,
  setSelectedYear,
  years,
  selectedProvinces,
  setSelectedProvinces,
  setShowAddModal,
  setShowImportModal
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const dropdownRef = useRef(null);

  const { user, isPrivileged } = useUserRole();

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

  // Handle province toggle
  const handleProvinceChange = (province) => {
    if (selectedProvinces.includes(province)) {
      setSelectedProvinces(selectedProvinces.filter(p => p !== province));
    } else {
      setSelectedProvinces([...selectedProvinces, province]);
    }
  };

  // Handle region selection
  const handleRegionChange = (regionKey) => {
    setSelectedRegion(regionKey);
    if (regionKey === 'all') {
      // Show all provinces
      const allProvinces = Object.values(provincesByRegion).flat();
      setSelectedProvinces(allProvinces);
    } else {
      // Show only provinces from selected region
      const regionProvinces = provincesByRegion[regionKey] || [];
      setSelectedProvinces(regionProvinces);
    }
  };

  // "Select All" logic for current region
  const currentProvinces = selectedRegion === 'all' 
    ? Object.values(provincesByRegion).flat()
    : provincesByRegion[selectedRegion] || [];
    
  const allRegionProvincesSelected = currentProvinces.every(p => selectedProvinces.includes(p));
  
  const handleSelectAllInRegion = () => {
    if (allRegionProvincesSelected) {
      // Deselect all from current region
      setSelectedProvinces(selectedProvinces.filter(p => !currentProvinces.includes(p)));
    } else {
      // Select all from current region
      const newSelection = [...new Set([...selectedProvinces, ...currentProvinces])];
      setSelectedProvinces(newSelection);
    }
  };

  return (
    <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Filipino Emigrants by Province</h2>
        <p className="text-sm text-gray-500">Regional emigrant data visualization & analytics</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/*<div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by year..."
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
            Filter Provinces ({selectedProvinces.length})
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 p-4 max-h-[70vh] overflow-y-auto">
              <div className="font-semibold text-sm mb-3">Filter by Region</div>
              
              {/* Region Selector */}
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-3 text-sm"
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region.key} value={region.key}>
                    {region.name}
                  </option>
                ))}
              </select>
              
              {/* Select All for Current Region */}
              <label className="flex items-center gap-2 text-xs font-medium mb-2 pb-2 border-b">
                <input
                  type="checkbox"
                  checked={allRegionProvincesSelected && currentProvinces.length > 0}
                  onChange={handleSelectAllInRegion}
                />
                Select All in {selectedRegion === 'all' ? 'Philippines' : regions.find(r => r.key === selectedRegion)?.name}
              </label>
              
              {/* Province Checkboxes */}
              <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                {currentProvinces.map(province => (
                  <label key={province} className="flex items-center gap-2 text-xs hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedProvinces.includes(province)}
                      onChange={() => handleProvinceChange(province)}
                    />
                    <span className="text-gray-700">{province}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {user && isPrivileged(user.role) && (
        <>
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
        </>
        )}
      </div>
    </div>
  );
}