import React, { useEffect, useState } from 'react';
import { AVAILABLE_DATASETS } from '../services/dataService';
import { getAllRuns, getBestRun, deleteModelRun } from '../../services/modelRuns';

function AllModels() {
  const [selectedDataset, setSelectedDataset] = useState('sex');
  const [runs, setRuns] = useState([]);
  const [best, setBest] = useState({ LSTM: null, MLP: null });
  const [selectedRun, setSelectedRun] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedDataset]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [all, bestLSTM, bestMLP] = await Promise.all([
        getAllRuns(selectedDataset),
        getBestRun('LSTM', selectedDataset),
        getBestRun('MLP', selectedDataset)
      ]);
      setRuns(all);
      setBest({ LSTM: bestLSTM, MLP: bestMLP });
      setSelectedRun(null);
      setShowDetails(false);
      setShowConfirm(false);
    } catch (e) {
      console.error(e);
      setError('Failed to load model runs.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

  const pill = (text, color) => (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: 'white',
        background: color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }}
    >
      {text}
    </span>
  );

  const handleRowClick = (run) => {
    setSelectedRun(run);
    setShowDetails(true);
    setShowConfirm(false);
  };

  const handleDownload = () => {
    if (!selectedRun) return;
    const blob = new Blob([JSON.stringify(selectedRun, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedRun.kind}_${selectedRun.dataset}_${selectedRun.trainedAt || 'run'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!selectedRun) return;
    await deleteModelRun(selectedRun.id);
    setShowConfirm(false);
    setShowDetails(false);
    setSelectedRun(null);
    await loadData();
  };

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button
          onClick={() => (window.location.href = '/forecasting')}
          style={{ 
            padding: '8px 12px', 
            borderRadius: 6, 
            border: '1px solid #d1d5db', 
            cursor: 'pointer',
            fontWeight: 500,
            background: 'white'
          }}
        >
          ← Back
        </button>
        <h2 style={{ 
          margin: 0, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          flex: 1,
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 600
        }}>
          📜 Training History
        </h2>
        <div style={{ width: 76 }} /> {/* Spacer to keep title centered */}
      </div>

      {/* Dataset selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600, marginRight: 8 }}>Dataset:</label>
        <select
          value={selectedDataset}
          onChange={(e) => setSelectedDataset(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}
        >
          {AVAILABLE_DATASETS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Best cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {['LSTM', 'MLP'].map((kind) => {
          const run = best[kind];
          const icon = kind === 'LSTM' ? '🧠' : '🔧';
          const accent = kind === 'LSTM' ? '#2563eb' : '#10b981';
          return (
            <div key={kind} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#f8fafc' }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: accent, display: 'flex', alignItems: 'center', gap: 6 }}>
                {icon} Best {kind}
              </div>
              {run ? (
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                  <div>Accuracy: {run.accuracy}</div>
                  <div>MAE: {run.mae} • RMSE: {run.rmse}</div>
                  <div>MAPE: {run.mape} • R²: {run.r2}</div>
                  <div>Lookback: {run.lookback} • Units: {run.units}</div>
                  {kind === 'LSTM' && run.dropout && <div>Dropout: {run.dropout}</div>}
                  {kind === 'MLP' && run.activation && <div>Activation: {run.activation}</div>}
                  <div>Trained: {formatDate(run.trainedAt)}</div>
                </div>
              ) : (
                <div style={{ color: '#6b7280' }}>No runs yet</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto', maxHeight: '55vh' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
            <tr>
              {['Trained At', 'Kind', 'Accuracy', 'MAE', 'RMSE', 'MAPE', 'R²', 'Lookback', 'Units', 'Dropout / Activation'].map((h) => (
                <th key={h} style={{ padding: '10px 8px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr
                key={run.id}
                onClick={() => handleRowClick(run)}
                style={{
                  cursor: 'pointer',
                  background: selectedRun?.id === run.id ? '#e0f2fe' : 'white'
                }}
              >
                <td style={{ padding: '9px 8px', borderBottom: '1px solid #f1f5f9' }}>{formatDate(run.trainedAt)}</td>
                <td style={{ padding: '9px 8px', borderBottom: '1px solid #f1f5f9' }}>
                  {pill(run.kind, run.kind === 'LSTM' ? '#2563eb' : '#10b981')}
                </td>
                <td style={{ padding: '9px 8px', borderBottom: '1px solid #f1f5f9' }}>{run.accuracy}</td>
                <td style={{ padding: '9px 8px', borderBottom: '1px solid #f1f5f9' }}>{run.mae}</td>
                <td style={{ padding: '9px 8px', borderBottom: '1px solid #f1f5f9' }}>{run.rmse}</td>
                <td style={{ padding: '9px 8px', borderBottom: '1px solid #f1f5f9' }}>{run.mape}</td>
                <td style={{ padding: '9px 8px', borderBottom: '1px solid #f1f5f9' }}>{run.r2}</td>
                <td style={{ padding: '9px 8px', borderBottom: '1px solid #f1f5f9' }}>{run.lookback}</td>
                <td style={{ padding: '9px 8px', borderBottom: '1px solid #f1f5f9' }}>{run.units}</td>
                <td style={{ padding: '9px 8px', borderBottom: '1px solid #f1f5f9' }}>
                  {run.kind === 'LSTM' ? run.dropout || '—' : run.activation || '—'}
                </td>
              </tr>
            ))}
            {runs.length === 0 && !loading && (
              <tr>
                <td colSpan={10} style={{ padding: 12, textAlign: 'center', color: '#6b7280' }}>
                  No runs yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <p style={{ marginTop: 10 }}>Loading…</p>}
      {error && <p style={{ marginTop: 10, color: '#b91c1c' }}>{error}</p>}

      {/* Details modal */}
      {showDetails && selectedRun && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              background: 'white',
              width: '90%',
              maxWidth: 720,
              maxHeight: '85vh',
              overflow: 'auto',
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Run Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <pre
              style={{
                background: '#f8fafc',
                padding: 12,
                borderRadius: 8,
                fontSize: 13,
                maxHeight: 420,
                overflow: 'auto',
                marginBottom: 12
              }}
            >
{JSON.stringify(selectedRun, null, 2)}
            </pre>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={handleDownload}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', cursor: 'pointer' }}
              >
                Download
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ef4444', color: '#b91c1c', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showConfirm && selectedRun && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 3500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              background: 'white',
              padding: 16,
              borderRadius: 10,
              width: 360,
              boxShadow: '0 16px 48px rgba(0,0,0,0.25)'
            }}
          >
            <h4 style={{ marginTop: 0 }}>Confirm delete?</h4>
            <p style={{ margin: '6px 0 14px' }}>
              This will remove the run trained at {formatDate(selectedRun.trainedAt)}.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ef4444', color: '#b91c1c', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllModels;