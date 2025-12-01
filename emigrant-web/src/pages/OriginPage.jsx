import React, { useState, useEffect } from 'react';
import ProvinceTopNavbar from '../components/origin/TopNavbar';
import ProvinceKpiCards from '../components/origin/KpiCards';
import ProvinceTable from '../components/origin/OriginTable';
import ProvinceAddModal from '../components/origin/ProvinceAddModal';
import ProvinceImportModal from '../components/origin/ImportModal';
import OriginVisualizations from '../components/origin/Visualizations';
import { getEmigrants, addEmigrant, updateEmigrant, deleteEmigrant } from '../services/origin';
import { originNames } from '../components/origin/originNames';
import Papa from 'papaparse';

export default function OriginPage() {
  const [emigrants, setEmigrants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [yearSort, setYearSort] = useState('desc');
  const [selectedProvinces, setSelectedProvinces] = useState([...originNames]);
  
  const [formData, setFormData] = useState({
    year: '',
    ...Object.fromEntries(originNames.map(p => [p, '']))
  });

  const initialForm = {
    year: '',
    ...Object.fromEntries(originNames.map(p => [p, '']))
  };

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

  // --- KPI Calculations ---
  const grandTotal = emigrants.reduce((sum, e) => {
    return sum + selectedProvinces.reduce((pSum, province) => pSum + (e[province] || 0), 0);
  }, 0);

  const provinceTotals = {};
  selectedProvinces.forEach(province => {
    provinceTotals[province] = emigrants.reduce((sum, e) => sum + (e[province] || 0), 0);
  });

  const topProvinceName = Object.keys(provinceTotals).length > 0
    ? Object.keys(provinceTotals).reduce((a, b) => 
        provinceTotals[a] > provinceTotals[b] ? a : b
      )
    : 'N/A';
  const topProvinceTotal = provinceTotals[topProvinceName] || 0;

  const years = emigrants.map(e => e.year).filter(Boolean);
  const minYear = years.length > 0 ? Math.min(...years) : 0;
  const maxYear = years.length > 0 ? Math.max(...years) : 0;
  const lastYear = maxYear;
  
  const lastYearData = emigrants.find(e => e.year === lastYear);
  const lastYearTotal = lastYearData 
    ? selectedProvinces.reduce((sum, province) => sum + (lastYearData[province] || 0), 0)
    : 0;

  const duration = minYear !== Infinity && maxYear !== -Infinity ? `${minYear} - ${maxYear}` : 'N/A';
  const totalProvinces = originNames.length;

  // --- CRUD Handlers ---
  const handleAdd = async () => {
    try {
      const data = {
        year: Number(formData.year) || 0,
        ...Object.fromEntries(
          originNames.map(province => [province, Number(formData[province]) || 0])
        )
      };
      await addEmigrant(data);
      setFormData(initialForm);
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Failed to add record. Please try again.');
    }
  };

  const handleEdit = (record) => {
    setFormData(record);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleUpdate = async () => {
    try {
      const data = {
        year: Number(formData.year) || 0,
        ...Object.fromEntries(
          originNames.map(province => [province, Number(formData[province]) || 0])
        )
      };
      await updateEmigrant(formData.id, data);
      setFormData(initialForm);
      setShowAddModal(false);
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      handleUpdate();
    } else {
      handleAdd();
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
    const headers = ['year', ...selectedProvinces];
    const csvData = filteredData.map(e => [
      e.year,
      ...selectedProvinces.map(province => e[province] || 0)
    ]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filipino_emigrants_origin_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- CSV Import Logic ---
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
        const previewData = results.data.slice(0, 5).map(row => {
          const processed = { year: row.year };
          originNames.forEach(province => {
            processed[province] = Number((row[province] || '0').replace(/,/g, ''));
          });
          return processed;
        });
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
          const records = results.data.map(row => {
            const record = { year: Number(row.year) };
            originNames.forEach(province => {
              record[province] = Number((row[province] || '0').replace(/,/g, ''));
            });
            return record;
          });
          
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
    const headers = ['year', ...originNames.slice(0, 10), '...'];
    const sampleRow1 = ['1988', ...originNames.slice(0, 10).map(() => '0'), '...'];
    const sampleRow2 = ['1989', ...originNames.slice(0, 10).map(() => '0'), '...'];
    const csvContent = [
      headers.join(','),
      sampleRow1.join(','),
      sampleRow2.join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emigrants_origin_data_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Table Data ---
  const filteredData = emigrants.filter(e => {
    // Filter by year
    const yearMatch = selectedYear === 'All' || e.year === Number(selectedYear);

    // Filter by checked provinces (at least one checked province has value > 0)
    const provinceMatch = selectedProvinces.some(province => (e[province] || 0) > 0);

    // Search logic: match year
    const search = searchTerm.trim().toLowerCase();
    const searchMatch = !search || String(e.year).includes(search);

    return yearMatch && provinceMatch && searchMatch;
  });

  const sortedData = [...filteredData].sort((a, b) =>
    yearSort === 'desc' ? b.year - a.year : a.year - b.year
  );

  // --- Component Props ---
  const navbarProps = {
    searchTerm,
    setSearchTerm,
    selectedYear,
    setSelectedYear,
    years: [...new Set(emigrants.map(e => e.year))].sort((a, b) => b - a),
    selectedProvinces,
    setSelectedProvinces,
    setShowAddModal: (show) => {
      if (show) {
        setFormData(initialForm);
        setIsEditing(false);
      }
      setShowAddModal(show);
    },
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
    selectedProvinces
  };

  const addModalProps = {
    isEditing,
    formData,
    setFormData,
    handleSubmit,
    setShowAddModal: (show) => {
      setShowAddModal(show);
      if (!show) {
        setIsEditing(false);
        setFormData(initialForm);
      }
    }
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
      <ProvinceTopNavbar {...navbarProps} />
      <ProvinceKpiCards
        grandTotal={grandTotal}
        topProvinceName={topProvinceName}
        topProvinceTotal={topProvinceTotal}
        lastYear={lastYear}
        lastYearTotal={lastYearTotal}
        duration={duration}
        totalProvinces={totalProvinces}
      />
      <OriginVisualizations 
        data={filteredData} 
        selectedProvinces={selectedProvinces} 
      />
      <div className="flex-1">
        <ProvinceTable {...tableProps} />
        {showAddModal && <ProvinceAddModal {...addModalProps} />}
        {showImportModal && <ProvinceImportModal {...importModalProps} />}
      </div>
    </div>
  );
}