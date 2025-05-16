import React from 'react';

const Pagination = ({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }) => {
  const handlePageInput = (e) => {
    const pageNumber = parseInt(e.target.value);
    if (pageNumber && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  const handlePageInputKeyPress = (e) => {
    // Allow only numbers and specific keys
    const allowedKeys = ['Enter', 'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!allowedKeys.includes(e.key) && !/[0-9]/.test(e.key)) {
      e.preventDefault();
      return false;
    }
    // Handle Enter key
    if (e.key === 'Enter') {
      handlePageInput(e);
    }
    return true;
  };

  const handlePageSizeChange = (e) => {
    onPageSizeChange(e.target.value);
  };

  // Calculate the range of items being displayed
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination-container">
      <div className="pagination-controls">
        {/* First Page */}
        <button 
          onClick={() => onPageChange(1)} 
          className="pagination-button"
          aria-label="First Page"
          disabled={currentPage <= 1}
        >
          <span className="pagination-symbol">«</span>
        </button>

        {/* Previous Page */}
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          className="pagination-button"
          aria-label="Previous Page"
          disabled={currentPage <= 1}
        >
          <span className="pagination-symbol">‹</span>
        </button>

        {/* Page Input */}
        <div className="page-input-container">
          <span className="page-text">Page</span>
          <input 
            type="text" 
            min="1"
            max={totalPages}
            className="page-input" 
            value={currentPage}
            onChange={handlePageInput}
            onKeyPress={handlePageInputKeyPress}
          />
          <span className="page-text">of {totalPages}</span>
        </div>

        {/* Next Page */}
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          className="pagination-button"
          aria-label="Next Page"
          disabled={currentPage >= totalPages}
        >
          <span className="pagination-symbol">›</span>
        </button>

        {/* Last Page */}
        <button 
          onClick={() => onPageChange(totalPages)} 
          className="pagination-button"
          aria-label="Last Page"
          disabled={currentPage >= totalPages}
        >
          <span className="pagination-symbol">»</span>
        </button>
      </div>

      {/* Items per page selector and showing details */}
      <div className="pagination-info">
        <div className="items-per-page">
          <span className="items-per-page-text">Items per page:</span>
          <div className="select-wrapper">
            <select 
              id="pageSize" 
              onChange={handlePageSizeChange} 
              value={pageSize}
            >
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>
        <div className="items-info">
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
      </div>
    </div>
  );
};

export default Pagination; 