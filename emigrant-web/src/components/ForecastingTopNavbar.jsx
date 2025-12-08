import React from 'react';

export default function ForcastingTopNavbar({ title }) {
  return (
    <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">AI-powered emigration forecasting & analysis</p>
      </div>
    </div>
  );
}