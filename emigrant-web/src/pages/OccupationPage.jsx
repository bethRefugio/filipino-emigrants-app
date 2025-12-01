import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/occupation/TopNavbar';
import KpiCards from '../components/occupation/KpiCards';
import Visualizations from '../components/occupation/Visualizations';
import OccupationTable from '../components/occupation/OccupationTable';
import AddModal from '../components/AddModal';
import EditModal from '../components/EditModal';
import ImportModal from '../components/occupation/ImportModal';
import { getEmigrants, addEmigrant, updateEmigrant, deleteEmigrant } from '../services/occupation';
import Papa from 'papaparse';

// Define all occupation categories and labels
const occupationCategories = [
  { key: 'professional_technical_related', label: 'Professional, Technical & Related Workers' },
  { key: 'managerial_executive_admin', label: 'Managerial, Executive & Administrative Workers' },
  { key: 'clerical_workers', label: 'Clerical Workers' },
  { key: 'sales_workers', label: 'Sales Workers' },
  { key: 'service_workers', label: 'Service Workers' },
  { key: 'agri_animal_forestry_fishermen', label: 'Agri, Animal Husbandry, Forestry Workers & Fishermen' },
  { key: 'production_transport_equipment_laborers', label: 'Production Process, Transport Equipment Operators & Laborers' },
  { key: 'armed_forces', label: 'Members of the Armed Forces' },
  { key: 'housewives', label: 'Housewives' },
  { key: 'retirees', label: 'Retirees' },
  { key: 'students', label: 'Students' },
  { key: 'minors_below_7', label: 'Minors (Below 7)' },
  { key: 'out_of_school_youth', label: 'Out-of-School Youth' },
  { key: 'refugees', label: 'Refugees' },
  { key: 'no_occupation_reported', label: 'No Occupation Reported' }
];

const initialForm = occupationCategories.reduce((acc, cat) => {
  acc[cat.key] = '';
  return acc;
}, { year: '' });

