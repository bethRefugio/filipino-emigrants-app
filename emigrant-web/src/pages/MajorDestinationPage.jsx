import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/major-destination/TopNavbar';
import KpiCards from '../components/major-destination/KpiCards';
import MajorDestinationTable from '../components/major-destination/MajorDestinationTable';
import AddModal from '../components/AddModal';
import EditModal from '../components/EditModal';
import ImportModal from '../components/major-destination/ImportModal';
import FlowMap from '../components/major-destination/FlowMap';
import { getEmigrants, addEmigrant, updateEmigrant, deleteEmigrant } from '../services/major-destination';
import Papa from 'papaparse';
import { useActionData } from 'react-router-dom';

export default function MajorDestinationPage() {
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
  const [form, setForm] = useState({
    year: '',
    usa: '',
    canada: '',
    japan: '',
    australia: '',
    italy: '',
    new_zealand: '',
    united_kingdom: '',
    germany: '',
    south_korea: '',
    spain: '',
    others: ''
  });

  const initialForm = {
    year: '',
    usa: '',
    canada: '',
    japan: '',
    australia: '',
    italy: '',
    new_zealand: '',
    united_kingdom: '',
    germany: '',
    south_korea: '',
    spain: '',
    others: ''  
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

  const majorDestinationCategories = ['usa', 'canada', 'japan', 'australia', 'italy', 'new_zealand', 'united_kingdom', 'germany', 'south_korea', 'spain', 'others'];
  const [selectedCategories, setSelectedCategories] = useState([...majorDestinationCategories]);

  // --- KPI Calculations ---
  const grandTotal = emigrants.reduce(
    (sum, e) => sum + (e.usa || 0) + (e.canada || 0) + (e.japan || 0) + (e.australia || 0) + (e.italy || 0) + (e.new_zealand || 0) + (e.united_kingdom || 0) + (e.germany || 0) + (e.south_korea || 0) + (e.spain || 0) + (e.others || 0),
    0
  );

  const totals = emigrants.reduce(
    (acc, cur) => {
      acc.usa += cur.usa || 0;
      acc.canada += cur.canada || 0;
      acc.japan += cur.japan || 0;
      acc.australia += cur.australia || 0;
      acc.italy += cur.italy || 0;
      acc.new_zealand += cur.new_zealand || 0;
      acc.united_kingdom += cur.united_kingdom || 0;
      acc.germany += cur.germany || 0;  
      acc.south_korea += cur.south_korea || 0;
      acc.spain += cur.spain || 0;
      acc.others += cur.others || 0;
      return acc;
    },
    { usa: 0, canada: 0, japan: 0, australia: 0, italy: 0, new_zealand: 0, united_kingdom: 0, germany: 0, south_korea: 0, spain: 0, others: 0 }
  );

  const topCategory = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategory
    ? topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1)
    : 'N/A';
  const topCategoryTotal = topCategory ? topCategory[1] : 0;

  const years = emigrants.map(e => e.year).filter(Boolean);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const lastYear = maxYear;
  const lastYearTotal = emigrants
    .filter(e => e.year === lastYear)
    .reduce(
      (sum, e) => sum + (e.usa || 0) + (e.canada || 0) + (e.japan || 0) + (e.australia || 0) + (e.italy || 0) + (e.new_zealand || 0) + (e.united_kingdom || 0) + (e.germany || 0) + (e.south_korea || 0) + (e.spain || 0) + (e.others || 0),
      0
    );
  const duration = minYear !== Infinity && maxYear !== -Infinity ? `${minYear} - ${maxYear}` : 'N/A';

  // --- CRUD Handlers ---
  const handleAdd = async () => {
    try {
      await addEmigrant({
        year: Number(form.year) || 0,
        usa: Number(form.usa) || 0,
        canada: Number(form.canada) || 0,
        japan: Number(form.japan) || 0,
        australia: Number(form.australia) || 0,
        italy: Number(form.italy) || 0,
        new_zealand: Number(form.new_zealand) || 0,
        united_kingdom: Number(form.united_kingdom) || 0,
        germany: Number(form.germany) || 0, 
        south_korea: Number(form.south_korea) || 0,
        spain: Number(form.spain) || 0,
        others: Number(form.others) || 0
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
      usa: record.usa?.toString() || '',
      canada: record.canada?.toString() || '',
      japan: record.japan?.toString() || '',
      australia: record.australia?.toString() || '',
      italy: record.italy?.toString() || '',
      new_zealand: record.new_zealand?.toString() || '',
      united_kingdom: record.united_kingdom?.toString() || '',
      germany: record.germany?.toString() || '',
      south_korea: record.south_korea?.toString() || '',
      spain: record.spain?.toString() || '',
      others: record.others?.toString() || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await updateEmigrant(editingRecord.id, {
        year: Number(form.year) || 0,
        usa: Number(form.usa) || 0,
        canada: Number(form.canada) || 0,
        japan: Number(form.japan) || 0,
        australia: Number(form.australia) || 0,
        italy: Number(form.italy) || 0,
        new_zealand: Number(form.new_zealand) || 0,
        united_kingdom: Number(form.united_kingdom) || 0,
        germany: Number(form.germany) || 0, 
        south_korea: Number(form.south_korea) || 0,
        spain: Number(form.spain) || 0,
        others: Number(form.others) || 0
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
    const headers = ['Year', 'USA', 'Canada', 'Japan', 'Australia', 'Italy', 'New Zealand', 'United Kingdom', 'Germany', 'South Korea', 'Spain', 'Others'];
    const csvData = filteredData.map(e => [
      e.year,
      e.usa || 0,
      e.canada || 0,
      e.japan || 0,
      e.australia || 0,
      e.italy || 0,
      e.new_zealand || 0,
      e.united_kingdom || 0,
      e.germany || 0,
      e.south_korea || 0,
      e.spain || 0,
      e.others || 0
    ]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filipino_emigrants_major-destination_data.csv';
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
        // Remove thousands separators and convert to numbers
        const previewData = results.data.slice(0, 5).map((row, idx) => ({
          year: row.year,
          usa: Number((row.usa || '0').replace(/,/g, '')),
          canada: Number((row.canada || '0').replace(/,/g, '')),
          japan: Number((row.japan || '0').replace(/,/g, '')),
          australia: Number((row.australia || '0').replace(/,/g, '')),
          italy: Number((row.italy || '0').replace(/,/g, '')),
          new_zealand: Number((row.new_zealand || '0').replace(/,/g, '')),
          united_kingdom: Number((row.united_kingdom || '0').replace(/,/g, '')),
          germany: Number((row.germany || '0').replace(/,/g, '')),
          south_korea: Number((row.south_korea || '0').replace(/,/g, '')),
          spain: Number((row.spain || '0').replace(/,/g, '')),
          others: Number((row.others || '0').replace(/,/g, ''))
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
            usa: Number((row.usa || '0').replace(/,/g, '')),
            canada: Number((row.canada || '0').replace(/,/g, '')),
            japan: Number((row.japan || '0').replace(/,/g, '')),
            australia: Number((row.australia || '0').replace(/,/g, '')),
            italy: Number((row.italy || '0').replace(/,/g, '')),
            new_zealand: Number((row.new_zealand || '0').replace(/,/g, '')),
            united_kingdom: Number((row.united_kingdom || '0').replace(/,/g, '')),
            germany: Number((row.germany || '0').replace(/,/g, '')),
            south_korea: Number((row.south_korea || '0').replace(/,/g, '')),
            spain: Number((row.spain || '0').replace(/,/g, '')),
            others: Number((row.others || '0').replace(/,/g, ''))
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
    const sampleCSV = `year,usa,canada,japan,australia,italy,new_zealand,united_kingdom,germany,south_korea,spain,others
                      2020,12000,8000,5000,3000,2000,1500,4000,2500,3500,1800,2200
                      2019,11500,7500,4800,2900,2100,1400,3900,2400,3300,1700,2000
                      2018,11000,7000,4600,2800,2200,1300,3800,2300,3100,1600,1800`;
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emigrants_major-destination_data_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Table Data ---
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

  const [yearSort, setYearSort] = useState('desc');
  const sortedData = [...filteredData].sort((a, b) =>
    yearSort === 'desc' ? b.year - a.year : a.year - b.year
  );

  // --- Modal Props ---
  const navbarProps = {
    searchTerm,
    setSearchTerm,
    selectedYear,
    setSelectedYear,
    years: [...new Set(emigrants.map(e => e.year))].sort((a, b) => b - a),
    selectedCategories,
    setSelectedCategories,
    setShowAddModal: (show) => {
      if (show) setForm(initialForm);
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
      <KpiCards
        grandTotal={grandTotal}
        topCategoryName={topCategoryName}
        topCategoryTotal={topCategoryTotal}
        lastYear={lastYear}
        lastYearTotal={lastYearTotal}
        duration={duration}
      />
      <FlowMap totals={totals} />
      <div className="flex-1">
        <MajorDestinationTable {...tableProps} />
        {showAddModal && <AddModal {...addModalProps} />}
        {showEditModal && <EditModal {...editModalProps} />}
        {showImportModal && <ImportModal {...importModalProps} />}
      </div>
    </div>
  );
}