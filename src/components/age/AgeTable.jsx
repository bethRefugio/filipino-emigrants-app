import React, { useState } from 'react';
import { Edit2, X, Download } from 'lucide-react';

export default function AgeTable({
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
}) {
  
  // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const totalPages = Math.ceil(sortedData.length / recordsPerPage);
  
    // Pagination logic
    const paginatedData = sortedData.slice(
      (currentPage - 1) * recordsPerPage,
      currentPage * recordsPerPage
    );
  
    // Define all possible columns
    const allColumns = [
      { key: '14-below', label: '14-below' },
      { key: '15-19', label: '15-19' },
      { key: '20-24', label: '20-24' },
      { key: '25-29', label: '25-29' },
      { key: '30-34', label: '30-34' },
      { key: '35-39', label: '35-39' },
      { key: '40-44', label: '40-44' },
      { key: '45-49', label: '45-49' },
      { key: '50-54', label: '50-54' },
      { key: '55-59', label: '55-59' },
      { key: '60-64', label: '60-64' },
      { key: '65-69', label: '65-69' },
      { key: '70-above', label: '70-above' },
      { key: 'notReported', label: 'Not Reported' }
    ];
  
    // Only show checked columns
    const visibleColumns = allColumns.filter(col => selectedCategories.includes(col.key));
  
    // Pagination controls
    const Pagination = () => (
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-gray-500">
          Showing {sortedData.length === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1}
          {" - "}
          {Math.min(currentPage * recordsPerPage, sortedData.length)}
          {" of "}
          {sortedData.length} records
        </div>
        <div className="flex gap-1">
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            {"<<"}
          </button>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            {"<"}
          </button>
          <span className="px-2 py-1 text-xs">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            {">"}
          </button>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            {">>"}
          </button>
        </div>
      </div>
    );
  
    // Reset to first page if data changes and current page is out of range
    React.useEffect(() => {
      if (currentPage > totalPages) setCurrentPage(1);
    }, [sortedData, totalPages, currentPage]);
  
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Civil Status ({sortedData.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download size={18} />
                Export CSV
              </button>
              <button
                onClick={() => setYearSort(yearSort === 'desc' ? 'asc' : 'desc')}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                {yearSort === 'desc' ? 'Newest First' : 'Oldest First'}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedRows.length === 0}
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                  selectedRows.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <X size={18} />
                Delete Selected
              </button>
            </div>
          </div>
  
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === paginatedData.length &&
                        paginatedData.length > 0 &&
                        paginatedData.every(e => selectedRows.includes(e.id))
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          // Add all ids from current page that aren't already selected
                          const newIds = paginatedData
                            .map(e => e.id)
                            .filter(id => !selectedRows.includes(id));
                          setTimeout(() => {
                            newIds.forEach(id => handleRowSelect(id));
                          }, 0);
                        } else {
                          // Remove all ids from current page
                          paginatedData.forEach(e => {
                            if (selectedRows.includes(e.id)) handleRowSelect(e.id);
                          });
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Year
                  </th>
                  {visibleColumns.map(col => (
                    <th
                      key={col.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
  
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((e) => {
                  // Only sum visible categories for the total
                  const total = visibleColumns.reduce(
                    (sum, col) => sum + (e[col.key] || 0),
                    0
                  );
  
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-2 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(e.id)}
                          onChange={() => handleRowSelect(e.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {e.year}
                      </td>
                      {visibleColumns.map(col => (
                        <td
                          key={col.key}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                        >
                          {(e[col.key] || 0).toLocaleString()}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                        {total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(e)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
  
            {sortedData.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No records found. Add some data to get started!</p>
              </div>
            )}
          </div>
          <Pagination />
        </div>
      </div>
    );
  }