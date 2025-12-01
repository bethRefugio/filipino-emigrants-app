import Papa from 'papaparse';

export const parseCSVPreview = (file, setCsvPreview) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const previewData = results.data.slice(0, 5).map(row => ({
        year: row.year,
        single: Number((row.single || '0').replace(/,/g, '')),
        married: Number((row.married || '0').replace(/,/g, '')),
        widower: Number((row.widower || '0').replace(/,/g, '')),
        separated: Number((row.separated || '0').replace(/,/g, '')),
        divorced: Number((row.divorced || '0').replace(/,/g, '')),
        notReported: Number((row.notReported || '0').replace(/,/g, ''))
      }));
      setCsvPreview(previewData);
    }
  });
};

export const handleImportCSV = async (csvFile, addEmigrant, fetchData, setCsvFile, setCsvPreview, setShowImportModal, setImporting) => {
  setImporting(true);
  Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const records = results.data.map(row => ({
        year: Number(row.year),
        single: Number((row.single || '0').replace(/,/g, '')),
        married: Number((row.married || '0').replace(/,/g, '')),
        widower: Number((row.widower || '0').replace(/,/g, '')),
        separated: Number((row.separated || '0').replace(/,/g, '')),
        divorced: Number((row.divorced || '0').replace(/,/g, '')),
        notReported: Number((row.notReported || '0').replace(/,/g, ''))
      }));
      for (const record of records) {
        await addEmigrant(record);
      }
      setCsvFile(null);
      setCsvPreview([]);
      setShowImportModal(false);
      fetchData();
      setImporting(false);
    }
  });
};

export const downloadSampleCSV = () => {
  const sampleCSV = `year,single,married,widower,separated,divorced,notReported
2024,15000,28000,1200,850,920,450
2023,14500,27500,1150,820,900,480
2022,14000,27000,1100,800,880,500`;
  const blob = new Blob([sampleCSV], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'emigrants_sample.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};