import * as tf from '@tensorflow/tfjs';

/**
 * Build LSTM Model for Time Series Forecasting
 * Architecture:
 * - Input: [lookback, features] e.g., [3, 2] for 3 years × 2 features
 * - LSTM Layer 1: 50 units with dropout 0.2
 * - LSTM Layer 2: 50 units with dropout 0.2
 * - Dense Output: 1 unit (emigrants prediction)
 * - Loss: MSE (Mean Squared Error)
 * - Optimizer: Adam (lr=0.001)
 * - Metrics: MAE (Mean Absolute Error)
 */
export function buildLSTMModel(lookback = 3, features = 2, units1 = 60, units2 = 60, dropout1 = 0.1, dropout2 = 0.1) {
  const model = tf.sequential();

  // First LSTM layer
  model.add(tf.layers.lstm({
    units: units1,
    returnSequences: true,
    inputShape: [lookback, features],
    dropout: dropout1
  }));

  // Second LSTM layer
  model.add(tf.layers.lstm({
    units: units2,
    dropout: dropout2
  }));

  // Output layer
  model.add(tf.layers.dense({
    units: 1
  }));

  // Compile model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  return model;
}

/**
 * Train LSTM Model
 * @param {tf.Sequential} model - The LSTM model
 * @param {Array} X - Input sequences
 * @param {Array} y - Target values
 * @param {Function} onEpochEnd - Callback for epoch progress
 * @param {number} epochs - Number of training epochs (default: 100)
 * @param {number} validationSplit - Validation split ratio (default: 0.2)
 */
export async function trainLSTMModel(model, X, y, onEpochEnd, epochs = 100, validationSplit = 0.2) {
  // Convert to tensors
  const xs = tf.tensor3d(X);
  const ys = tf.tensor2d(y, [y.length, 1]);

  // Determine batch size
  const batchSize = Math.min(32, X.length);

  // Train model
  const history = await model.fit(xs, ys, {
    epochs,
    batchSize,
    validationSplit,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        if (onEpochEnd && epoch % 20 === 0) {
          onEpochEnd(epoch, logs);
        }
      }
    }
  });

  // Cleanup tensors
  xs.dispose();
  ys.dispose();

  return history;
}

/**
 * Make predictions using LSTM model
 */
export async function predictLSTM(model, X) {
  const xs = tf.tensor3d(X);
  const predictions = model.predict(xs);
  const result = await predictions.array();

  xs.dispose();
  predictions.dispose();

  return result.map(r => r[0]);
}

/**
 * Save LSTM model to IndexedDB
 */
  export async function saveLSTMModel(model, metadata) {
    const dataset = metadata.dataset || 'default';
    await model.save(`indexeddb://emigrants-lstm-model-${dataset}`);
    localStorage.setItem(`lstm-metadata-${dataset}`, JSON.stringify(metadata));
  }
/**
 * Load LSTM model from IndexedDB
 */
export async function loadLSTMModel(dataset = 'default') {
  try {
    const model = await tf.loadLayersModel(`indexeddb://emigrants-lstm-model-${dataset}`);
    const metadata = JSON.parse(localStorage.getItem(`lstm-metadata-${dataset}`));
    return { model, metadata };
  } catch (error) {
    console.error('Error loading LSTM model:', error);
    return null;
  }
}

export async function getFullMetadata() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('forecasting_db');
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction('models', 'readonly');
      const store = tx.objectStore('models');
      const getReq = store.get('lstm_model'); // Changed from 'lstm_metadata'
      getReq.onsuccess = () => {
        const result = getReq.result;
        if (result && result.metadata) {
          resolve(result.metadata);
        } else {
          resolve(null);
        }
      };
      getReq.onerror = () => reject(getReq.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function uploadLSTMModel(modelFiles, metadataFile) {
  try {
    // Read metadata JSON
    const metadataText = await metadataFile.text();
    const metadata = JSON.parse(metadataText);

    // Find model.json file
    const modelJsonFile = Array.from(modelFiles).find(f => f.name.endsWith('model.json'));
    if (!modelJsonFile) {
      throw new Error('model.json file not found');
    }

    const modelJsonText = await modelJsonFile.text();
    const modelJson = JSON.parse(modelJsonText);

    // Read weight files and combine into single buffer
    let weightData = new ArrayBuffer(0);
    let weightSpecs = [];

    if (modelJson.weightsManifest && Array.isArray(modelJson.weightsManifest)) {
      for (const manifest of modelJson.weightsManifest) {
        // Extract weight specs from manifest
        if (manifest.weights) {
          weightSpecs = weightSpecs.concat(manifest.weights);
        }

        // Read weight files (usually .bin files)
        for (const path of manifest.paths) {
          const fileName = path.split('/').pop();
          const weightFile = Array.from(modelFiles).find(f => f.name === fileName);
          
          if (weightFile) {
            const buffer = await weightFile.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);
            const combined = new Uint8Array(weightData.byteLength + uint8Array.byteLength);
            combined.set(new Uint8Array(weightData), 0);
            combined.set(uint8Array, weightData.byteLength);
            weightData = combined.buffer;
          }
        }
      }
    }

    // Create proper ModelArtifacts object with weightSpecs
    const modelArtifacts = {
      modelTopology: modelJson.modelTopology,
      weightSpecs: weightSpecs,
      weightData: weightData,
      format: modelJson.format || 'layers-model',
      generatedBy: modelJson.generatedBy,
      convertedBy: modelJson.convertedBy,
      kerasVersion: modelJson.kerasVersion,
      backend: modelJson.backend
    };

    // Load model from memory using single argument
    const model = await tf.loadLayersModel(tf.io.fromMemory(modelArtifacts));

    // Save to IndexedDB
    await model.save('indexeddb://emigrants-lstm-model');
    localStorage.setItem('lstm-metadata', JSON.stringify(metadata));

    return { model, metadata };
  } catch (error) {
    console.error('Error uploading LSTM model:', error);
    throw error;
  }
}

/**
 * Delete LSTM model from IndexedDB
 */
export async function deleteLSTMModel(dataset = 'default') {
  try {
    await tf.io.removeModel(`indexeddb://emigrants-lstm-model-${dataset}`);
    localStorage.removeItem(`lstm-metadata-${dataset}`);
    return true;
  } catch (error) {
    console.error('Error deleting LSTM model:', error);
    return false;
  }
}

/**
 * Download LSTM model files
 */
export async function downloadLSTMModel(model, metadata) {
  // Save model to downloads
  await model.save('downloads://emigrants-lstm-model');

  // Download metadata
  const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(metadataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lstm-metadata.json';
  a.click();
  URL.revokeObjectURL(url);
}
