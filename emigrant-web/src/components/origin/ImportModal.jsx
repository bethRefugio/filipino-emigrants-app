import { X } from 'lucide-react';
import { originNames } from './originNames';
import React from 'react';

export default function ImportModal({
  csvFile,
  setCsvFile,
  csvPreview,
  setCsvPreview,
  importing,
  handleImportCSV,
  setShowImportModal,
  downloadSampleCSV,
  handleFileChange
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90vw] max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Import Province CSV Data</h3>
          <button 
            onClick={() => setShowImportModal(false)} 
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <input
            id="csv-import-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs">
          <strong>Required CSV format:</strong>
          <div className="mt-2 font-mono text-xs">
            year,ILOCOS NORTE,ILOCOS SUR,LA UNION,PANGASINAN,...
          </div>
          <p className="mt-2">First column must be "year", followed by province names exactly as shown</p>
        </div>
        
        {csvPreview.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Preview (First 5 Rows)</h4>
            <div className="overflow-x-auto border rounded-lg max-h-96">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="border px-2 py-1 text-left">Year</th>
                    {originNames.slice(0, 10).map((province) => (
                      <th key={province} className="border px-2 py-1 text-left">{province}</th>
                    ))}
                    <th className="border px-2 py-1 text-left">... ({originNames.length - 10} more)</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border px-2 py-1">{row.year}</td>
                      {originNames.slice(0, 10).map((province) => (
                        <td key={province} className="border px-2 py-1">
                          {row[province] ?? '0'}
                        </td>
                      ))}
                      <td className="border px-2 py-1 text-gray-400">...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Showing first 10 provinces. Total provinces in dataset: {originNames.length}
            </p>
          </div>
        )}
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleImportCSV}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            disabled={importing || !csvFile}
          >
            {importing ? 'Importing...' : 'Import Data'}
          </button>
          <button
            onClick={() => setShowImportModal(false)}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        
        <div className="mt-4 text-xs">
          <button
            onClick={downloadSampleCSV}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Download Sample CSV Template
          </button>
        </div>
      </div>
    </div>
  );
}