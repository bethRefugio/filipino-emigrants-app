import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LineGraphs from './LineGraphs'
import { AVAILABLE_DATASETS, fetchAggregatedYearlyData } from '../services/dataService'
import '../forecasting.css'

function ForecastGraphPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [forecasts, setForecasts] = useState([])
  const [selectedDataset, setSelectedDataset] = useState('sex')
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [selectedDataset])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setForecasts([])
    try {
      const dataset = AVAILABLE_DATASETS.find(d => d.id === selectedDataset)
      
      if (!dataset) {
        throw new Error('Invalid dataset selected')
      }
      
      const firebaseData = await fetchAggregatedYearlyData(selectedDataset)
      
      if (!firebaseData || firebaseData.length === 0) {
        throw new Error(`No data found for ${dataset.name}`)
      }
      
      setData(firebaseData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="app">
        <h1>Loading data...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <button 
          onClick={() => navigate('/forecasting')}
          style={{
            padding: '10px 14px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back to Forecasting
        </button>
        <h1>Error Loading Data</h1>
        <div style={{
          color: 'white',
          background: 'rgba(244, 67, 54, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '20px auto'
        }}>
          <p style={{margin: '0', fontSize: '16px'}}>{error}</p>
        </div>
      </div>
    )
  }

  const currentDataset = AVAILABLE_DATASETS.find(d => d.id === selectedDataset)

  return (
    <div className="app">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/forecasting')}
          style={{
            padding: '10px 14px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500
          }}
          onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
          onMouseOut={(e) => e.target.style.background = '#2563eb'}
        >
          ← Back to Forecasting
        </button>

        <div className="control-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label htmlFor="dataset" style={{ fontWeight: 600, fontSize: '16px' }}>
            Select Dataset:
          </label>
          <select 
            id="dataset"
            value={selectedDataset} 
            onChange={(e) => setSelectedDataset(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              fontSize: '14px',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            {AVAILABLE_DATASETS.map(dataset => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <LineGraphs 
        data={data} 
        selectedDataset={selectedDataset}
        datasetName={selectedDataset}  // PASS ID, NOT DISPLAY NAME
        forecasts={forecasts}
        onForecastUpdate={setForecasts}
      />
    </div>
  )
}

export default ForecastGraphPage