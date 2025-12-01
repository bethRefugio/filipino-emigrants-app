import { X } from 'lucide-react';
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
        <div className="bg-white rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Import CSV</h3>
            <button onClick={() => setShowImportModal(false)} className="p-1 hover:bg-gray-100 rounded">
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
            <strong>Required columns:</strong> year, male, female
            <br />
            <span className="text-blue-600">Example: 2024,15000,28000</span>
        </div>
        {csvPreview.length > 0 && (
            <div className="mb-4">
            <h4 className="font-semibold mb-2">Preview (First 5 Rows)</h4>
            <table className="w-full text-xs border">
                <thead>
                <tr>
                    <th>Year</th>
                    <th>Male</th>
                    <th>Female</th>
                </tr>
                </thead>
                <tbody>
                {csvPreview.map((row, idx) => (
                    <tr key={idx}>
                    <td>{row.year}</td>
                    <td>{row.male}</td>
                    <td>{row.female}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        <div className="flex gap-3 mt-6">
            <button
            onClick={handleImportCSV}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            disabled={importing}
            >
            {importing ? 'Importing...' : 'Import'}
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
            className="text-blue-600 hover:text-blue-800"
            >
            Download Sample CSV
            </button>
        </div>
        </div>
    </div>
  );
}