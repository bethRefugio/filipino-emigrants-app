// Export age table data to CSV
export function exportAgeCSV(sortedData = []) {
  const ageGroups = [
    '14-below','15-19','20-24','25-29','30-34','35-39',
    '40-44','45-49','50-54','55-59','60-64','65-69','70-above','notReported'
  ];

  const headers = ['year', ...ageGroups];
  const rows = (sortedData || []).map(r => {
    return [r.year, ...ageGroups.map(g => Number(r[g] || 0))];
  });

  const csvLines = [headers.join(',')].concat(rows.map(row => row.join(',')));
  const csvContent = csvLines.join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `age_data_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default exportAgeCSV;