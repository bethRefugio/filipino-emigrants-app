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
  const requiredColumns = [
    'year',
    'professional_technical_related',
    'managerial_executive_admin',
    'clerical_workers',
    'sales_workers',
    'service_workers',
    'agri_animal_forestry_fishermen',
    'production_transport_equipment_laborers',
    'armed_forces',
    'housewives',
    'retirees',
    'students',
    'minors_below_7',
    'out_of_school_youth',
    'refugees',
    'no_occupation_reported'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-4xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-xs">
          <div className="font-semibold mb-2">Required columns</div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {requiredColumns.map((col) => (
              <div key={col} className="flex items-start gap-2">
                <span className="w-2 h-2 mt-1 bg-blue-600 rounded-sm flex-shrink-0" />
                <span className="break-words">{col}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs">
            <div className="font-semibold mb-1">Example</div>
            <div className="text-blue-600 whitespace-pre-wrap break-words bg-white/50 p-2 rounded">
              {"\n"}2024,1500,800,600,700,900,1200,1300,200,400,300,1100,50,250,30,90
            </div>
          </div>
        </div>

        {csvPreview.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Preview (First 5 Rows)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Year</th>
                    <th className="px-2 py-1">Professional, Technical & Related</th>
                    <th className="px-2 py-1">Managerial, Executive & Admin</th>
                    <th className="px-2 py-1">Clerical Workers</th>
                    <th className="px-2 py-1">Sales Workers</th>
                    <th className="px-2 py-1">Service Workers</th>
                    <th className="px-2 py-1">Agri/Animal/Forestry/Fishermen</th>
                    <th className="px-2 py-1">Production/Transport/Equipment/Laborers</th>
                    <th className="px-2 py-1">Armed Forces</th>
                    <th className="px-2 py-1">Housewives</th>
                    <th className="px-2 py-1">Retirees</th>
                    <th className="px-2 py-1">Students</th>
                    <th className="px-2 py-1">Minors (Below 7)</th>
                    <th className="px-2 py-1">Out of School Youth</th>
                    <th className="px-2 py-1">Refugees</th>
                    <th className="px-2 py-1">No Occupation Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1">{row.year}</td>
                      <td className="px-2 py-1">{row.professional_technical_related}</td>
                      <td className="px-2 py-1">{row.managerial_executive_admin}</td>
                      <td className="px-2 py-1">{row.clerical_workers}</td>
                      <td className="px-2 py-1">{row.sales_workers}</td>
                      <td className="px-2 py-1">{row.service_workers}</td>
                      <td className="px-2 py-1">{row.agri_animal_forestry_fishermen}</td>
                      <td className="px-2 py-1">{row.production_transport_equipment_laborers}</td>
                      <td className="px-2 py-1">{row.armed_forces}</td>
                      <td className="px-2 py-1">{row.housewives}</td>
                      <td className="px-2 py-1">{row.retirees}</td>
                      <td className="px-2 py-1">{row.students}</td>
                      <td className="px-2 py-1">{row.minors_below_7}</td>
                      <td className="px-2 py-1">{row.out_of_school_youth}</td>
                      <td className="px-2 py-1">{row.refugees}</td>
                      <td className="px-2 py-1">{row.no_occupation_reported}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
