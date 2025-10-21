import React from 'react';
import type { ServiceProvider } from '../types';

interface BookingModalProps {
  provider: ServiceProvider;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ provider, onClose }) => {
  const handleConnectCalendar = () => {
    alert("Google Calendar integration is coming soon!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
        <img src={provider.avatarUrl} alt={provider.name} className="w-20 h-20 rounded-full mx-auto -mt-16 border-4 border-white" />
        <h2 className="text-xl font-bold mt-4">Book an Appointment</h2>
        <p className="text-gray-600 mb-2">with</p>
        <p className="font-semibold text-lg text-brand-dark">{provider.name}</p>
        <p className="text-sm text-gray-500">{provider.service}</p>
        <div className="my-6 space-y-2">
          {/* Placeholder for date/time selection */}
          <div className="bg-gray-100 p-3 rounded-lg text-left">
            <p className="text-sm font-semibold">Connect your calendar to schedule seamlessly.</p>
          </div>
        </div>
        <button
          onClick={handleConnectCalendar}
          className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M21 6.5c-1.25 0-2.45.1-3.57.29a.5.5 0 00-.43.5V9.5c0 .28.22.5.5.5h5c.28 0 .5-.22.5-.5v-3c0-.28-.22-.5-.5-.5H21zM5 8h10v8H5z"/><path d="M17 3h-2v2h2V3zm-4 0h-2v2h2V3zM9 3H7v2h2V3z"/><path d="M19 21H5c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2zm-12-9h10v2H7v-2z"/></svg>
          Connect to Google Calendar
        </button>
        <button onClick={onClose} className="w-full text-gray-600 font-semibold py-2 mt-2">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BookingModal;
