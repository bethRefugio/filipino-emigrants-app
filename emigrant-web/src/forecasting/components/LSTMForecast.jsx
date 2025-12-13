import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cleanData, sortData, normalizeData, denormalize, createSequences, calculateMetrics, createSequencesWithBreakdown, denormalizeBreakdown} from '../utils/dataPreparation';
import {
  buildLSTMModel,
  trainLSTMModel,
  predictLSTM,
  saveLSTMModel,
  loadLSTMModel,
  deleteLSTMModel, 
  downloadLSTMModel,
  uploadLSTMModel,
  getFullMetadata
} from '../models/lstmModel';
import './ForecastPanel.css';
import * as tf from '@tensorflow/tfjs';
import { saveModelRun, getBestRun } from '../../services/modelRuns';
import NotificationModal from './NotificationModal';

export default function LSTMForecast({ data, datasetName }) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [model, setModel] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [forecastYears, setForecastYears] = useState(5);
  const [forecasts, setForecasts] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [lookback, setLookback] = useState(3);
  const [units1, setUnits1] = useState(60);
  const [units2, setUnits2] = useState(60);
  const [dropout1, setDropout1] = useState(0.1);
  const [dropout2, setDropout2] = useState(0.1);

  const [uploadError, setUploadError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({ modelJsonFile: null, weightsFile: null, metadataFile: null });

  const [notice, setNotice] = useState({ open: false, type: 'success', message: '' });
  const showNotice = (type, message) => setNotice({ open: true, type, message });

  const FEATURES = ['emigrants'];
  const TARGET = 'emigrants';

  // Build model with user hyperparams
  function buildModel(lookbackVal, features, u1, u2, d1, d2) {
    return buildLSTMModel(lookbackVal, features, u1, u2, d1, d2);
  }

  const handleTrain = async () => {
  setIsTraining(true);
  setTrainingProgress({ epoch: 0, loss: 0, mae: 0 });
  setMetrics(null);
  setValidationResults([]);

  try {
    let cleanedData = cleanData(data);
    cleanedData = sortData(cleanedData);

    // Extract breakdown keys from first data point
    const breakdownKeys = Object.keys(cleanedData[0].breakdown || {});
    const allFeatures = ['emigrants', ...breakdownKeys];

    const { normalized, mins, maxs } = normalizeData(cleanedData, allFeatures);
    
    // Create sequences with breakdown targets
    const { X, y } = createSequencesWithBreakdown(normalized, lookback, ['emigrants'], TARGET, breakdownKeys);

    console.log('Original data length:', cleanedData.length);
    console.log('X shape:', X.length, 'x', X[0].length, 'x', X[0][0].length);
    console.log('y shape:', y.length, 'x', y[0].length);

    // Output size = 1 (total) + breakdown categories
    const outputSize = 1 + breakdownKeys.length;
    const newModel = buildLSTMModel(lookback, 1, units1, units2, dropout1, dropout2, outputSize);

    const onEpochEnd = (epoch, logs) => {
      setTrainingProgress({
        epoch: epoch + 1,
        loss: logs.loss.toFixed(6),
        mae: logs.mae.toFixed(6),
        val_loss: logs.val_loss?.toFixed(6),
        val_mae: logs.val_mae?.toFixed(6)
      });
    };

    await trainLSTMModel(newModel, X, y, onEpochEnd, 50, 0.2);

    // Get predictions as 2D array [batch_size, outputSize]
    const xs = tf.tensor3d(X);
    const predTensor = newModel.predict(xs);
    const normalizedPredictions = await predTensor.array();
    xs.dispose();
    predTensor.dispose();

    console.log('Predictions shape:', normalizedPredictions.length, 'x', normalizedPredictions[0].length);

    // Denormalize predictions
    const predictions = normalizedPredictions.map(pred => {
      return denormalizeBreakdown(pred, mins, maxs, TARGET, breakdownKeys);
    });

    // Denormalize actual values from y
    const actualValues = y.map((row) => {
      const actual = {};
      actual[TARGET] = denormalize(row[0], mins[TARGET], maxs[TARGET]);
      breakdownKeys.forEach((key, i) => {
        actual[key] = denormalize(row[i + 1], mins[key], maxs[key]);
      });
      return actual;
    });

    // Calculate metrics on total only
    const totalPredictions = predictions.map(p => p[TARGET]).filter(v => Number.isFinite(v));
    const totalActuals = actualValues.map(a => a[TARGET]).filter(v => Number.isFinite(v));

    console.log('Total predictions:', totalPredictions.length, totalPredictions.slice(0, 5));
    console.log('Total actuals:', totalActuals.length, totalActuals.slice(0, 5));

    if (totalPredictions.length === 0 || totalActuals.length === 0) {
      throw new Error('No valid predictions generated');
    }

    const calculatedMetrics = calculateMetrics(totalActuals, totalPredictions);
    console.log('Calculated metrics:', calculatedMetrics);

    // Set metrics IMMEDIATELY after calculation
    setMetrics(calculatedMetrics);

    // Create validation results table (20% test split)
    const trainSize = Math.floor(totalActuals.length * 0.8);
    const resultsData = [];
    
    // Create results from test split
    for (let i = trainSize; i < totalActuals.length; i++) {
      const yearIndex = i + lookback; // Map back to original cleanedData index
      if (yearIndex < cleanedData.length) {
        resultsData.push({
          year: cleanedData[yearIndex].year,
          actual: Math.round(totalActuals[i]),
          predicted: Math.round(totalPredictions[i]),
          error: Math.round(totalPredictions[i] - totalActuals[i])
        });
      }
    }

    console.log('Validation results:', resultsData.length, resultsData);
    setValidationResults(resultsData);

    const newMetadata = {
      modelType: 'LSTM',
      lookback,
      units1,
      units2,
      dropout1,
      dropout2,
      features: allFeatures,
      target: TARGET,
      breakdownKeys,
      mins,
      maxs,
      lastYear: cleanedData[cleanedData.length - 1].year,
      lastData: cleanedData.slice(-lookback),
      metrics: calculatedMetrics,
      trainedAt: new Date().toISOString(),
      dataset: datasetName
    };

    await saveLSTMModel(newModel, newMetadata);
    await saveModelRun('LSTM', {
      dataset: datasetName,
      lookback,
      units: `${units1}/${units2}`,
      dropout: `${dropout1}/${dropout2}`,
      mae: calculatedMetrics.mae,
      accuracy: calculatedMetrics.accuracy,
      rmse: calculatedMetrics.rmse,
      r2: calculatedMetrics.r2,
      mape: calculatedMetrics.mape,
      trainedAt: newMetadata.trainedAt
    });

    setModel(newModel);
    setMetadata(newMetadata);

    showNotice('success', `LSTM model trained with breakdown!\nMAE: ${calculatedMetrics.mae}\nAccuracy: ${calculatedMetrics.accuracy}%`);
  } catch (error) {
    console.error('Training error:', error);
    showNotice('error', 'Error training model: ' + error.message);
  } finally {
    setIsTraining(false);
  }
};

  // helper to split "60/60" -> [60,60] or default
  const splitPair = (val = '', def = [0, 0]) => {
    const parts = String(val).split('/');
    const a = Number(parts[0]);
    const b = Number(parts[1]);
    return [Number.isFinite(a) ? a : def[0], Number.isFinite(b) ? b : def[1]];
  };

  const handleLoadBestModel = async () => {
  setIsTraining(true);
  try {
    const best = await getBestRun('LSTM', datasetName);
    if (!best) {
      showNotice('error', `No best LSTM model found for dataset "${datasetName}". Please train or upload a model first.`);
      return;
    }

    // Load model for THIS dataset
    const loadResult = await loadLSTMModel(datasetName);
    if (!loadResult || !loadResult.model) {
      showNotice('error', 'Model weights not found in storage. Please train a model for this dataset first.');
      return;
    }

    const { model: loadedModel, metadata: fullMetadata } = loadResult;
    if (!fullMetadata) {
      showNotice('error', 'Full metadata not found. Please train a model first.');
      return;
    }

    // No need to check dataset match anymore - it's guaranteed by the key
    setLookback(Number(best.lookback ?? lookback));
    const [u1, u2] = splitPair(best.units, [units1, units2]);
    setUnits1(u1);
    setUnits2(u2);
    const [d1, d2] = splitPair(best.dropout, [dropout1, dropout2]);
    setDropout1(d1);
    setDropout2(d2);

    setMetrics({
      mae: best.mae,
      rmse: best.rmse,
      mape: best.mape,
      r2: best.r2,
      accuracy: best.accuracy
    });
    setMetadata(fullMetadata);
    setModel(loadedModel);
    setTrainingProgress(null);
    showNotice('success', 'Best LSTM model loaded successfully!');
  } catch (err) {
    console.error(err);
    showNotice('error', 'Failed to load best LSTM model: ' + err.message);
  } finally {
    setIsTraining(false);
  }
};

  const handleUploadModalOpen = () => {
    setShowUploadModal(true);
    setUploadingFiles({ modelJsonFile: null, weightsFile: null, metadataFile: null });
    setUploadError(null);
  };

  const handleUploadModalClose = () => {
    setShowUploadModal(false);
    setUploadingFiles({ modelJsonFile: null, weightsFile: null, metadataFile: null });
    setUploadError(null);
  };

  const handleUploadSubmit = async () => {
    const { modelJsonFile, weightsFile, metadataFile } = uploadingFiles;

    if (!modelJsonFile || !weightsFile || !metadataFile) {
      setUploadError('Please select all three files (model.json, weights.bin, and lstm-metadata.json)');
      return;
    }

    if (metadataFile.name !== 'lstm-metadata.json') {
      setUploadError('Metadata file must be named lstm-metadata.json');
      return;
    }

    try {
      setIsTraining(true);
      const modelFiles = [modelJsonFile, weightsFile];

      const { model: uploadedModel, metadata: uploadedMetadata } = await uploadLSTMModel(modelFiles, metadataFile);

      setLookback(uploadedMetadata.lookback);
      setUnits1(uploadedMetadata.units1);
      setUnits2(uploadedMetadata.units2);
      setDropout1(uploadedMetadata.dropout1);
      setDropout2(uploadedMetadata.dropout2);

      setMetrics(uploadedMetadata.metrics);
      setMetadata(uploadedMetadata);
      setModel(uploadedModel);
      setTrainingProgress(null);

      showNotice('success', 'LSTM model uploaded successfully!');
      handleUploadModalClose();
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
      showNotice('error', 'Error uploading model: ' + error.message);
    } finally {
      setIsTraining(false);
    }
  };

  const handleDeleteModel = async () => {
  if (!confirm('Are you sure you want to delete the saved LSTM model?')) return;

  try {
    await deleteLSTMModel(datasetName);  // Pass dataset
    setModel(null);
    setMetadata(null);
    setMetrics(null);
    setForecasts([]);
    showNotice('success', 'LSTM model deleted successfully.');
  } catch (error) {
    console.error('Error deleting model:', error);
    showNotice('error', 'Error deleting model: ' + error.message);
  }
};

  const handleDownloadModel = async () => {
    if (!model || !metadata) {
      showNotice('error', 'No model to download. Please train or load a model first.');
      return;
    }

    try {
      await downloadLSTMModel(model, metadata);
      showNotice('success', 'LSTM model files downloaded.');
    } catch (error) {
      console.error('Error downloading model:', error);
      showNotice('error', 'Error downloading model: ' + error.message);
    }
  };

  const handleForecast = async () => {
  if (!model || !metadata) {
    showNotice('error', 'Please train or load a model first.');
    return;
  }

  try {
    const { mins, maxs, lastData, breakdownKeys } = metadata;
    
    let currentSequence = lastData.map(row => ({
      year: row.year,
      emigrants: row.emigrants,
      breakdown: row.breakdown || {}
    }));

    const predictions = [];
    let currentYear = metadata.lastYear;

    for (let i = 0; i < forecastYears; i++) {
      // Only normalize emigrants for input
      const normalized = currentSequence.map(row => ({
        emigrants: (row.emigrants - mins.emigrants) / (maxs.emigrants - mins.emigrants)
      }));

      // Input: [1, lookback, 1] - only emigrants feature
      const input = [normalized.map(row => [row.emigrants])];
      const normalizedPred = await predictLSTM(model, input);
      
      // Denormalize total emigrants
      const totalEmigrants = denormalize(normalizedPred[0], mins.emigrants, maxs.emigrants);
      
      // Calculate breakdown as proportions
      const breakdown = {};
      let breakdownSum = 0;
      
      if (breakdownKeys && breakdownKeys.length > 0) {
        // Get denormalized breakdown predictions
        const breakdownPredictions = breakdownKeys.map((key, idx) => 
          denormalize(normalizedPred[idx + 1], mins[key], maxs[key])
        );
        
        // Calculate sum of breakdown predictions
        breakdownSum = breakdownPredictions.reduce((sum, val) => sum + val, 0);
        
        // Scale breakdown to match total emigrants
        if (breakdownSum > 0) {
          breakdownKeys.forEach((key, idx) => {
            const proportion = breakdownPredictions[idx] / breakdownSum;
            breakdown[key] = Math.round(totalEmigrants * proportion);
          });
          
          // Adjust for rounding errors - add/subtract difference to largest category
          const calculatedSum = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
          const difference = Math.round(totalEmigrants) - calculatedSum;
          
          if (difference !== 0) {
            const largestKey = breakdownKeys.reduce((max, key) => 
              breakdown[key] > breakdown[max] ? key : max
            , breakdownKeys[0]);
            breakdown[largestKey] += difference;
          }
        } else {
          // Fallback: equal distribution
          const perCategory = Math.floor(totalEmigrants / breakdownKeys.length);
          breakdownKeys.forEach((key, idx) => {
            breakdown[key] = idx === 0 ? Math.round(totalEmigrants) - perCategory * (breakdownKeys.length - 1) : perCategory;
          });
        }
      }

      currentYear++;
      predictions.push({
        year: currentYear.toString(),
        emigrants: Math.round(totalEmigrants),
        breakdown,
        isForecast: true
      });

      // Update sequence with new prediction
      currentSequence = [
        ...currentSequence.slice(1),
        { 
          year: currentYear, 
          emigrants: Math.round(totalEmigrants),
          breakdown
        }
      ];
    }

    setForecasts(predictions);
    showNotice('success', `Generated ${forecastYears} year LSTM forecast with breakdown.`);
  } catch (error) {
    console.error('Forecasting error:', error);
    showNotice('error', 'Error generating forecast: ' + error.message);
  }
};

  const chartData = [...data, ...forecasts];

  return (
    <div className="forecast-panel lstm-panel">
      <NotificationModal
        open={notice.open}
        type={notice.type}
        message={notice.message}
        onClose={() => setNotice({ ...notice, open: false })}
      />

      <h2>LSTM Forecasting (Long Short-Term Memory)</h2>

      <div className="top-bar">
        <div className="model-selector">
          <label>
            Lookback
            <input
              type="number"
              min="1"
              max="10"
              value={lookback}
              onChange={(e) => setLookback(parseInt(e.target.value || '1'))}
            />
          </label>
          <label>
            LSTM Units
            <input type="number" value={units1} onChange={(e) => setUnits1(parseInt(e.target.value))} />
            <input type="number" value={units2} onChange={(e) => setUnits2(parseInt(e.target.value))} />
          </label>
          <label>
            Dropout
            <input
              type="number"
              step="0.05"
              min="0"
              max="0.3"
              value={dropout1}
              onChange={(e) => setDropout1(parseFloat(e.target.value || '0'))}
            />
            <input
              type="number"
              step="0.05"
              min="0"
              max="0.3"
              value={dropout2}
              onChange={(e) => setDropout2(parseFloat(e.target.value || '0'))}
            />
          </label>
        </div>
      </div>

      <div className="control-buttons">
        <button onClick={handleTrain} disabled={isTraining}>{isTraining ? 'Training...' : 'Train LSTM Model'}</button>
        <button onClick={handleLoadBestModel} disabled={isTraining}>Load Best Model</button>
        <button onClick={handleUploadModalOpen} disabled={isTraining}>Upload Model</button>
        <button onClick={handleDeleteModel} disabled={isTraining || !model}>Delete Model</button>
        <button onClick={handleDownloadModel} disabled={isTraining || !model}>Download Model</button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: '24px',
            width: '90%',
            maxWidth: 500,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Upload LSTM Model</h3>
              <button
                onClick={handleUploadModalClose}
                style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Model File (model.json):
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadingFiles(prev => ({ ...prev, modelJsonFile: file }));
                    setUploadError(null);
                  }
                }}
                disabled={isTraining}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              />
              {uploadingFiles.modelJsonFile && (
                <p style={{ margin: '6px 0 0', fontSize: 14, color: '#10b981' }}>
                  ✓ {uploadingFiles.modelJsonFile.name}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Weights File (weights.bin):
              </label>
              <input
                type="file"
                accept=".bin"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadingFiles(prev => ({ ...prev, weightsFile: file }));
                    setUploadError(null);
                  }
                }}
                disabled={isTraining}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              />
              {uploadingFiles.weightsFile && (
                <p style={{ margin: '6px 0 0', fontSize: 14, color: '#10b981' }}>
                  ✓ {uploadingFiles.weightsFile.name}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Metadata File (lstm-metadata.json):
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadingFiles(prev => ({ ...prev, metadataFile: file }));
                    setUploadError(null);
                  }
                }}
                disabled={isTraining}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              />
              {uploadingFiles.metadataFile && (
                <p style={{ margin: '6px 0 0', fontSize: 14, color: '#10b981' }}>
                  ✓ {uploadingFiles.metadataFile.name}
                </p>
              )}
            </div>

            {uploadError && (
              <div style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '10px',
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 14
              }}>
                {uploadError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={handleUploadModalClose}
                disabled={isTraining}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: 'white'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={isTraining || !uploadingFiles.modelJsonFile || !uploadingFiles.weightsFile || !uploadingFiles.metadataFile}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  opacity: (isTraining || !uploadingFiles.modelJsonFile || !uploadingFiles.weightsFile || !uploadingFiles.metadataFile) ? 0.5 : 1
                }}
              >
                {isTraining ? 'Uploading...' : 'Upload Model'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isTraining && trainingProgress && (
        <div className="training-progress">
          <h3>Training Progress</h3>
          <p>Epoch: {trainingProgress.epoch} / 50</p>
          <p>Loss: {trainingProgress.loss}</p>
          <p>MAE: {trainingProgress.mae}</p>
          {trainingProgress.val_loss && (
            <>
              <p>Val Loss: {trainingProgress.val_loss}</p>
              <p>Val MAE: {trainingProgress.val_mae}</p>
            </>
          )}
        </div>
      )}

      {metrics && !isTraining && (
        <>
          <div className="metrics">
            <h3>LSTM Model Performance Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">MAE:</span>
                <span className="metric-value">{metrics.mae}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">RMSE:</span>
                <span className="metric-value">{metrics.rmse}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">MAPE:</span>
                <span className="metric-value">{metrics.mape}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">R²:</span>
                <span className="metric-value">{metrics.r2}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Accuracy:</span>
                <span className="metric-value">{metrics.accuracy}%</span>
              </div>
            </div>
          </div>

          {validationResults.length > 0 && (
            <div className="training-results">
              <h3>Testing Results - 20% Split (Actual vs Predicted)</h3>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Actual Emigrants</th>
                      <th>Predicted Emigrants</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResults.map((row, i) => (
                      <tr key={i}>
                        <td>{row.year}</td>
                        <td>{row.actual.toLocaleString()}</td>
                        <td>{row.predicted.toLocaleString()}</td>
                        <td className={row.error >= 0 ? 'error-positive' : 'error-negative'}>
                          {row.error >= 0 ? '+' : ''}{row.error.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {model && !isTraining && (
        <div className="forecast-controls">
          <h3>Generate LSTM Forecast</h3>
          <div className="forecast-input">
            <label>
              Years to forecast:
              <input
                type="number"
                min="1"
                max="10"
                value={forecastYears}
                onChange={(e) => setForecastYears(parseInt(e.target.value))}
              />
            </label>
            <button onClick={handleForecast}>Generate Forecast</button>
          </div>
        </div>
      )}

      {forecasts.length > 0 && (
  <>
    <div className="chart-container">
      <h3>LSTM: Historical + Forecast</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            label={{ value: 'Emigrants', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={(entry) => entry.isForecast ? null : entry.emigrants}
            stroke="#82ca9d"
            strokeWidth={2}
            name="Emigrants (Historical)"
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (payload.isForecast || !payload.emigrants) return null;
              return <circle cx={cx} cy={cy} r={3} fill="#82ca9d" />;
            }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey={(entry) => entry.isForecast ? entry.emigrants : null}
            stroke="#ff6b6b"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Emigrants (LSTM Forecast)"
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (!payload.isForecast || !payload.emigrants) return null;
              return <circle cx={cx} cy={cy} r={4} fill="#ff6b6b" />;
            }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div className="forecast-results">
      <h3>LSTM Forecast Results with Breakdown</h3>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Year</th>
              {metadata?.breakdownKeys && metadata.breakdownKeys.length > 0 && 
                (() => {
                  const ageOrder = ['0-14', '15-24', '25-34', '35-44', '45-54', '55-64', '65+', 'Not Reported'];
                  const sortedKeys = metadata.breakdownKeys.sort((a, b) => {
                    const indexA = ageOrder.indexOf(a);
                    const indexB = ageOrder.indexOf(b);
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    return a.localeCompare(b);
                  });
                  return sortedKeys.map(key => (
                    <th key={key}>{key}</th>
                  ));
                })()
              }
              <th>Total Predicted Emigrants</th>
            </tr>
          </thead>
          <tbody>
            {forecasts.map((f, i) => (
              <tr key={i}>
                <td>{f.year}</td>
                {metadata?.breakdownKeys && metadata.breakdownKeys.length > 0 && 
                  (() => {
                    const ageOrder = ['0-14', '15-24', '25-34', '35-44', '45-54', '55-64', '65+', 'Not Reported'];
                    const sortedKeys = metadata.breakdownKeys.sort((a, b) => {
                      const indexA = ageOrder.indexOf(a);
                      const indexB = ageOrder.indexOf(b);
                      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                      if (indexA !== -1) return -1;
                      if (indexB !== -1) return 1;
                      return a.localeCompare(b);
                    });
                    return sortedKeys.map(key => (
                      <td key={key}>{f.breakdown?.[key]?.toLocaleString() || 'N/A'}</td>
                    ));
                  })()
                }
                <td style={{ fontWeight: 700 }}>{f.emigrants.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </>
)}

      <div className="info-box">
        <h4>LSTM Model Configuration</h4>
        {metadata ? (
          <ul>
            <li>Architecture: 2 LSTM layers ({units1}, {units2} units)</li>
            <li>Lookback window: {lookback} years</li>
            <li>Input features: {FEATURES.join(', ')}</li>
            <li>Target: {TARGET}</li>
            <li>Dropout: {dropout1}, {dropout2}</li>
            <li>Epochs: 50 | Validation split: 20%</li>
            <li>Trained at: {new Date(metadata.trainedAt).toLocaleString()}</li>
          </ul>
        ) : (
          <ul>
            <li>Architecture: 2 LSTM layers ({units1}, {units2} units)</li>
            <li>Lookback window: {lookback} years</li>
            <li>Input features: {FEATURES.join(', ')}</li>
            <li>Target: {TARGET}</li>
            <li>Dropout: {dropout1}, {dropout2}</li>
            <li>Epochs: 50 | Validation split: 20%</li>
            <li>Status: Not trained yet</li>
          </ul>
        )}
      </div>
    </div>
  );
}