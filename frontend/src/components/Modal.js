import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-600/30 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
          <h2 className="text-xl font-bold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors duration-200 p-2 hover:bg-slate-700 rounded-full"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)] bg-gradient-to-br from-slate-800 to-slate-900">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 