export default function OccupationPage() {
  const [emigrants, setEmigrants] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [yearSort, setYearSort] = useState('desc');
  const [selectedCategories, setSelectedCategories] = useState(occupationCategories.map(c => c.key));

  // Fetch data from Firebase
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getEmigrants();
      setEmigrants(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtering logic
  const filteredData = emigrants.filter(e =>
    (selectedYear === 'All' || e.year === Number(selectedYear)) &&
    (searchTerm.trim() === '' ||
      String(e.year).includes(searchTerm.trim()) ||
      occupationCategories.some(cat =>
        String(e[cat.key] || '').toLowerCase().includes(searchTerm.trim().toLowerCase())
      ))
  );

  // Sorting logic
  const sortedData = [...filteredData].sort((a, b) =>
    yearSort === 'desc' ? b.year - a.year : a.year - b.year
  );

  // KPI calculations
  const totalEmigrants = emigrants.reduce(
    (sum, e) =>
      sum +
      occupationCategories.reduce((catSum, cat) => catSum + (e[cat.key] || 0), 0),
    0
  );

  const totals = emigrants.reduce((acc, cur) => {
    occupationCategories.forEach(cat => {
      acc[cat.key] = (acc[cat.key] || 0) + (cur[cat.key] || 0);
    });
    return acc;
  }, {});

  const topCategory = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategory
    ? occupationCategories.find(c => c.key === topCategory[0])?.label || topCategory[0]
    : 'N/A';
  const topCategoryTotal = topCategory ? topCategory[1] : 0;

  const years = [...new Set(emigrants.map(e => e.year))].sort((a, b) => b - a);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const lastYear = maxYear;
  const duration = minYear !== Infinity && maxYear !== -Infinity ? `${minYear} - ${maxYear}` : 'N/A';
  const lastYearTotal = emigrants
    .filter(e => e.year === lastYear)
    .reduce((sum, e) => sum + occupationCategories.reduce((catSum, cat) => catSum + (e[cat.key] || 0), 0), 0);

  // CRUD Handlers
  const handleAdd = async () => {
    try {
      await addEmigrant({
        year: Number(form.year) || 0,
        ...Object.fromEntries(occupationCategories.map(cat => [cat.key, Number(form[cat.key]) || 0]))
      });
      setForm(initialForm);
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Failed to add record. Please try again.');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setForm({
      year: record.year?.toString() || '',
      ...Object.fromEntries(occupationCategories.map(cat => [cat.key, record[cat.key]?.toString() || '']))
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await updateEmigrant(editingRecord.id, {
        year: Number(form.year) || 0,
        ...Object.fromEntries(occupationCategories.map(cat => [cat.key, Number(form[cat.key]) || 0]))
      });
      setForm(initialForm);
      setShowEditModal(false);
      setEditingRecord(null);
      fetchData();
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteEmigrant(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record. Please try again.');
      }
    }
  };

  // Handle checkbox change for a single row
  const handleRowSelect = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Handle "select all" checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(sortedData.map(e => e.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Delete multiple records
  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;
    if (window.confirm(`Delete ${selectedRows.length} selected records?`)) {
      try {
        await Promise.all(selectedRows.map(id => deleteEmigrant(id)));
        setSelectedRows([]);
        fetchData();
      } catch (error) {
        alert('Failed to delete selected records.');
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Year', ...occupationCategories.map(cat => cat.label)];
    const csvData = filteredData.map(e => [
      e.year,
      ...occupationCategories.map(cat => e[cat.key] || 0)
    ]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filipino_emigrants_occupation_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      parseCSVPreview(file);
    } else {
      alert('Please select a valid CSV file');
      setCsvFile(null);
      setCsvPreview([]);
    }
  };

  const parseCSVPreview = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const previewData = results.data.slice(0, 5).map((row, idx) => ({
          row: idx + 1,
          year: row.year,
          ...Object.fromEntries(occupationCategories.map(cat =>
            [cat.key, Number((row[cat.key] || '0').replace(/,/g, ''))]
          ))
        }));
        setCsvPreview(previewData);
      }
    });
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      alert('Please select a CSV file first');
      return;
    }
    setImporting(true);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const records = results.data.map(row => ({
            year: Number(row.year),
            ...Object.fromEntries(occupationCategories.map(cat =>
              [cat.key, Number((row[cat.key] || '0').replace(/,/g, ''))]
            ))
          }));
          let successCount = 0;
          for (const record of records) {
            try {
              await addEmigrant(record);
              successCount++;
            } catch (error) {
              console.error('Error adding record:', error);
            }
          }
          alert(`Successfully imported ${successCount} of ${records.length} records!`);
          setCsvFile(null);
          setCsvPreview([]);
          setShowImportModal(false);
          const fileInput = document.getElementById('csv-import-input');
          if (fileInput) fileInput.value = '';
          fetchData();
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the format.');
        }
        setImporting(false);
      }
    });
  };

  const downloadSampleCSV = () => {
    const sampleCSV = `year,${occupationCategories.map(cat => cat.key).join(',')}
2024,1500,800,600,700,900,1200,1300,200,400,300,1100,50,250,30,90
2023,1450,750,580,670,850,1150,1250,180,380,280,1000,40,230,25,80
2022,1400,700,550,640,800,1100,1200,160,360,260,950,35,220,20,75`;
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emigrants_occupation_data_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Navbar and Table Props
  const navbarProps = {
    searchTerm,
    setSearchTerm,
    selectedYear,
    setSelectedYear,
    years,
    selectedCategories,
    setSelectedCategories,
    setShowAddModal,
    setShowImportModal
  };

  const tableProps = {
    sortedData,
    selectedRows,
    handleRowSelect,
    handleSelectAll,
    handleDeleteSelected,
    handleEdit,
    handleDelete,
    yearSort,
    setYearSort,
    handleExportCSV,
    selectedCategories
  };

  const addModalProps = {
    form,
    setForm,
    handleAdd,
    setShowAddModal
  };

  const editModalProps = {
    form,
    setForm,
    handleUpdate,
    setShowEditModal
  };

  const importModalProps = {
    csvFile,
    setCsvFile,
    csvPreview,
    setCsvPreview,
    importing,
    handleImportCSV,
    setShowImportModal,
    handleFileChange,
    downloadSampleCSV
  };

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopNavbar {...navbarProps} />
      {<KpiCards
        grandTotal={totalEmigrants}
        topCategoryName={topCategoryName}
        topCategoryTotal={topCategoryTotal}
        lastYear={lastYear}
        lastYearTotal={lastYearTotal}
        duration={duration}
      />}
      {<Visualizations data={emigrants} selectedCategories={selectedCategories} />}
      <div className="flex-1">
        <OccupationTable {...tableProps} />
        {showAddModal && <AddModal {...addModalProps} />}
        {showEditModal && <EditModal {...editModalProps} />}
        {showImportModal && <ImportModal {...importModalProps} />}
      </div>
    </div>
  );
}