import React, { useState } from 'react';
import { addEmigrant } from './services/gender';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

function downloadCSV() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [preview, setPreview] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setMessage('');
      parseCSVPreview(selectedFile);
    } else {
      setMessage('Please select a valid CSV file');
      setMessageType('error');
      setFile(null);
      setPreview([]);
    }
  };

  const parseCSVPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Preview first 5 rows
      const previewData = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        return obj;
      });
      
      setPreview(previewData);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Parse CSV
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const records = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (values.length >= headers.length) {
            const record = {
              year: Number(values[headers.indexOf('year')]) || 0,
              male: Number(values[headers.indexOf('male')]) || 0,
              female: Number(values[headers.indexOf('female')]) || 0
            };
            
            records.push(record);
          }
        }

        // Upload to Firebase
        let successCount = 0;
        for (const record of records) {
          try {
            await addEmigrant(record);
            successCount++;
          } catch (error) {
            console.error('Error adding record:', error);
          }
        }

        setMessage(`Successfully uploaded ${successCount} of ${records.length} records!`);
        setMessageType('success');
        setFile(null);
        setPreview([]);
        
        // Reset file input
        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) fileInput.value = '';

      } catch (error) {
        console.error('Error parsing CSV:', error);
        setMessage('Error parsing CSV file. Please check the format.');
        setMessageType('error');
      }

      setUploading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Upload CSV Data</h1>
              <p className="text-sm text-gray-500">Import Filipino emigrants data from CSV file</p>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label 
              htmlFor="csv-file-input"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="w-12 h-12 mb-4 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV files only</p>
                {file && (
                  <p className="mt-3 text-sm font-medium text-blue-600">
                    Selected: {file.name}
                  </p>
                )}
              </div>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* CSV Format Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Required CSV Format:</h3>
            <p className="text-sm text-blue-700 mb-2">
              Your CSV file should have the following columns (case-insensitive):
            </p>
            <code className="block bg-white p-3 rounded text-xs text-gray-800 overflow-x-auto">
              year,male, female
            </code>
            <p className="text-xs text-blue-600 mt-2">
              Example: 2024,15000,28000
            </p>
          </div>

          {/* Preview Table */}
          {preview.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Preview (First 5 Rows)</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map(header => (
                        <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-4 py-2 text-gray-700">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
              !file || uploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload to Database
              </>
            )}
          </button>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
              messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle size={20} className="flex-shrink-0" />
              ) : (
                <AlertCircle size={20} className="flex-shrink-0" />
              )}
              <p className="text-sm">{message}</p>
            </div>
          )}

          {/* Download Sample CSV */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-800 mb-2">Need a template?</h3>
            <button
              onClick={() => {
                const sampleCSV = `year,male,female
                        2024,15000,28000,
                        2023,14500,27500
                        2022,14000,27000`;
                const blob = new Blob([sampleCSV], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'emigrants_gender_data_sample.csv';
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Download Sample CSV Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default downloadCSV;