import React, { useState } from 'react';
import { addEmigrant } from './services/origin'; // Update with your service path
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { originNames } from './originNames'; 

function ProvinceUploadCSV() {
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
        const headers = lines[0].split(',').map(h => h.trim());
        const records = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= headers.length) {
            const record = {};
            headers.forEach((header, idx) => {
              if (header.toLowerCase() === 'year') {
                record.year = Number(values[idx]) || 0;
              } else if (originNames.includes(header)) {
                record[header] = Number(values[idx]) || 0;
              }
            });
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

  const downloadSampleCSV = () => {
    const headers = ['year', ...originNames].join(',');
    const sampleRow1 = ['1988', ...originNames.map(() => '0')].join(',');
    const sampleRow2 = ['1989', ...originNames.map(() => '0')].join(',');
    const csvContent = `${headers}\n${sampleRow1}\n${sampleRow2}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'province_emigrants_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Upload Province CSV Data</h1>
              <p className="text-sm text-gray-500">Import Filipino emigrants data by province from CSV file</p>
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
              Your CSV file should have the following structure:
            </p>
            <div className="bg-white p-3 rounded text-xs text-gray-800 overflow-x-auto">
              <div className="font-mono">
                <div className="mb-1">year,ILOCOS NORTE,ILOCOS SUR,LA UNION,...</div>
                <div className="text-gray-600">1988,1330,785,864,...</div>
                <div className="text-gray-600">1989,1544,823,789,...</div>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Total provinces: {originNames.length}
            </p>
          </div>

          {/* Preview Table */}
          {preview.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Preview (First 5 Rows, First 10 Provinces)</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      {originNames.slice(0, 10).map(province => (
                        <th key={province} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {province}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">...</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-700">{row.year}</td>
                        {originNames.slice(0, 10).map(province => (
                          <td key={province} className="px-4 py-2 text-gray-700">
                            {row[province] ?? ''}
                          </td>
                        ))}
                        <td className="px-4 py-2 text-gray-400">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Showing first 10 of {originNames.length} provinces
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
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
            
            <button
              onClick={downloadSampleCSV}
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 flex items-center gap-2"
            >
              <FileText size={20} />
              Download Sample CSV
            </button>
          </div>

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
        </div>
      </div>
    </div>
  );
}

export default ProvinceUploadCSV;