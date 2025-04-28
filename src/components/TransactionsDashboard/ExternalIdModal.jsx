import React, { useEffect, useRef } from 'react';

const ExternalIdModal = ({ isOpen, externalId, onClose }) => {
  const modalRef = useRef(null);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(externalId)
      .then(() => {
        alert('External ID скопирован в буфер обмена!');
      })
      .catch(error => {
        console.error('Не удалось скопировать External ID:', error);
      });
  };

  const handleOutsideClick = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal open">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2 className="modal-title">External ID</h2>
          <button className="close-button" onClick={onClose}>
            <svg className="close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="external-id-container">
            <div className="external-id-value">{externalId}</div>
          </div>
          
          <div className="modal-actions">
            <button className="copy-button" onClick={handleCopyToClipboard}>
              <svg className="copy-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Копировать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalIdModal; 