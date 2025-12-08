import React from 'react'

export default function NotificationModal({ open, type = 'success', message, onClose }) {
  if (!open) return null
  const isSuccess = type === 'success'
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }}>
      <div style={{
        background: 'white', borderRadius: 10, padding: 20, width: 360,
        boxShadow: '0 12px 30px rgba(0,0,0,0.2)', border: `2px solid ${isSuccess ? '#16a34a' : '#dc2626'}`
      }}>
        <h3 style={{ margin: '0 0 8px', color: isSuccess ? '#166534' : '#991b1b' }}>
          {isSuccess ? 'Success' : 'Error'}
        </h3>
        <p style={{ margin: '0 0 16px', color: '#111827' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 14px',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              background: isSuccess ? '#16a34a' : '#dc2626',
              color: 'white',
              fontWeight: 600
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}