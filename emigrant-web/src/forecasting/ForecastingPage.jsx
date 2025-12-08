import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import LSTMForecast from './components/LSTMForecast'
import MLPForecast from './components/MLPForecast'
import LineGraphs from './components/LineGraphs'
import { AVAILABLE_DATASETS, fetchAggregatedYearlyData } from './services/dataService'
import './forecasting.css'
import { getBestOverallRun } from '../services/modelRuns'

// Custom Tooltip Component - WITHOUT percentages
const CustomTooltip = ({ active, payload, label, datasetName, selectedDataset }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const breakdown = data.breakdown || {};
    
    const shouldLimitBreakdown = ['origin', 'province'].includes(selectedDataset);
    const topLimit = 5;
    
    let breakdownEntries = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
    let displayEntries = breakdownEntries;
    let othersCount = 0;
    let othersTotal = 0;
    
    if (shouldLimitBreakdown && breakdownEntries.length > topLimit) {
      displayEntries = breakdownEntries.slice(0, topLimit);
      const remainingEntries = breakdownEntries.slice(topLimit);
      othersCount = remainingEntries.length;
      othersTotal = remainingEntries.reduce((sum, [, value]) => sum + value, 0);
    }
    
    return (
      <div className="custom-tooltip">
        <p className="tooltip-year"><strong>Year: {label}</strong></p>
        <p className="tooltip-total">
          <strong>Total Emigrants: {data.emigrants?.toLocaleString()}</strong>
        </p>
        
        {displayEntries.length > 0 && (
          <div className="tooltip-breakdown">
            <p className="breakdown-title">
              {shouldLimitBreakdown ? `Top ${topLimit} Breakdown:` : 'Breakdown:'}
            </p>
            {displayEntries.map(([key, value]) => (
              <p key={key} className="breakdown-item">
                • {key}: <strong>{value.toLocaleString()}</strong>
              </p>
            ))}
            {othersCount > 0 && (
              <p className="breakdown-item breakdown-others">
                • Others ({othersCount} more): <strong>{othersTotal.toLocaleString()}</strong>
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

function ForecastingPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDataset, setSelectedDataset] = useState('sex')
  const [error, setError] = useState(null)
  const [bestModel, setBestModel] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [selectedDataset])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const dataset = AVAILABLE_DATASETS.find(d => d.id === selectedDataset)
      console.log('Loading Firebase dataset:', selectedDataset, dataset)
      
      const firebaseData = await fetchAggregatedYearlyData(selectedDataset)
      
      console.log('Firebase data loaded:', firebaseData)
      
      if (!firebaseData || firebaseData.length === 0) {
        throw new Error(`No data found for ${dataset?.name || selectedDataset}. Please add data to Firebase.`)
      }
      
      setData(firebaseData)
      
      // Load best model for this dataset
      const best = await getBestOverallRun(selectedDataset)
      setBestModel(best)
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error.message)
      setLoading(false)
    }
  }

  const handleNavigateToForecast = () => {
    navigate(`/forecasting-graph`)
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
        <h1>Error Loading Data</h1>
        <div style={{
          color: 'white',
          background: 'rgba(244, 67, 54, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '20px auto'
        }}>
          <p style={{margin: '0 0 10px 0', fontSize: '16px'}}>{error}</p>
          <p style={{margin: '0', fontSize: '14px'}}>
            Available datasets: {AVAILABLE_DATASETS.map(d => d.name).join(', ')}
          </p>
        </div>
        <button 
          onClick={loadData} 
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            fontSize: '16px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  const currentDataset = AVAILABLE_DATASETS.find(d => d.id === selectedDataset)

  return (
    <div className="app">
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
        Emigrant Population Analysis & Forecasting
      </h1>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <button
            onClick={handleNavigateToForecast}
            style={{
              padding: '10px 14px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#059669'}
            onMouseOut={(e) => e.target.style.background = '#10b981'}
          >
            📊 View Forecast Graph
          </button>
          <button
            onClick={() => (window.location.href = '/all-models')}
            style={{
              padding: '10px 14px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.background = '#2563eb'}
          >
            📈 View Training History
          </button>
        </div>
      </div>
      
      {/* Dataset Selection */}
      <section className="controls-section">
        <div className="control-group">
          <label htmlFor="dataset">Select Dataset:</label>
          <select 
            id="dataset"
            value={selectedDataset} 
            onChange={(e) => setSelectedDataset(e.target.value)}
          >
            {AVAILABLE_DATASETS.map(dataset => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Historical Data Graph */}
      <section className="original-section">
        <h2>Historical Data: Emigration Trends - {currentDataset?.name}</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={500}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              key={`${selectedDataset}-${data.length}`}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                label={{ value: 'Year', position: 'insideBottom', offset: -10 }}
              />
              <YAxis
                label={{ value: 'Emigrants', angle: -90, position: 'left' }}
              />
              <Tooltip 
                content={<CustomTooltip datasetName={currentDataset?.name} selectedDataset={selectedDataset} />}
              />
              <Legend 
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: '20px' }} // space between legend and chart
              />
              <Line
                type="monotone"
                dataKey="emigrants"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Emigrants"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="info">
          <p>Dataset: {currentDataset?.name}</p>
          {data.length > 0 && (
            <>
              <p>Period: {data[0]?.year} - {data[data.length - 1]?.year}</p>
              <p>Total data points: {data.length}</p>
            </>
          )}
        </div>
      </section>

      {/* LSTM Forecasting Section */}
      <section className="forecast-section">
        <LSTMForecast 
          data={data} 
          datasetName={selectedDataset}
        />
      </section>

      {/* MLP Forecasting Section */}
      <section className="forecast-section">
        <MLPForecast 
          data={data} 
          datasetName={selectedDataset}
        />
      </section>
    </div>
  )
}

export default ForecastingPage