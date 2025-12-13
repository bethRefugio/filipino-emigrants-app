import * as tf from '@tensorflow/tfjs';

export function buildMLPModel(lookback = 3, features = 2, units1 = 85, units2 = 74, activation1 = 'relu', activation2 = 'tanh', outputSize = 1) {
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

  // Output layer - supports multiple outputs
  model.add(tf.layers.dense({
    units: outputSize,
    activation: 'linear'
  }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  return model;
}

function flattenSequences(X) {
  return X.map(seq => seq.flat());
}

export async function trainMLPModel(model, X, y, onEpochEnd, epochs = 100, validationSplit = 0.2) {
  const flatX = flattenSequences(X);
  const xs = tf.tensor2d(flatX);
  const ys = tf.tensor2d(y);

  const batchSize = Math.min(32, X.length);

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

  xs.dispose();
  ys.dispose();

  return history;
}

export async function predictMLP(model, X) {
  const flatX = flattenSequences(X);
  const xs = tf.tensor2d(flatX);
  const predictions = model.predict(xs);
  const result = await predictions.array();

  xs.dispose();
  predictions.dispose();

  return result[0]; // Return array for multiple outputs
}

export async function saveMLPModel(model, metadata) {
  const dataset = metadata.dataset || 'default';
  await model.save(`indexeddb://emigrants-mlp-model-${dataset}`);
  localStorage.setItem(`mlp-metadata-${dataset}`, JSON.stringify(metadata));
}

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
      const getReq = store.get('mlp_model');
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
    const metadataText = await metadataFile.text();
    const metadata = JSON.parse(metadataText);

    const modelJsonFile = Array.from(modelFiles).find(f => f.name.endsWith('model.json'));
    if (!modelJsonFile) {
      throw new Error('model.json file not found');
    }

    const modelJsonText = await modelJsonFile.text();
    const modelJson = JSON.parse(modelJsonText);

    let weightData = new ArrayBuffer(0);
    let weightSpecs = [];

    if (modelJson.weightsManifest && Array.isArray(modelJson.weightsManifest)) {
      for (const manifest of modelJson.weightsManifest) {
        if (manifest.weights) {
          weightSpecs = weightSpecs.concat(manifest.weights);
        }

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

    const model = await tf.loadLayersModel(tf.io.fromMemory(modelArtifacts));
    await model.save('indexeddb://emigrants-mlp-model');
    localStorage.setItem('mlp-metadata', JSON.stringify(metadata));

    return { model, metadata };
  } catch (error) {
    console.error('Error uploading MLP model:', error);
    throw error;
  }
}

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

export async function downloadMLPModel(model, metadata) {
  await model.save('downloads://emigrants-mlp-model');

  const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(metadataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mlp-metadata.json';
  a.click();
  URL.revokeObjectURL(url);
}