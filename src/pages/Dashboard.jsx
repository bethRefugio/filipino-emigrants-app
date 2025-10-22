import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/DashboardTopNavbar';

// Visualization components
import AgeVisualizations from '../components/age/Visualizations';
import GenderVisualizations from '../components/gender/Visualizations';
import CivilStatusVisualizations from '../components/civil_status/Visualizations';
import EducationVisualizations from '../components/education/Visualizations';
import OccupationVisualizations from '../components/occupation/Visualizations';
import FlowMap from '../components/major-destination/FlowMap';
import OriginVisualizations from '../components/origin/Visualizations';

// Data fetchers for each collection
import { getEmigrants as getAgeEmigrants } from '../services/age';
import { getEmigrants as getGenderEmigrants } from '../services/gender';
import { getEmigrants as getCivilStatusEmigrants } from '../services/civil_status';
import { getEmigrants as getEducationEmigrants } from '../services/education';
import { getEmigrants as getOccupationEmigrants } from '../services/occupation';
import { getEmigrants as getMajorDestinationEmigrants } from '../services/major-destination';
import { getEmigrants as getOriginEmigrants } from '../services/origin';
import { originNames } from '../components/origin/originNames'; // for province names

export default function Dashboard() {
  // State for each dataset
  const [ageData, setAgeData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [civilStatusData, setCivilStatusData] = useState([]);
  const [educationData, setEducationData] = useState([]);
  const [occupationData, setOccupationData] = useState([]);
  const [majorDestinationData, setMajorDestinationData] = useState([]);
  const [originData, setOriginData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const years = [...new Set([...ageData, ...genderData, ...civilStatusData, ...educationData, ...occupationData].map(d => d.year))].sort();

  // Fetch all datasets in parallel
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [
        age,
        gender,
        civilStatus,
        education,
        occupation,
        majorDestination,
        origin
      ] = await Promise.all([
        getAgeEmigrants(),
        getGenderEmigrants(),
        getCivilStatusEmigrants(),
        getEducationEmigrants(),
        getOccupationEmigrants(),
        getMajorDestinationEmigrants(),
        getOriginEmigrants()
      ]);
      setAgeData(age);
      setGenderData(gender);
      setCivilStatusData(civilStatus);
      setEducationData(education);
      setOccupationData(occupation);
      setMajorDestinationData(majorDestination);
      setOriginData(origin);
      setLoading(false);
    }
    fetchAll();
  }, []);

  // Prepare totals for FlowMap
  const flowMapTotals = majorDestinationData.reduce((acc, e) => {
    acc.usa = (acc.usa || 0) + (e.usa || 0);
    acc.canada = (acc.canada || 0) + (e.canada || 0);
    acc.japan = (acc.japan || 0) + (e.japan || 0);
    acc.australia = (acc.australia || 0) + (e.australia || 0);
    acc.italy = (acc.italy || 0) + (e.italy || 0);
    acc.new_zealand = (acc.new_zealand || 0) + (e.new_zealand || 0);
    acc.united_kingdom = (acc.united_kingdom || 0) + (e.united_kingdom || 0);
    acc.germany = (acc.germany || 0) + (e.germany || 0);
    acc.south_korea = (acc.south_korea || 0) + (e.south_korea || 0);
    acc.spain = (acc.spain || 0) + (e.spain || 0);
    return acc;
  }, {});

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
    <div className="flex-1 overflow-auto">
      <TopNavbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        years={years}
      />
      <div className="space-y-4 px-6 pb-2 mt-6">
        <AgeVisualizations data={ageData}/>
        <GenderVisualizations data={genderData} />
        <CivilStatusVisualizations data={civilStatusData} />
        <EducationVisualizations data={educationData} />
        <OccupationVisualizations data={occupationData} />
        <FlowMap totals={flowMapTotals} />
        <OriginVisualizations data={originData} selectedProvinces={originNames} />
      </div>
    </div>
  );
}