import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'react-feather';
import './Jobs.css';

const JobDetailsModal = ({ job, onClose, calculateProgress }) => {
  const navigate = useNavigate();

  const handleViewTransactions = () => {
    // Переходим на страницу транзакций и передаем данные фильтров через состояние
    navigate('/dashboard', {
      state: {
        filters: {
          fromDate: job.data.from_date,
          toDate: job.data.to_date,
          jobId: job.id,
          payments: job.data.payments
        }
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="job-details-modal no-scroll-modal">
        <div className="job-details-header">
          <h3>Job Details</h3>
          <button onClick={onClose} className="close-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="job-details-content">
          <div className="job-info-grid">
            <div>
              <div className="job-info-label">Job ID</div>
              <div className="job-info-value">{job.id}</div>
            </div>
            <div>
              <div className="job-info-label">Status</div>
              <span className={`status-badge status-${job.status.toLowerCase()}`}>
                {job.status.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="job-info-grid">
            <div>
              <div className="job-info-label">Type</div>
              <div className="job-info-value">load_history</div>
            </div>
            <div>
              <div className="job-info-label">Created At</div>
              <div className="job-info-value">{new Date(job.created_at).toLocaleString()}</div>
            </div>
          </div>

          {job.type === 'load_history' && job.data && (
            <>
              <div className="job-section">
                <h4 className="job-section-title">Job Data</h4>
                
                <div className="job-data-grid">
                  <div className="job-data-item">
                    <div className="job-info-label">From Date</div>
                    <div className="job-info-value">{job.data.from_date}</div>
                  </div>
                  <div className="job-data-item">
                    <div className="job-info-label">To Date</div>
                    <div className="job-info-value">{job.data.to_date}</div>
                  </div>
                </div>
              </div>

              <div className="job-section">
                <div className="job-info-label">Payments</div>
                <div className="payments-list">
                  {job.data.payments && job.data.payments.map(payment => (
                    <span key={payment} className="payment-tag">
                      {payment}
                    </span>
                  ))}
                </div>
              </div>

              {job.data.progress && (
                <div className="job-section">
                  <h4 className="job-section-title">Progress</h4>
                  
                  <div className="progress-section">
                    <div className="progress-header">
                      <div className="job-info-label">Overall Progress</div>
                      <div className="progress-percentage">{calculateProgress(job)}%</div>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-value" style={{ width: `${calculateProgress(job)}%` }}></div>
                    </div>
                  </div>

                  <div className="status-items">
                    <div className="status-item">
                      <div className="status-item-icon fundist">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                          <path d="M2 17l10 5 10-5"></path>
                          <path d="M2 12l10 5 10-5"></path>
                        </svg>
                      </div>
                      <div className="status-item-name">Fundist Data</div>
                      <div className={`status-item-status ${job.data.progress.fundist_ready ? 'status-ready' : 'status-pending'}`}>
                        {job.data.progress.fundist_ready ? 'Ready' : 'Pending'}
                      </div>
                    </div>

                    <div className="status-item">
                      <div className="status-item-icon migration">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                      </div>
                      <div className="status-item-name">Data Migration</div>
                      <div className="status-item-status status-pending">Pending</div>
                    </div>
                  </div>

                  <div className="job-section">
                    <h4 className="job-info-label">Payment Processors</h4>
                    {Object.entries(job.data.progress.payments || {}).map(([payment, status]) => (
                      <div key={payment} className="payment-processor-card">
                        <div className="payment-processor-row">
                          <div className="payment-processor-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                              <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                          </div>
                          <div className="payment-processor-name">{payment}</div>
                          <div className={`payment-processor-status status-${status.processed ? 'processed' : status.ready ? 'ready' : 'pending'}`}
                               style={{ marginLeft: 'auto' }}>
                            {status.processed ? 'Processed' : status.ready ? 'Ready' : 'Pending'}
                          </div>
                        </div>
                        <div className="payment-processor-progress-bar-container">
                          <div className="payment-processor-progress-bar">
                            <div className="payment-processor-progress-bar-value" style={{ width: status.processed ? '100%' : status.ready ? '50%' : '0%' }}></div>
                          </div>
                          <div className="payment-processor-progress-labels">
                            <span>Data Loading {status.ready && <span className="check-icon">✓</span>}</span>
                            <span style={{ marginLeft: 'auto' }}>Processing {status.processed && <span className="check-icon">✓</span>}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {job.status === 'completed' && (
                    <div className="job-success-block">
                      <div className="job-success-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" stroke="green" strokeWidth="2" fill="#eafff3" />
                          <path d="M9 12l2 2l4-4" stroke="green" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                      <div>
                        <div className="job-success-title">Job Completed Successfully</div>
                        <div className="job-success-message">Transaction data has been loaded and processed successfully.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {job.status === 'pending' && (
                <div className="job-progress-alert">
                  <div className="alert-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">Job In Progress</div>
                    <div className="alert-message">The system is currently processing transaction data. This page will auto-refresh.</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="job-details-footer">
          <button 
            className="view-transactions-button"
            onClick={handleViewTransactions}
          >
            View Transactions
            <ArrowRight className="button-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal; 