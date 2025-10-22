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
    'year','notOfSchoolingAge','noFormalEducation','elementaryLevel','elementaryGraduate',
    'highSchoolLevel','highSchoolGraduate','vocationalLevel','vocationalGraduate','collegeLevel',
    'collegeGraduate','postGraduateLevel','postGraduate','nonFormalEducation','notReported'
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
              {"\n"}2022,1100,750,2300,2800,2050,2550,800,1000,1600,1900,460,580,360,130
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
                    <th className="px-2 py-1">Not of Schooling Age</th>
                    <th className="px-2 py-1">No Formal Education</th>
                    <th className="px-2 py-1">Elementary Level</th>
                    <th className="px-2 py-1">Elementary Graduate</th>
                    <th className="px-2 py-1">High School Level</th>
                    <th className="px-2 py-1">High School Graduate</th>
                    <th className="px-2 py-1">Vocational Level</th>
                    <th className="px-2 py-1">Vocational Graduate</th>
                    <th className="px-2 py-1">College Level</th>
                    <th className="px-2 py-1">College Graduate</th>
                    <th className="px-2 py-1">Post Graduate Level</th>
                    <th className="px-2 py-1">Post Graduate</th>
                    <th className="px-2 py-1">Non-Formal Education</th>
                    <th className="px-2 py-1">Not Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreview.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1">{row.year}</td>
                      <td className="px-2 py-1">{row.notOfSchoolingAge}</td>
                      <td className="px-2 py-1">{row.noFormalEducation}</td>
                      <td className="px-2 py-1">{row.elementaryLevel}</td>
                      <td className="px-2 py-1">{row.elementaryGraduate}</td>
                      <td className="px-2 py-1">{row.highSchoolLevel}</td>
                      <td className="px-2 py-1">{row.highSchoolGraduate}</td>
                      <td className="px-2 py-1">{row.vocationalLevel}</td>
                      <td className="px-2 py-1">{row.vocationalGraduate}</td>
                      <td className="px-2 py-1">{row.collegeLevel}</td>
                      <td className="px-2 py-1">{row.collegeGraduate}</td>
                      <td className="px-2 py-1">{row.postGraduateLevel}</td>
                      <td className="px-2 py-1">{row.postGraduate}</td>
                      <td className="px-2 py-1">{row.nonFormalEducation}</td>
                      <td className="px-2 py-1">{row.notReported}</td>
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