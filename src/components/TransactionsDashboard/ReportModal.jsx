import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './TransactionsDashboard.css';

const ReportModal = ({ isOpen, onClose, filters }) => {
  const [reportFormat, setReportFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Создаем строку запроса из текущих фильтров
      const queryParams = new URLSearchParams();
      
      // Добавляем все применимые фильтры из props
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            // Для массивов, таких как payment processors
            value.forEach(val => queryParams.append(`${key}[]`, val));
          } else {
            queryParams.append(key, value);
          }
        }
      });
      
      // Добавляем формат отчета
      queryParams.append('format', reportFormat);
      
      // Делаем запрос для генерации отчета
      const response = await fetch(`/api/v1/transactions/report?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': reportFormat === 'csv' ? 'text/csv' : 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }

      // Получаем данные и инициируем скачивание файла
      const blob = await response.blob();
      const fileName = `transactions_report_${new Date().toISOString().slice(0, 10)}.${reportFormat}`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsGenerating(false);
      onClose();
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`Error generating report: ${error.message}`);
      setIsGenerating(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h2>Generate Report</h2>
          <button className="close-button" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="report-modal-content">
          <p className="report-description">
            Generate a report of the transactions based on your current filters.
            The report will include all data shown in the table.
          </p>
          
          <div className="report-format-section">
            <h3>Report Format</h3>
            <div className="report-format-options">
              <div className="format-option">
                <input 
                  type="radio" 
                  id="csv-format" 
                  name="report-format" 
                  value="csv" 
                  checked={reportFormat === 'csv'} 
                  onChange={() => setReportFormat('csv')}
                />
                <label htmlFor="csv-format">
                  <span className="format-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <div>
                    <span className="format-title">CSV File</span>
                    <span className="format-desc">Compatible with Excel, Google Sheets</span>
                  </div>
                </label>
              </div>
              
              <div className="format-option">
                <input 
                  type="radio" 
                  id="excel-format" 
                  name="report-format" 
                  value="xlsx" 
                  checked={reportFormat === 'xlsx'} 
                  onChange={() => setReportFormat('xlsx')}
                />
                <label htmlFor="excel-format">
                  <span className="format-icon excel-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <div>
                    <span className="format-title">Excel File</span>
                    <span className="format-desc">Native Excel format (.xlsx)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="report-modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button 
            className={`generate-button ${isGenerating ? 'generating' : ''}`}
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="report-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReportModal; 