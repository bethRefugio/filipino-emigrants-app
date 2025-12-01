import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/education/TopNavbar';
import EducationTable from '../components/education/EducationTable';
import KpiCards from '../components/education/KpiCards';
import AddModal from '../components/AddModal';
import EditModal from '../components/EditModal';
import ImportModal from '../components/education/ImportModal';
import Visualizations from '../components/education/Visualizations';
import { getEmigrants, addEmigrant, updateEmigrant, deleteEmigrant } from '../services/education';
import Papa from 'papaparse';

export default function EducationPage() {
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
    notOfSchoolingAge: '',
    noFormalEducation: '',
    elementaryLevel: '',
    elementaryGraduate: '',
    highSchoolLevel: '',
    highSchoolGraduate: '',
    vocationalLevel: '',
    vocationalGraduate: '',
    collegeLevel: '',
    collegeGraduate: '',
    postGraduateLevel: '',
    postGraduate: '',
    nonFormalEducation: '',
    notReported: ''
  });

  const initialForm = {
    year: '',
    notOfSchoolingAge: '',
    noFormalEducation: '',
    elementaryLevel: '',
    elementaryGraduate: '',
    highSchoolLevel: '',
    highSchoolGraduate: '',
    vocationalLevel: '',
    vocationalGraduate: '',
    collegeLevel: '',
    collegeGraduate: '',
    postGraduateLevel: '',
    postGraduate: '',
    nonFormalEducation: '',
    notReported: ''
  };

  const educationCategories = [
    'notOfSchoolingAge',
    'noFormalEducation',
    'elementaryLevel',
    'elementaryGraduate',
    'highSchoolLevel',
    'highSchoolGraduate',
    'vocationalLevel',
    'vocationalGraduate',
    'collegeLevel',
    'collegeGraduate',
    'postGraduateLevel',
    'postGraduate',
    'nonFormalEducation',
    'notReported'
  ];
  const [selectedCategories, setSelectedCategories] = useState([...educationCategories]);

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
  const grandTotal = emigrants.reduce(
    (sum, e) =>
      sum +
      (e.notOfSchoolingAge || 0) +
      (e.noFormalEducation || 0) +
      (e.elementaryLevel || 0) +
      (e.elementaryGraduate || 0) +
      (e.highSchoolLevel || 0) +
      (e.highSchoolGraduate || 0) +
      (e.vocationalLevel || 0) +
      (e.vocationalGraduate || 0) +
      (e.collegeLevel || 0) +
      (e.collegeGraduate || 0) +
      (e.postGraduateLevel || 0) +
      (e.postGraduate || 0) +
      (e.nonFormalEducation || 0) +
      (e.notReported || 0),
    0
  );

  const totals = emigrants.reduce(
    (acc, cur) => {
      educationCategories.forEach(cat => {
        acc[cat] += cur[cat] || 0;
      });
      return acc;
    },
    Object.fromEntries(educationCategories.map(cat => [cat, 0]))
  );

  const topCategory = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategory
    ? topCategory[0].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    : 'N/A';
  const topCategoryTotal = topCategory ? topCategory[1] : 0;

  const years = emigrants.map(e => e.year).filter(Boolean);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const lastYear = maxYear;
  const lastYearTotal = emigrants
    .filter(e => e.year === lastYear)
    .reduce(
      (sum, e) =>
        sum +
        (e.notOfSchoolingAge || 0) +
        (e.noFormalEducation || 0) +
        (e.elementaryLevel || 0) +
        (e.elementaryGraduate || 0) +
        (e.highSchoolLevel || 0) +
        (e.highSchoolGraduate || 0) +
        (e.vocationalLevel || 0) +
        (e.vocationalGraduate || 0) +
        (e.collegeLevel || 0) +
        (e.collegeGraduate || 0) +
        (e.postGraduateLevel || 0) +
        (e.postGraduate || 0) +
        (e.nonFormalEducation || 0) +
        (e.notReported || 0),
      0
    );
  const duration = minYear !== Infinity && maxYear !== -Infinity ? `${minYear} - ${maxYear}` : 'N/A';

  // --- CRUD Handlers ---
  const handleAdd = async () => {
    try {
      await addEmigrant({
        year: Number(form.year) || 0,
        notOfSchoolingAge: Number(form.notOfSchoolingAge) || 0,
        noFormalEducation: Number(form.noFormalEducation) || 0,
        elementaryLevel: Number(form.elementaryLevel) || 0,
        elementaryGraduate: Number(form.elementaryGraduate) || 0,
        highSchoolLevel: Number(form.highSchoolLevel) || 0,
        highSchoolGraduate: Number(form.highSchoolGraduate) || 0,
        vocationalLevel: Number(form.vocationalLevel) || 0,
        vocationalGraduate: Number(form.vocationalGraduate) || 0,
        collegeLevel: Number(form.collegeLevel) || 0,
        collegeGraduate: Number(form.collegeGraduate) || 0,
        postGraduateLevel: Number(form.postGraduateLevel) || 0,
        postGraduate: Number(form.postGraduate) || 0,
        nonFormalEducation: Number(form.nonFormalEducation) || 0,
        notReported: Number(form.notReported) || 0
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
      notOfSchoolingAge: record.notOfSchoolingAge?.toString() || '',
      noFormalEducation: record.noFormalEducation?.toString() || '',
      elementaryLevel: record.elementaryLevel?.toString() || '',
      elementaryGraduate: record.elementaryGraduate?.toString() || '',
      highSchoolLevel: record.highSchoolLevel?.toString() || '',
      highSchoolGraduate: record.highSchoolGraduate?.toString() || '',
      vocationalLevel: record.vocationalLevel?.toString() || '',
      vocationalGraduate: record.vocationalGraduate?.toString() || '',
      collegeLevel: record.collegeLevel?.toString() || '',
      collegeGraduate: record.collegeGraduate?.toString() || '',
      postGraduateLevel: record.postGraduateLevel?.toString() || '',
      postGraduate: record.postGraduate?.toString() || '',
      nonFormalEducation: record.nonFormalEducation?.toString() || '',
      notReported: record.notReported?.toString() || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await updateEmigrant(editingRecord.id, {
        year: Number(form.year) || 0,
        notOfSchoolingAge: Number(form.notOfSchoolingAge) || 0,
        noFormalEducation: Number(form.noFormalEducation) || 0,
        elementaryLevel: Number(form.elementaryLevel) || 0,
        elementaryGraduate: Number(form.elementaryGraduate) || 0,
        highSchoolLevel: Number(form.highSchoolLevel) || 0,
        highSchoolGraduate: Number(form.highSchoolGraduate) || 0,
        vocationalLevel: Number(form.vocationalLevel) || 0,
        vocationalGraduate: Number(form.vocationalGraduate) || 0,
        collegeLevel: Number(form.collegeLevel) || 0,
        collegeGraduate: Number(form.collegeGraduate) || 0,
        postGraduateLevel: Number(form.postGraduateLevel) || 0,
        postGraduate: Number(form.postGraduate) || 0,
        nonFormalEducation: Number(form.nonFormalEducation) || 0,
        notReported: Number(form.notReported) || 0
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
    const headers = [
      'Year',
      'Not of Schooling Age',
      'No Formal Education',
      'Elementary Level',
      'Elementary Graduate',
      'High School Level',
      'High School Graduate',
      'Vocational Level',
      'Vocational Graduate',
      'College Level',
      'College Graduate',
      'Post Graduate Level',
      'Post Graduate',
      'Non-Formal Education',
      'Not Reported'
    ];

    const csvData = filteredData.map(e => [
      e.year,
      e.notOfSchoolingAge || 0,
      e.noFormalEducation || 0,
      e.elementaryLevel || 0,
      e.elementaryGraduate || 0,
      e.highSchoolLevel || 0,
      e.highSchoolGraduate || 0,
      e.vocationalLevel || 0,
      e.vocationalGraduate || 0,
      e.collegeLevel || 0,
      e.collegeGraduate || 0,
      e.postGraduateLevel || 0,
      e.postGraduate || 0,
      e.nonFormalEducation || 0,
      e.notReported || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'educational_attainment_data.csv';
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
        const previewData = results.data.slice(0, 5).map((row, idx) => {
          const obj = { row: idx + 1, year: row.year };
          educationCategories.forEach(cat => {
            obj[cat] = Number((row[cat] || '0').replace(/,/g, ''));
          });
          return obj;
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
            const obj = { year: Number(row.year) };
            educationCategories.forEach(cat => {
              obj[cat] = Number((row[cat] || '0').replace(/,/g, ''));
            });
            return obj;
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
    const sampleCSV = `year,notOfSchoolingAge,noFormalEducation,elementaryLevel,elementaryGraduate,highSchoolLevel,highSchoolGraduate,vocationalLevel,vocationalGraduate,collegeLevel,collegeGraduate,postGraduateLevel,postGraduate,nonFormalEducation,notReported
2024,1200,800,2500,3000,2200,2700,900,1100,1800,2000,500,650,400,150
2023,1150,780,2400,2900,2100,2600,850,1050,1700,1950,480,600,380,140
2022,1100,750,2300,2800,2050,2550,800,1000,1600,1900,460,580,360,130`;
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emigrants_education_data_sample.csv';
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
      <Visualizations data={filteredData} selectedCategories={selectedCategories} />
      <div className="flex-1">
        <EducationTable {...tableProps} />
        {showAddModal && <AddModal {...addModalProps} />}
        {showEditModal && <EditModal {...editModalProps} />}
        {showImportModal && <ImportModal {...importModalProps} />}
      </div>
    </div>
  );
}