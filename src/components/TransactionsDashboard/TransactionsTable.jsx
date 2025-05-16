import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './TransactionsDashboard.css';

const TransactionsTable = ({ transactions, isLoading, isEmpty, onShowExternalId, payments = [] }) => {
  // State for tracking the number of sync attempts for each transaction
  const [syncAttempts, setSyncAttempts] = useState({});
  // State for tracking sync loading
  const [syncLoading, setSyncLoading] = useState({});
  // State for комментариев
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [currentTransactionComments, setCurrentTransactionComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  
  // Function to get payment name by payment_id
  const getPaymentNameById = (paymentId) => {
    if (!paymentId || !payments.length) return '-';
    
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return paymentId; // Return the ID if payment not found
    
    // Return formatted payment name
    return payment.name || payment.provider || payment.id;
  };
  
  // Function for opening comments modal
  const openCommentsModal = (e, tx) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Get transaction data
    const txId = tx.id || tx.fundist_transaction?.id || tx.payment_id;
    setCurrentTransactionComments({
      id: txId,
      transaction: tx,
      comments: tx.comments || []
    });
    setShowCommentsModal(true);
  };
  
  // Function for closing comments modal
  const closeCommentsModal = () => {
    setShowCommentsModal(false);
    setCurrentTransactionComments(null);
  };
  
  // Function for syncing a transaction
  const handleSyncTransaction = async (e, tx) => {
    e.stopPropagation(); // Prevent event bubbling to avoid opening details page
    
    const txId = tx.id || tx.fundist_transaction?.id || tx.payment_id;
    if (!txId) return;
    
    // Check the number of attempts for this transaction
    const attempts = syncAttempts[txId] || 0;
    if (attempts >= 5) return;
    
    try {
      // Set the loading state for this transaction
      setSyncLoading(prev => ({ ...prev, [txId]: true }));
      
      // Send sync request to the new endpoint
      const response = await fetch(`/api/v1/transactions/manual-sync?id=${txId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
      
      // Increment attempt counter
      setSyncAttempts(prev => ({ 
        ...prev, 
        [txId]: (prev[txId] || 0) + 1 
      }));
      
      // For UI update (in a real app we would update the transaction data)
      alert('Sync completed successfully!');
      
    } catch (error) {
      console.error('Sync error:', error);
      alert(`Sync error: ${error.message}`);
    } finally {
      // Remove loading state
      setSyncLoading(prev => ({ ...prev, [txId]: false }));
    }
  };

  // Helper functions for displaying data
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'status_complete':
        return 'status-completed';
      case 'pending':
      case 'waiting_payment':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-default';
    }
  };

  const formatStatus = (status) => {
    if (!status) return '-';
    
    // Convert STATUS_NEW format to Status: New
    if (status.startsWith('STATUS_')) {
      const rawStatus = status.replace('STATUS_', '');
      return rawStatus.toLowerCase();
    }
    
    // Convert waiting_payment to Waiting payment
    if (status.includes('_')) {
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    
    return status;
  };

  const capitalizePayment = (payment) => {
    if (!payment) return '';
    return payment.charAt(0).toUpperCase() + payment.slice(1).toLowerCase();
  };

  const getPaymentInfo = (tx) => {
    const gateway = tx.fundist_transaction?.gateway || tx.gateway;
    
    // Get all necessary data
    const externalId = tx.fundist_transaction?.external_id || tx.external_id;
    const id = tx.payment_id || tx.fundist_transaction?.payment_id || tx.id || tx.fundist_transaction?.id;
    const status = tx.fundist_transaction?.status || tx.status;
    const amount = tx.fundist_transaction?.amount || tx.amount;
    
    // If there is bovapay, display full information
    if (gateway?.toLowerCase() === 'bovapay') {
      return (
        <div className="payment-info-content">
          <div className="payment-id">D: {id}</div>
          <div className="payment-status">Status: {formatStatus(status)}</div>
          <div className="payment-amount">Amount: {amount}</div>
          {externalId && <div className="payment-external-id">External ID: {externalId}</div>}
          <div className="payment-name">Payment:</div>
          <button className="payment-button">
            Bovapay
          </button>
        </div>
      );
    }
    
    // If there is payment information but not bovapay
    if (id || status || amount || externalId) {
      return (
        <div className="payment-info-content">
          {id && <div className="payment-id">D: {id}</div>}
          {status && <div className="payment-status">Status: {formatStatus(status)}</div>}
          {amount && <div className="payment-amount">Amount: {amount}</div>}
          {externalId && <div className="payment-external-id">External ID: {externalId}</div>}
          {gateway && (
            <>
              <div className="payment-name">Payment:</div>
              <div className="payment-gateway">{capitalizePayment(gateway)}</div>
            </>
          )}
        </div>
      );
    }
    
    // If there is no payment information
    if (!tx.payment_transaction) {
      return (
        <div className="no-payment-info">
          <svg xmlns="http://www.w3.org/2000/svg" className="info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>No payment info</span>
        </div>
      );
    }
    
    return <div className="table-cell-dash">-</div>;
  };

  const getGatewayInfo = (tx) => {
    const gateway = tx.fundist_transaction?.gateway || tx.gateway;
    if (!gateway) {
      return <div className="table-cell-dash">-</div>;
    }
    
    let description = '';
    // If there is additional information about the gateway, add it
    if (tx.description) {
      description = tx.description;
    } else if (tx.fundist_transaction?.description) {
      description = tx.fundist_transaction.description;
    }
    
    const currency = tx.fundist_transaction?.currency || tx.currency;
    
    // Check for 1click sber
    const is1ClickSber = gateway.toLowerCase().includes('1click') && 
                        (gateway.toLowerCase().includes('sber') || description.toLowerCase().includes('sber'));
    
    const isTrusted = tx.trusted || 
                    tx.fundist_transaction?.trusted || 
                    description.toLowerCase().includes('trusted');
    
    return (
      <div className="gateway-info">
        <svg xmlns="http://www.w3.org/2000/svg" className="gateway-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>
          {is1ClickSber ? "1click sber" : capitalizePayment(gateway)}
          {currency && <div className="gateway-currency">{currency.toLowerCase()}</div>}
          {isTrusted && <div className="gateway-trusted">trusted</div>}
          {!is1ClickSber && !isTrusted && description && <div className="gateway-description">{description}</div>}
        </span>
      </div>
    );
  };

  const getExternalIdInfo = (tx) => {
    const externalId = tx.fundist_transaction?.external_id || tx.external_id;
    
    if (!externalId) {
      return <div className="table-cell-dash">-</div>;
    }
    
    // If ID is too long, show view button
    if (externalId.length > 20) {
      return (
        <div 
          className="external-id-info"
          onClick={() => onShowExternalId(externalId)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="external-id-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>Click to view</span>
        </div>
      );
    }
    
    // For short IDs, show directly in the table
    return (
      <div className="external-id-value">
        <span>{externalId}</span>
      </div>
    );
  };

  const getUserStatusBadge = (status) => {
    const statusConfig = {
      'previp': {
        class: 'user-badge-previp',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="badge-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )
      },
      'vip': {
        class: 'user-badge-vip',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="badge-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )
      }
    };
    
    const config = statusConfig[status?.toLowerCase()] || {
      class: 'user-badge-default',
      icon: null
    };
    
    return (
      <div className={`user-status-badge ${config.class}`}>
        {config.icon}
        <span>{status}</span>
      </div>
    );
  };

  const getProjectBadge = (tx) => {
    const projectName = tx.fundist_transaction?.project || tx.project;
    
    if (!projectName) return null;
    
    return (
      <div className="project-badge">
        <svg xmlns="http://www.w3.org/2000/svg" className="project-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span>{projectName}</span>
      </div>
    );
  };

  const getTransactionTypeBadge = (type) => {
    if (!type) return null;
    
    return (
      <div className={`transaction-type-badge ${type === 'deposit' ? 'deposit-type' : 'withdrawal-type'}`}>
        {type}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(',', '');
    } catch (error) {
      return dateString;
    }
  };

  // Function for opening transaction details in a new window
  const openPaymentDetails = (tx) => {
    // Get transaction ID for forming URL
    const txId = tx.id || tx.fundist_transaction?.id || tx.payment_transaction?.id || Date.now().toString();
    
    // Save transaction data in localStorage for access from new window
    localStorage.setItem(`payment_details_${txId}`, JSON.stringify(tx));
    
    // Form URL for detailed transaction view
    const detailsUrl = `/payment-details/${txId}`;
    
    // Open new window with transaction details
    window.open(detailsUrl, '_blank', 'noopener,noreferrer');
  };

  // Function for adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      // Показываем индикатор загрузки во время отправки запроса
      const commentButton = document.querySelector('.add-comment-button');
      if (commentButton) {
        commentButton.disabled = true;
        commentButton.innerHTML = '<svg class="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...';
      }
      
      // Отправляем запрос на сервер
      const response = await fetch(`/api/v1/transactions/${currentTransactionComments.id}/add-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          text: newComment
        })
      });
      
      if (!response.ok) {
        throw new Error(`Comment submission failed: ${response.statusText}`);
      }
      
      // Получаем ответ от сервера
      const data = await response.json();
      
      // Создаем объект комментария
      const newCommentObj = { text: newComment };
      
      // Обновляем состояние, добавляя новый комментарий
      setCurrentTransactionComments({
        ...currentTransactionComments,
        comments: [...currentTransactionComments.comments, newCommentObj]
      });
      
      // Очищаем поле ввода
      setNewComment('');
      
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(`Failed to add comment: ${error.message}`);
    } finally {
      // Восстанавливаем кнопку
      const commentButton = document.querySelector('.add-comment-button');
      if (commentButton) {
        commentButton.disabled = false;
        commentButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> Save Comment';
      }
    }
  };

  // Display table content based on state
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="12" className="loading-cell">
            <div className="loading-container">
              <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (isEmpty) {
      return (
        <tr>
          <td colSpan="12" className="empty-cell">
            <div className="empty-container">
              <svg xmlns="http://www.w3.org/2000/svg" className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="empty-title">No data found</p>
              <p className="empty-subtitle">Try changing filters</p>
            </div>
          </td>
        </tr>
      );
    }

    return transactions.map((tx, index) => {
      // Main transaction data
      const psp = getPaymentNameById(tx.payment_id) || tx.payment_transaction?.provider || tx.provider || '-';
      const transactionType = tx.type || '-';
      const project = tx.fundist_transaction?.project || tx.project || '-';
      const status = tx.fundist_transaction?.status || tx.status || '-';
      
      // PSP (Payment Service Provider) data
      const amountPsp = tx.payment_transaction?.amount || '-';
      const currencyPsp = tx.payment_transaction?.currency || '-';
      
      // Fundist data
      const amountFundist = tx.fundist_transaction?.amount || '-';
      const currencyFundist = tx.fundist_transaction?.currency || '-';
      
      // Paycos data
      const amountPaycos = tx.paycos_transaction?.amount || '-';
      const currencyPaycos = tx.paycos_transaction?.currency || '-';
      
      // Get transaction ID for sync
      const txId = tx.id || tx.fundist_transaction?.id || tx.payment_id;
      
      // Determine if sync button is needed
      const needsSync = tx.payment_transaction === null;
      
      // Get number of sync attempts
      const syncCount = syncAttempts[txId] || 0;
      const canSync = syncCount < 5;
      
      // Check if transaction is currently syncing
      const isSyncing = syncLoading[txId];
      
      return (
        <tr 
          key={index} 
          className="transaction-row clickable" 
          onClick={() => openPaymentDetails(tx)}
        >
          <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" className="transaction-checkbox" />
          </td>
          <td className="action-cell" onClick={(e) => e.stopPropagation()}>
            {needsSync ? (
              <button 
                className={`sync-button ${!canSync ? 'sync-button-disabled' : ''} ${isSyncing ? 'sync-button-loading' : ''}`}
                onClick={(e) => canSync && !isSyncing && handleSyncTransaction(e, tx)}
                disabled={!canSync || isSyncing}
                title={!canSync ? 'Attempt limit reached' : 'Sync transaction'}
              >
                {isSyncing ? (
                  <svg className="sync-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="sync-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {syncCount > 0 ? `${syncCount}/5` : 'Sync'}
                  </>
                )}
                </button>
            ) : (
              <span className="no-action">—</span>
            )}
          </td>
          <td className="psp-cell">
            {psp}
          </td>
          <td className="type-cell">
            {getTransactionTypeBadge(transactionType)}
          </td>
          <td className="project-cell">
            {project}
          </td>
          <td className="status-cell">
            <div className={`status-badge ${getStatusColor(status)}`}>
              {formatStatus(status)}
            </div>
          </td>
          <td className="amount-cell">{amountPsp}</td>
          <td className="currency-cell">{currencyPsp}</td>
          <td className="amount-cell">{amountFundist}</td>
          <td className="currency-cell">{currencyFundist}</td>
          <td className="amount-cell">{amountPaycos}</td>
          <td className="currency-cell">{currencyPaycos}</td>
          <td className="comments-cell" onClick={(e) => e.stopPropagation()}>
            <button className="comments-button" onClick={(e) => openCommentsModal(e, tx)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="comments-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </button>
          </td>
        </tr>
      );
    });
  };

  // Render modal через портал
  const renderCommentsModal = () => {
    if (!showCommentsModal || !currentTransactionComments) return null;
    
    return ReactDOM.createPortal(
      <div className="comments-modal-overlay" onClick={closeCommentsModal}>
        <div className="comments-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="comments-modal-header">
            <h2>Transaction Comments</h2>
            <button className="comments-close-button" onClick={closeCommentsModal}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="transaction-info-summary">
            <p>Transaction ID: {currentTransactionComments.id}</p>
            <p>PSP: {getPaymentNameById(currentTransactionComments.transaction.payment_id)}</p>
            <p>Status: {formatStatus(currentTransactionComments.transaction.fundist_transaction?.status || currentTransactionComments.transaction.status || '-')}</p>
          </div>
          
          <div className="comments-list">
            {currentTransactionComments.comments.length === 0 ? (
              <div className="no-comments">No comments for this transaction</div>
            ) : (
              <ul>
                {currentTransactionComments.comments.map((comment, index) => (
                  <li key={index} className="comment-item">
                    {/* Проверяем, есть ли поля username и created_at - если есть, значит комментарий с бэкенда */}
                    {comment.username || comment.created_at ? (
                      <>
                        <div className="comment-header">
                          <span className="comment-author">{comment.username || 'System'}</span>
                          <span className="comment-date">{formatDate(comment.created_at)}</span>
                        </div>
                        <div className="comment-text">{comment.text}</div>
                      </>
                    ) : (
                      // Иначе это новый комментарий, показываем только текст
                      <div className="comment-text">{comment.text}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="add-comment-section">
            <h3>Add Comment</h3>
            <textarea 
              className="comment-textarea" 
              placeholder="Type your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
            <button className="add-comment-button" onClick={handleAddComment}>
              <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Save Comment
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="transactions-table-container">
      <div className="table-wrapper">
        <table className="transactions-table">
          <thead className="table-header">
            <tr>
              <th className="header-cell checkbox-header">
                <input type="checkbox" className="select-all-checkbox" />
              </th>
              <th className="header-cell action-header">ACTION</th>
              <th className="header-cell psp-header">PSP</th>
              <th className="header-cell type-header">TYPE</th>
              <th className="header-cell project-header">PROJECT</th>
              <th className="header-cell status-header">STATUS</th>
              <th className="header-cell amount-header">AMT PSP</th>
              <th className="header-cell currency-header">CUR PSP</th>
              <th className="header-cell amount-header">AMT FUN</th>
              <th className="header-cell currency-header">CUR FUN</th>
              <th className="header-cell amount-header">AMT PAY</th>
              <th className="header-cell currency-header">CUR PAY</th>
              <th className="header-cell comments-header">CMT</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {renderTableContent()}
          </tbody>
        </table>
      </div>
      
      {/* Рендерим модальное окно через портал */}
      {renderCommentsModal()}
    </div>
  );
};

export default TransactionsTable; 