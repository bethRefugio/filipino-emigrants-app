import { X } from 'lucide-react';
import React from 'react';

export default function EditModal({ form, setForm, handleUpdate, setShowEditModal }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Edit Record</h3>
            <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
            </button>
        </div>
        
        {Object.keys(form).map(key => (
            <div key={key} className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key === 'notReported' ? 'Not Reported' : key}
            </label>
            <input
                name={key}
                type={key === 'country' ? 'text' : 'number'}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${key}`}
            />
            </div>
        ))}

        <div className="flex gap-3 mt-6">
            <button 
            onClick={handleUpdate}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
            Update Record
            </button>
            <button 
            onClick={() => setShowEditModal(false)}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
            Cancel
            </button>
        </div>
        </div>
    </div>
  );
}