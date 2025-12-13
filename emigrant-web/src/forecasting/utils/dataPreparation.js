/**
 * Data Preparation Utilities for LSTM/MLP Time Series Forecasting
 */

/**
 * Clean and validate data, converting to numerical format
 * Missing values are converted to zero
 */
export function cleanData(data) {
  return data.map(row => ({
    year: parseInt(row.year) || 0,
    population: parseFloat(row.population) || 0,
    emigrants: parseFloat(row.emigrants) || 0,
    breakdown: row.breakdown || {} // Preserve breakdown object
  }));
}

/**
 * Sort data chronologically by year
 */
export function sortData(data) {
  return [...data].sort((a, b) => a.year - b.year);
}

/**
 * Min-Max Normalization: scales values to [0, 1] range
 * normalized = (value - min) / (max - min)
 */
export function normalizeData(data, features = ['population', 'emigrants']) {
  const mins = {};
  const maxs = {};

  // Calculate min and max for each feature
  features.forEach(feature => {
    const values = data.map(row => {
      // Handle breakdown keys
      if (row.breakdown && feature in row.breakdown) {
        return row.breakdown[feature];
      }
      return row[feature] || 0;
    }).filter(v => v !== null && v !== undefined);
    
    mins[feature] = Math.min(...values);
    maxs[feature] = Math.max(...values);
  });

  // Normalize data
  const normalized = data.map(row => {
    const normalizedRow = { year: row.year };
    
    features.forEach(feature => {
      let value;
      if (row.breakdown && feature in row.breakdown) {
        value = row.breakdown[feature];
      } else {
        value = row[feature] || 0;
      }
      
      const range = maxs[feature] - mins[feature];
      normalizedRow[feature] = range === 0 ? 0 : (value - mins[feature]) / range;
    });
    
    return normalizedRow;
  });

  return { normalized, mins, maxs };
}

/**
 * Denormalize values back to original scale
 * denormalized = normalized * (max - min) + min
 */
export function denormalize(normalizedValue, min, max) {
  return normalizedValue * (max - min) + min;
}

/**
 * Create sequences using sliding window approach
 * @param {Array} data - Normalized data
 * @param {number} lookback - Window size (default: 3)
 * @param {Array} features - Features to use as input ['population', 'emigrants']
 * @param {string} target - Target feature to predict ('emigrants')
 * @returns {Object} - { X: input sequences, y: target values }
 */
export function createSequences(data, lookback = 3, features = ['population', 'emigrants'], target = 'emigrants') {
  const X = [];
  const y = [];

  for (let i = lookback; i < data.length; i++) {
    // Get lookback window of features
    const sequence = [];
    for (let j = i - lookback; j < i; j++) {
      const featureValues = features.map(f => data[j][f]);
      sequence.push(featureValues);
    }
    X.push(sequence);

    // Target is the next value of the target feature
    y.push(data[i][target]);
  }

  return { X, y };
}

/**
 * Calculate performance metrics
 */
export function calculateMetrics(actual, predicted) {
  const n = actual.length;

  // Mean Absolute Error (MAE)
  const mae = actual.reduce((sum, val, i) => sum + Math.abs(val - predicted[i]), 0) / n;

  // Root Mean Squared Error (RMSE)
  const mse = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0) / n;
  const rmse = Math.sqrt(mse);

  // Mean Absolute Percentage Error (MAPE)
  const mape = actual.reduce((sum, val, i) => {
    return sum + (val !== 0 ? Math.abs((val - predicted[i]) / val) : 0);
  }, 0) / n * 100;

  // R-squared (R²)
  const mean = actual.reduce((sum, val) => sum + val, 0) / n;
  const ssRes = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
  const ssTot = actual.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  const r2 = 1 - (ssRes / ssTot);

  // Accuracy (100 - MAPE)
  const accuracy = 100 - mape;

  return {
    mae: mae.toFixed(2),
    rmse: rmse.toFixed(2),
    mape: mape.toFixed(2),
    r2: r2.toFixed(4),
    accuracy: accuracy.toFixed(2)
  };
}

export function createSequencesWithBreakdown(normalized, lookback, features, target, breakdownKeys) {
  const sequences = [];
  const targets = [];

  for (let i = lookback; i < normalized.length; i++) {
    // Create sequence: lookback steps, each with all features
    const sequence = [];
    for (let j = i - lookback; j < i; j++) {
      // Extract feature values for each timestep
      const featureValues = features.map(f => normalized[j][f] || 0);
      sequence.push(featureValues);
    }
    sequences.push(sequence);

    // Target includes total + all breakdown categories
    const targetRow = normalized[i];
    const targetValues = [targetRow[target] || 0];
    
    // Add breakdown values
    breakdownKeys.forEach(key => {
      targetValues.push(targetRow[key] || 0);
    });
    
    targets.push(targetValues);
  }

  return { X: sequences, y: targets };
}

export function denormalizeBreakdown(prediction, mins, maxs, target, breakdownKeys) {
  const result = {};
  
  // Denormalize total
  result[target] = denormalize(prediction[0], mins[target], maxs[target]);
  
  // Denormalize each breakdown category
  breakdownKeys.forEach((key, idx) => {
    result[key] = denormalize(prediction[idx + 1], mins[key], maxs[key]);
  });
  
  return result;
}