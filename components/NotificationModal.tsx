

import React from 'react';

interface NotificationModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold text-xl">&times;</button>
        </div>
        <div className="p-4 space-y-4">
            <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">A</div>
                <div className="flex-1 bg-gray-100 p-3 rounded-lg rounded-tl-none">
                    <p className="text-sm text-gray-800">{message}</p>
                </div>
            </div>
        </div>
         <div className="p-4 border-t text-center">
            <button onClick={onClose} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;