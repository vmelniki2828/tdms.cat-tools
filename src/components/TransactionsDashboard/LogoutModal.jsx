import React from 'react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  // Обработка клика вне модального окна
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal open" onClick={handleOutsideClick}>
      <div className="modal-content max-w-md w-full bg-white rounded-2xl shadow-xl transform transition-all animate__animated animate__fadeInUp">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Log Out</h3>
          <p className="text-gray-500 text-center mb-6">Are you sure you want to log out of the Transactions Dashboard?</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={onClose} 
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              className="px-4 py-2 border border-transparent rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              Yes, Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal; 