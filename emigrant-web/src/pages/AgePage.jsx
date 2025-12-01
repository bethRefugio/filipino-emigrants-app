import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/age/TopNavbar';
import AgeTable from '../components/age/AgeTable';
import KpiCards from '../components/age/KpiCards';
import AddModal from '../components/AddModal';
import EditModal from '../components/EditModal';
import ImportModal from '../components/age/ImportModal';
import Visualizations from '../components/age/Visualizations';
import { getEmigrants, addEmigrant, updateEmigrant, deleteEmigrant } from '../services/age';
import Papa from 'papaparse';

const ageCategories = [
  '14-below', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44',
  '45-49', '50-54', '55-59', '60-64', '65-69', '70-above', 'notReported'
];

const initialForm = {
  year: '',
  '14-below': '',
  '15-19': '',
  '20-24': '',
  '25-29': '',
  '30-34': '',
  '35-39': '',
  '40-44': '',
  '45-49': '',
  '50-54': '',
  '55-59': '',
  '60-64': '',
  '65-69': '',
  '70-above': '',
  notReported: ''
};

export default function AgePage() {
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
  const [selectedCategories, setSelectedCategories] = useState([...ageCategories]);
  const [form, setForm] = useState(initialForm);
  const [yearSort, setYearSort] = useState('desc');

  // Fetch data from backend
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
    // eslint-disable-next-line
  }, []);

  // KPI Calculations
  const years = emigrants.map(e => e.year).filter(Boolean);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const lastYear = maxYear;
  const duration = minYear !== Infinity && maxYear !== -Infinity ? `${minYear} - ${maxYear}` : 'N/A';

  // 1. Grand Total
  const grandTotal = emigrants.reduce(
    (sum, e) =>
      sum +
      ageCategories.reduce((catSum, cat) => catSum + (e[cat] || 0), 0),
    0
  );

  // 2. Totals per category
  const totals = emigrants.reduce(
    (acc, cur) => {
      ageCategories.forEach(cat => {
        acc[cat] = (acc[cat] || 0) + (cur[cat] || 0);
      });
      return acc;
    },
    {}
  );

  // 3. Top Category
  const topCategory = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategory
    ? topCategory[0]
    : 'N/A';
  const topCategoryTotal = topCategory ? topCategory[1] : 0;

  // 4. Last Year Total
  const lastYearTotal = emigrants
    .filter(e => e.year === lastYear)
    .reduce(
      (sum, e) =>
        sum +
        ageCategories.reduce((catSum, cat) => catSum + (e[cat] || 0), 0),
      0
    );

  // --- Filtering logic (like CivilStatusPage) ---
  const filteredData = emigrants.filter(e => {
    // Filter by year
    const yearMatch = selectedYear === 'All' || e.year === Number(selectedYear);

    // Filter by checked categories (at least one checked category has value > 0)
    const categoryMatch = selectedCategories.some(cat => (e[cat] || 0) > 0);

    // Search logic: match year or any visible category value
    const search = searchTerm.trim().toLowerCase();
    const searchMatch =
      !search ||
      String(e.year).includes(search) ||
      selectedCategories.some(cat =>
        String(e[cat] || '')
          .toLowerCase()
          .includes(search)
        );

    return yearMatch && categoryMatch && searchMatch;
  });

  const sortedData = [...filteredData].sort((a, b) =>
    yearSort === 'desc' ? b.year - a.year : a.year - b.year
  );

  // --- CRUD Handlers ---
  const handleAdd = async () => {
    try {
      await addEmigrant({
        year: Number(form.year) || 0,
        ...Object.fromEntries(ageCategories.map(cat => [cat, Number(form[cat]) || 0]))
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
      ...Object.fromEntries(ageCategories.map(cat => [cat, record[cat]?.toString() || '']))
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await updateEmigrant(editingRecord.id, {
        year: Number(form.year) || 0,
        ...Object.fromEntries(ageCategories.map(cat => [cat, Number(form[cat]) || 0]))
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

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Year', ...ageCategories];
    const csvData = filteredData.map(e => [
      e.year,
      ...ageCategories.map(cat => e[cat] || 0)
    ]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filipino_emigrants_age_data.csv';
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
      console.log('CSV Headers:', Object.keys(results.data[0])); // Debug: Check headers
      console.log('Sample Row:', results.data[0]); // Debug: Check first row
      
      // Remove thousands separators and convert to numbers
      const previewData = results.data.slice(0, 5).map((row) => {
        const parsedRow = { year: Number(row.year || 0) };
        
        ageCategories.forEach(cat => {
          const value = row[cat];
          parsedRow[cat] = value ? Number(String(value).replace(/,/g, '')) : 0;
        });
        
        return parsedRow;
      });
      
      console.log('Parsed Preview:', previewData); // Debug: Check parsed data
      setCsvPreview(previewData);
    },
    error: (error) => {
      console.error('Parse error:', error);
      alert('Error parsing CSV file');
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
        console.log('Import - First Row:', results.data[0]); // Debug
        
        const records = results.data
          .filter(row => row.year) // Filter out empty rows
          .map(row => {
            const record = { year: Number(row.year || 0) };
            
            ageCategories.forEach(cat => {
              const value = row[cat];
              record[cat] = value ? Number(String(value).replace(/,/g, '')) : 0;
            });
            
            return record;
          });
        
        console.log('Records to import:', records); // Debug
        
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
    },
    error: (error) => {
      console.error('Parse error:', error);
      alert('Error parsing CSV file');
      setImporting(false);
    }
  });
};

  const downloadSampleCSV = () => {
    const sampleCSV = `year,14-below,15-19,20-24,25-29,30-34,35-39,40-44,45-49,50-54,55-59,60-64,65-69,70-above,notReported
2024,15000,28000,1200,850,920,450,1323,3232,212,332,4345,1234,789,65
2023,14500,27500,1150,820,900,480,1200,3000,200,300,4000,1200,700,60
2022,14000,27000,1100,800,880,500,1100,2800,180,280,3700,1100,600,55`;
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emigrants_age_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Modal Props ---
  const navbarProps = {
    searchTerm,
    setSearchTerm,
    selectedYear,
    setSelectedYear,
    years: [...new Set(emigrants.map(e => e.year))].sort((a, b) => b - a),
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

  const addModalProps = { form, setForm, handleAdd, setShowAddModal };
  const editModalProps = { form, setForm, handleUpdate, setShowEditModal };
  const importModalProps = {
    csvFile, setCsvFile, csvPreview, setCsvPreview, importing,
    handleImportCSV, setShowImportModal, downloadSampleCSV, handleFileChange
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
      <KpiCards
        grandTotal={grandTotal}
        topCategoryName={topCategoryName}
        topCategoryTotal={topCategoryTotal}
        lastYear={lastYear}
        lastYearTotal={lastYearTotal}
        duration={duration}
      />
      <Visualizations data={filteredData} selectedCategories={selectedCategories} />
      <div className="flex-1">
        <AgeTable {...tableProps} />
        {showAddModal && <AddModal {...addModalProps} />}
        {showEditModal && <EditModal {...editModalProps} />}
        {showImportModal && <ImportModal {...importModalProps} />}
      </div>
    </div>
  );
}