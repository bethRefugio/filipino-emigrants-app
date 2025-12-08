import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { loadLSTMModel, predictLSTM } from '../models/lstmModel'
import { loadMLPModel, predictMLP } from '../models/mlpModel'
import { normalizeData, denormalize } from '../utils/dataPreparation'
import { getBestRun } from '../../services/modelRuns'
import NotificationModal from './NotificationModal'

const CustomTooltip = ({ active, payload, label, selectedDataset }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const breakdown = data.breakdown || {}
    
    const shouldLimitBreakdown = ['origin', 'province'].includes(selectedDataset)
    const topLimit = 5
    
    let breakdownEntries = Object.entries(breakdown).sort(([, a], [, b]) => b - a)
    let displayEntries = breakdownEntries
    let othersCount = 0
    let othersTotal = 0
    
    if (shouldLimitBreakdown && breakdownEntries.length > topLimit) {
      displayEntries = breakdownEntries.slice(0, topLimit)
      const remainingEntries = breakdownEntries.slice(topLimit)
      othersCount = remainingEntries.length
      othersTotal = remainingEntries.reduce((sum, [, value]) => sum + value, 0)
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
    )
  }
  return null
}

function LineGraphs({ data, selectedDataset, datasetName, forecasts, onForecastUpdate }) {
  const [modelType, setModelType] = useState('LSTM')
  const [forecastYears, setForecastYears] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const [notice, setNotice] = useState({ open: false, type: 'success', message: '' })
  const showNotice = (type, message) => setNotice({ open: true, type, message })

  const FEATURES = ['emigrants']
  const TARGET = 'emigrants'

  const handleGenerateForecast = async () => {
  setIsGenerating(true)
  setError(null)
  
  try {
    const best = await getBestRun(modelType, selectedDataset)
    if (!best) {
      throw new Error(`No best ${modelType} run found for dataset "${selectedDataset}". Please train or upload a model first.`)
    }

    // Load model for THIS dataset
    let loaded
    if (modelType === 'LSTM') {
      loaded = await loadLSTMModel(selectedDataset)
    } else {
      loaded = await loadMLPModel(selectedDataset)
    }
    
    if (!loaded || !loaded.model || !loaded.metadata) {
      throw new Error(`${modelType} model weights/metadata not found for "${selectedDataset}". Please train a model first.`)
    }

    const { model, metadata } = loaded
    const { mins, maxs, lastData, lookback, lastYear } = metadata

    // Generate forecasts iteratively
    let currentSequence = lastData.map(row => ({ year: row.year, emigrants: row.emigrants }))
    const predictions = []
    let currentYear = lastYear

    const yearsToPredict = Math.max(1, parseInt(forecastYears || '1'))

    for (let i = 0; i < yearsToPredict; i++) {
      const normalized = currentSequence.map(row => ({
        emigrants: (row.emigrants - mins.emigrants) / (maxs.emigrants - mins.emigrants)
      }))
      const input = [normalized.map(row => FEATURES.map(f => row[f]))]

      const normalizedPred =
        modelType === 'LSTM' ? await predictLSTM(model, input) : await predictMLP(model, input)

      const predictedEmigrants = denormalize(normalizedPred[0], mins[TARGET], maxs[TARGET])

      currentYear++
      predictions.push({
        year: currentYear.toString(),
        emigrants: Math.round(predictedEmigrants),
        isForecast: true
      })

      // Slide window
      currentSequence = [...currentSequence.slice(1), { year: currentYear, emigrants: predictedEmigrants }]
    }

    if (onForecastUpdate) onForecastUpdate(predictions)
    showNotice('success', `Generated ${yearsToPredict} year(s) forecast using BEST ${modelType} model for "${selectedDataset}".`)
  } catch (error) {
    console.error('Error generating forecast:', error)
    setError(error.message)
    showNotice('error', 'Error generating forecast: ' + error.message)
  } finally {
    setIsGenerating(false)
  }
}

  const chartData = [...data, ...forecasts]

  return (
    <div className="line-graphs-container">
      <NotificationModal
        open={notice.open}
        type={notice.type}
        message={notice.message}
        onClose={() => setNotice({ ...notice, open: false })}
      />

      {/* Header Section */}
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: 8, 
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          margin: '0 0 24px 0', 
          fontSize: '24px', 
          fontWeight: 600,
          color: '#1f2937',
          textAlign: 'center'
        }}>
          Emigration Trends & Forecast - {datasetName}
        </h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          alignItems: 'flex-end',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <div>
            <label htmlFor="model-select" style={{ 
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
              fontSize: '14px',
              color: '#374151'
            }}>
              Model:
            </label>
            <select
              id="model-select"
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              disabled={isGenerating}
              style={{
                padding: '10px 14px',
                borderRadius: 6,
                border: '2px solid #d1d5db',
                fontSize: '14px',
                cursor: 'pointer',
                minWidth: '150px',
                background: 'white',
                fontWeight: 500
              }}
            >
              <option value="LSTM">LSTM</option>
              <option value="MLP">MLP</option>
            </select>
          </div>

          <div>
            <label htmlFor="years-input" style={{ 
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
              fontSize: '14px',
              color: '#374151'
            }}>
              Years to Predict:
            </label>
            <input
              id="years-input"
              type="number"
              min="1"
              max="10"
              value={forecastYears}
              onChange={(e) => setForecastYears(parseInt(e.target.value) || 1)}
              disabled={isGenerating}
              style={{
                padding: '10px 14px',
                borderRadius: 6,
                border: '2px solid #d1d5db',
                fontSize: '14px',
                width: '120px',
                fontWeight: 500
              }}
            />
          </div>

          <button
            onClick={handleGenerateForecast}
            disabled={isGenerating}
            style={{
              padding: '10px 24px',
              background: isGenerating ? '#94a3b8' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s',
              boxShadow: isGenerating ? 'none' : '0 2px 4px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!isGenerating) {
                e.target.style.background = '#2563eb'
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.4)'
              }
            }}
            onMouseOut={(e) => {
              if (!isGenerating) {
                e.target.style.background = '#3b82f6'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)'
              }
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate Forecast'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 14,
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      {/* Chart Section */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: 8, 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: 20
      }}>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              label={{ value: 'Year', position: 'insideBottom', offset: -10, style: { fontWeight: 600 } }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Emigrants', angle: -90, position: 'insideLeft', style: { fontWeight: 600 } }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              content={<CustomTooltip selectedDataset={selectedDataset} />}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            
            <Line
              type="monotone"
              dataKey={(entry) => entry.isForecast ? null : entry.emigrants}
              stroke="#22c55e"
              strokeWidth={3}
              name="Historical Data"
              dot={(props) => {
                const { cx, cy, payload } = props
                if (payload.isForecast || !payload.emigrants) return null
                return <circle cx={cx} cy={cy} r={4} fill="#22c55e" />
              }}
              connectNulls={false}
              isAnimationActive={true}
            />
            
            <Line
              type="monotone"
              dataKey={(entry) => entry.isForecast ? entry.emigrants : null}
              stroke="#3b82f6"
              strokeWidth={3}
              strokeDasharray="5 5"
              name={`${modelType} Forecast`}
              dot={(props) => {
                const { cx, cy, payload } = props
                if (!payload.isForecast || !payload.emigrants) return null
                return <circle cx={cx} cy={cy} r={5} fill="#3b82f6" />
              }}
              connectNulls={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Table */}
      {forecasts.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            background: 'white', 
            borderRadius: 8, 
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '850px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              padding: '14px 18px',
              borderBottom: '2px solid #2563eb'
            }}>
              <h3 style={{ 
                margin: 0, 
                color: 'white',
                fontSize: '17px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📊 Forecast Details ({modelType} Model)
              </h3>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed'
              }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: '#374151'
                    }}>
                      Year
                    </th>
                    <th style={{ 
                      padding: '12px 16px', 
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: '#374151'
                    }}>
                      Predicted Emigrants
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {forecasts.map((f, i) => (
                    <tr 
                      key={i} 
                      style={{ 
                        background: i % 2 === 0 ? '#ffffff' : '#f9fbfd',
                        borderBottom: i === forecasts.length - 1 ? 'none' : '1px solid #e5e7eb'
                      }}
                    >
                      <td style={{ 
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#111827',
                        fontWeight: 600
                      }}>
                        {f.year}
                      </td>
                      <td style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#0f172a',
                        fontWeight: 700
                      }}>
                        {f.emigrants?.toLocaleString() || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LineGraphs