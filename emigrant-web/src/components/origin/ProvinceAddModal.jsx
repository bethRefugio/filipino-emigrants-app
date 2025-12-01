import React, { useState } from 'react';
import { X } from 'lucide-react';
import { originNames, regions, provincesByRegion } from './originNames';

export default function ProvinceAddModal({ 
  isEditing, 
  formData, 
  setFormData, 
  handleSubmit, 
  setShowAddModal 
}) {
  const [selectedRegion, setSelectedRegion] = useState('REGION_I');
  const [expandedRegions, setExpandedRegions] = useState(['REGION_I']);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleRegion = (regionKey) => {
    if (expandedRegions.includes(regionKey)) {
      setExpandedRegions(expandedRegions.filter(r => r !== regionKey));
    } else {
      setExpandedRegions([...expandedRegions, regionKey]);
    }
  };

  const handleQuickFill = (value) => {
    const newFormData = { ...formData };
    originNames.forEach(province => {
      newFormData[province] = value;
    });
    setFormData(newFormData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">
            {isEditing ? 'Edit Emigrant Record' : 'Add New Emigrant Record'}
          </h3>
          <button 
            onClick={() => setShowAddModal(false)} 
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Year Input */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold mb-2">Year *</label>
            <input
              type="number"
              value={formData.year || ''}
              onChange={(e) => handleChange('year', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., 2020"
              required
            />
          </div>

          {/* Quick Fill Options */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-semibold mb-2">Quick Fill All Provinces</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill(0)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Fill with 0
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(100)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Fill with 100
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('')}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Province Inputs by Region */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Emigrant Count by Province</h4>
            
            {regions.map(region => {
              const isExpanded = expandedRegions.includes(region.key);
              const regionProvinces = provincesByRegion[region.key] || [];
              
              return (
                <div key={region.key} className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleRegion(region.key)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between rounded-t-lg"
                  >
                    <span className="font-medium text-sm">{region.name}</span>
                    <span className="text-xs text-gray-500">
                      {isExpanded ? '▼' : '▶'} {regionProvinces.length} provinces
                    </span>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {regionProvinces.map(province => (
                        <div key={province}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {province}
                          </label>
                          <input
                            type="number"
                            value={formData[province] || ''}
                            onChange={(e) => handleChange(province, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditing ? 'Update Record' : 'Add Record'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}