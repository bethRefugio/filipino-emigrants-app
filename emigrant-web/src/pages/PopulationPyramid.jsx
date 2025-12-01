import React, { useState, useEffect } from 'react';
import { getEmigrants as getAgeEmigrants } from '../services/age';
import { getEmigrants as getSexEmigrants } from '../services/sex';

export default function PopulationPyramid() {
  const [ageData, setAgeData] = useState([]);
  const [sexData, setSexData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [age, sex] = await Promise.all([
          getAgeEmigrants(),
          getSexEmigrants()
        ]);
        setAgeData(age);
        setSexData(sex);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Get available years
  const years = [...new Set([...ageData.map(e => e.year), ...sexData.map(e => e.year)])].sort((a, b) => b - a);

  // Filter data by selected year
  const filteredAgeData = selectedYear === 'All' 
    ? ageData 
    : ageData.filter(e => e.year === Number(selectedYear));
    
  const filteredSexData = selectedYear === 'All'
    ? sexData
    : sexData.filter(e => e.year === Number(selectedYear));

  // Age groups mapping
  const ageGroups = [
    { key: '14-below', label: '0-14' },
    { key: '15-19', label: '15-19' },
    { key: '20-24', label: '20-24' },
    { key: '25-29', label: '25-29' },
    { key: '30-34', label: '30-34' },
    { key: '35-39', label: '35-39' },
    { key: '40-44', label: '40-44' },
    { key: '45-49', label: '45-49' },
    { key: '50-54', label: '50-54' },
    { key: '55-59', label: '55-59' },
    { key: '60-64', label: '60-64' },
    { key: '65-69', label: '65-69' },
    { key: '70-above', label: '70+' }
  ];

  // Calculate totals for each age group by sex
  const pyramidData = ageGroups.map(group => {
    const ageTotal = filteredAgeData.reduce((sum, e) => sum + (e[group.key] || 0), 0);
    const sexTotal = filteredSexData.reduce((sum, e) => sum + (e.male || 0) + (e.female || 0), 0);
    
    // Calculate proportions (assuming equal distribution across age groups for sex data)
    const maleTotal = filteredSexData.reduce((sum, e) => sum + (e.male || 0), 0);
    const femaleTotal = filteredSexData.reduce((sum, e) => sum + (e.female || 0), 0);
    
    // Distribute sex data proportionally to age groups
    const maleProportion = sexTotal > 0 ? maleTotal / sexTotal : 0.5;
    const femaleProportion = sexTotal > 0 ? femaleTotal / sexTotal : 0.5;
    
    return {
      ageGroup: group.label,
      male: Math.round(ageTotal * maleProportion),
      female: Math.round(ageTotal * femaleProportion)
    };
  }).reverse(); // Reverse to show oldest at top

  // Find max value for scaling
  const maxValue = Math.max(
    ...pyramidData.map(d => Math.max(d.male, d.female))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Population Pyramid - Filipino Emigrants</h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col items-center">
            {/* Title */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Ages</h3>
            </div>

            {/* Pyramid Chart */}
            <div className="w-full max-w-5xl">
              <div className="flex justify-center items-center mb-4">
                <div className="text-right font-semibold text-gray-700 w-24">Males</div>
                <div className="w-32"></div>
                <div className="text-left font-semibold text-gray-700 w-24">Females</div>
              </div>

              {pyramidData.map((item, index) => {
                const maleWidth = (item.male / maxValue) * 100;
                const femaleWidth = (item.female / maxValue) * 100;

                return (
                  <div key={index} className="flex items-center justify-center mb-1 hover:bg-gray-50 transition-colors">
                    {/* Male side (left) */}
                    <div className="flex justify-end items-center w-1/2 pr-2">
                      <span className="text-xs text-gray-600 mr-2 w-16 text-right">
                        {item.male.toLocaleString()}
                      </span>
                      <div className="relative h-8 flex items-center justify-end" style={{ width: '100%' }}>
                        <div
                          className="h-full bg-blue-400 hover:bg-blue-500 transition-colors rounded-l"
                          style={{ width: `${maleWidth}%` }}
                          title={`Males ${item.ageGroup}: ${item.male.toLocaleString()}`}
                        ></div>
                      </div>
                    </div>

                    {/* Age group label (center) */}
                    <div className="w-20 text-center">
                      <span className="text-xs font-medium text-gray-700">{item.ageGroup}</span>
                    </div>

                    {/* Female side (right) */}
                    <div className="flex justify-start items-center w-1/2 pl-2">
                      <div className="relative h-8 flex items-center" style={{ width: '100%' }}>
                        <div
                          className="h-full bg-pink-400 hover:bg-pink-500 transition-colors rounded-r"
                          style={{ width: `${femaleWidth}%` }}
                          title={`Females ${item.ageGroup}: ${item.female.toLocaleString()}`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 ml-2 w-16 text-left">
                        {item.female.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* X-axis labels */}
              <div className="flex justify-center items-center mt-4">
                <div className="text-center w-1/2 pr-2">
                  <p className="text-sm font-semibold text-gray-700">Population Scale</p>
                  <p className="text-xs text-gray-500">(emigrants count)</p>
                </div>
                <div className="w-20"></div>
                <div className="text-center w-1/2 pl-2">
                  <p className="text-sm font-semibold text-gray-700">Population Scale</p>
                  <p className="text-xs text-gray-500">(emigrants count)</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span className="text-sm text-gray-700">Males</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-400 rounded"></div>
                <span className="text-sm text-gray-700">Females</span>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-3xl">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Males</p>
                <p className="text-xl font-bold text-blue-600">
                  {pyramidData.reduce((sum, d) => sum + d.male, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total Females</p>
                <p className="text-xl font-bold text-pink-600">
                  {pyramidData.reduce((sum, d) => sum + d.female, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Grand Total</p>
                <p className="text-xl font-bold text-gray-700">
                  {(pyramidData.reduce((sum, d) => sum + d.male + d.female, 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}