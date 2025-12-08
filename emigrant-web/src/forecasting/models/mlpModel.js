import * as tf from '@tensorflow/tfjs';

/**
 * Build MLP (Multi-Layer Perceptron) Model for Time Series Forecasting
 * Architecture:
 * - Input: Flattened sequence [lookback * features]
 * - Dense Layer 1: 64 units, ReLU activation, dropout 0.2
 * - Dense Layer 2: 32 units, ReLU activation, dropout 0.2
 * - Dense Output: 1 unit (emigrants prediction)
 * - Loss: MSE (Mean Squared Error)
 * - Optimizer: Adam (lr=0.001)
 * - Metrics: MAE (Mean Absolute Error)
 */
export function buildMLPModel(lookback = 3, features = 2, units1 = 85, units2 = 74, activation1 = 'relu', activation2 = 'tanh') {
  const model = tf.sequential();

  const inputSize = lookback * features;

  // First Dense layer
  model.add(tf.layers.dense({
    units: units1,
    activation: activation1,
    inputShape: [inputSize]
  }));

  model.add(tf.layers.dropout({ rate: 0.2 }));

  // Second Dense layer
  model.add(tf.layers.dense({
    units: units2,
    activation: activation2
  }));

  model.add(tf.layers.dropout({ rate: 0.2 }));

  // Output layer
  model.add(tf.layers.dense({
    units: 1
  }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  return model;
}

/**
 * Flatten sequences for MLP input
 * MLP expects 2D input: [samples, features]
 * We flatten the 3D sequences to 2D
 */
function flattenSequences(X) {
  return X.map(seq => seq.flat());
}

/**
 * Train MLP Model
 * @param {tf.Sequential} model - The MLP model
 * @param {Array} X - Input sequences (will be flattened)
 * @param {Array} y - Target values
 * @param {Function} onEpochEnd - Callback for epoch progress
 * @param {number} epochs - Number of training epochs (default: 100)
 * @param {number} validationSplit - Validation split ratio (default: 0.2)
 */
export async function trainMLPModel(model, X, y, onEpochEnd, epochs = 100, validationSplit = 0.2) {
  // Flatten sequences for MLP
  const flatX = flattenSequences(X);

  // Convert to tensors
  const xs = tf.tensor2d(flatX);
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
 * Make predictions using MLP model
 */
export async function predictMLP(model, X) {
  const flatX = flattenSequences(X);
  const xs = tf.tensor2d(flatX);
  const predictions = model.predict(xs);
  const result = await predictions.array();

  xs.dispose();
  predictions.dispose();

  return result.map(r => r[0]);
}

/**
 * Save MLP model to IndexedDB
 */
export async function saveMLPModel(model, metadata) {
  const dataset = metadata.dataset || 'default';
  await model.save(`indexeddb://emigrants-mlp-model-${dataset}`);
  localStorage.setItem(`mlp-metadata-${dataset}`, JSON.stringify(metadata));
}

/**
 * Load MLP model from IndexedDB
 */
export async function loadMLPModel(dataset = 'default') {
  try {
    const model = await tf.loadLayersModel(`indexeddb://emigrants-mlp-model-${dataset}`);
    const metadata = JSON.parse(localStorage.getItem(`mlp-metadata-${dataset}`));
    return { model, metadata };
  } catch (error) {
    console.error('Error loading MLP model:', error);
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
      const getReq = store.get('mlp_model'); // Changed from 'mlp_metadata'
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

export async function uploadMLPModel(modelFiles, metadataFile) {
  try {
    // Read metadata JSON
    const metadataText = await metadataFile.text();
    const metadata = JSON.parse(metadataText);

    // Find and read model.json
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
    await model.save('indexeddb://emigrants-mlp-model');
    localStorage.setItem('mlp-metadata', JSON.stringify(metadata));

    return { model, metadata };
  } catch (error) {
    console.error('Error uploading MLP model:', error);
    throw error;
  }
}

/**
 * Delete MLP model from IndexedDB
 */
export async function deleteMLPModel(dataset = 'default') {
  try {
    await tf.io.removeModel(`indexeddb://emigrants-mlp-model-${dataset}`);
    localStorage.removeItem(`mlp-metadata-${dataset}`);
    return true;
  } catch (error) {
    console.error('Error deleting MLP model:', error);
    return false;
  }
}

/**
 * Download MLP model files
 */
export async function downloadMLPModel(model, metadata) {
  // Save model to downloads
  await model.save('downloads://emigrants-mlp-model');

  // Download metadata
  const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(metadataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mlp-metadata.json';
  a.click();
  URL.revokeObjectURL(url);
}
