import React, { useState, useEffect } from 'react';
import './TransactionsDashboard/TransactionsDashboard.css';
import './Reports.css';

const Reports = () => {
  const [showModal, setShowModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  
  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        page_size: pageSize
      });
      
      const response = await fetch(`/api/v1/reports/?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Полученные данные отчетов:', data);
      
      // Проверяем различные возможные структуры ответа
      let reportsList = [];
      if (Array.isArray(data)) {
        reportsList = data;
      } else if (data.results && Array.isArray(data.results)) {
        reportsList = data.results;
      } else if (data.reports && Array.isArray(data.reports)) {
        reportsList = data.reports;
      } else if (data.items && Array.isArray(data.items)) {
        reportsList = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        reportsList = data.data;
      }
      
      setReports(reportsList);
      
      // Получаем общее количество страниц
      const count = data.count || data.total || reportsList.length;
      setTotalPages(Math.ceil(count / pageSize) || 1);
      
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(`Failed to load reports: ${err.message}`);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/v1/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = '/login';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const openModal = () => {
    // setShowModal(true);
    window.location.href = '/dashboard';
  };

  const closeModal = () => {
    setShowModal(false);
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchReports(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchReports(currentPage + 1);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(',', '');
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString;
    }
  };

  // Функция для безопасного получения значения из объекта
  const safeGet = (obj, path, defaultValue = '-') => {
    if (!obj) return defaultValue;
    const keys = path.split('.');
    return keys.reduce(
      (acc, key) => (acc && acc[key] !== undefined && acc[key] !== null) ? acc[key] : defaultValue,
      obj
    );
  };
  
  return (
    <div className="page-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-title-container">
            <h1 className="dashboard-title">Reports Dashboard</h1>
            <p className="dashboard-subtitle">
              Generate and view reports from your transaction data
            </p>
          </div>
          <div className="nav-container">
            <a href="/" className="nav-link">
              Transactions
            </a>
            <a href="/reports" className="nav-link active">
              Reports
            </a>
            <a href="/jobs" className="nav-link">
              Jobs
            </a>
            <button onClick={handleLogout} className="logout-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container main-content">
        <div className="reports-card-container">
          <div className="reports-header">
            <div className="reports-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="reports-title">Reports List</h2>
          </div>

          <div className="reports-content">
            {loading ? (
              <div className="loading-state">
                <p>Loading reports...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
              </div>
            ) : reports.length === 0 ? (
              // Empty state
              <div className="empty-reports-container">
                <div className="report-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                </div>
                <div className="empty-state-text">
                  <h3>No reports found</h3>
                  <p>You haven't generated any reports yet.</p>
                </div>
                <button 
                  onClick={openModal}
                  className="generate-report-button"
                >
                  Generate Your First Report
                </button>
              </div>
            ) : (
              // Reports list в формате карточек
              <div className="reports-cards-list">
                {reports.map((report, index) => {
                  const name = safeGet(report, 'name') || safeGet(report, 'title') || 'Untitled Report';
                  const status = safeGet(report, 'status') || 'Completed';
                  const date = formatDate(safeGet(report, 'created_at') || safeGet(report, 'createdAt'));
                  const format = safeGet(report, 'format') || 'XLSX'; 
                  
                  return (
                    <div key={safeGet(report, 'id') || safeGet(report, '_id') || index} className="report-card">
                      <div className="report-card-header">
                        <h3 className="report-name">{name}</h3>
                        <div className={`report-status ${status.toLowerCase()}`}>
                          <span>✓</span> {status}
                        </div>
                      </div>
                      
                      <div className="report-card-details">
                        <div className="report-date">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="report-detail-icon">
                            <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                          </svg>
                          {date}
                        </div>
                        
                        <div className="report-format">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="report-detail-icon">
                            <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zM10 8a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 0110 8z" clipRule="evenodd" />
                          </svg>
                          Format: {format}
                        </div>
                      </div>
                      
                      <div className="report-card-actions">
                        <button className="report-action-button details-button">
                          Details
                        </button>
                        <button className="report-action-button delete-button">
                          Delete
                        </button>
                        <button className="report-action-button download-button">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="download-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="reports-footer">
            <div className="pagination-controls">
              <button 
                className="pagination-button" 
                disabled={currentPage === 1 || loading} 
                onClick={handlePrevPage}
              >
                Previous
              </button>
              <button 
                className="pagination-button" 
                disabled={currentPage >= totalPages || loading}
                onClick={handleNextPage}
              >
                Next
              </button>
            </div>
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="report-modal">
            <div className="modal-header">
              <h3>Generate Report</h3>
              <button onClick={closeModal} className="close-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <h4>Report Type</h4>
                <div className="radio-group">
                  <div className="radio-option">
                    <input id="transactions-report" name="report-type" type="radio" defaultChecked />
                    <label htmlFor="transactions-report">
                      Transactions Report
                    </label>
                  </div>
                  <div className="radio-option">
                    <input id="analytics-report" name="report-type" type="radio" />
                    <label htmlFor="analytics-report">
                      Analytics Report
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <h4>Format</h4>
                <div className="radio-group">
                  <div className="radio-option">
                    <input id="format-csv" name="format" type="radio" defaultChecked />
                    <label htmlFor="format-csv">
                      CSV
                    </label>
                  </div>
                  <div className="radio-option">
                    <input id="format-excel" name="format" type="radio" />
                    <label htmlFor="format-excel">
                      Excel
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="cancel-button">
                Cancel
              </button>
              <button className="submit-button">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
