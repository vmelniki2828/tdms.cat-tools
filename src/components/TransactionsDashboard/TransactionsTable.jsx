import React from 'react';
import './TransactionsDashboard.css';

const TransactionsTable = ({ transactions, isLoading, isEmpty, onShowExternalId }) => {
  // Вспомогательные функции для отображения данных
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-default';
    }
  };

  const capitalizePayment = (payment) => {
    if (!payment) return '';
    return payment.charAt(0).toUpperCase() + payment.slice(1).toLowerCase();
  };

  const getPaymentInfo = (tx) => {
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
    if (!tx.fundist_transaction?.gateway) {
      return <div className="table-cell-dash">-</div>;
    }
    
    return (
      <div className="gateway-info">
        <svg xmlns="http://www.w3.org/2000/svg" className="gateway-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>{capitalizePayment(tx.fundist_transaction.gateway)}</span>
      </div>
    );
  };

  const getExternalIdInfo = (tx) => {
    if (!tx.fundist_transaction?.external_id) {
      return <div className="table-cell-dash">-</div>;
    }
    
    return (
      <div 
        className="external-id-info"
        onClick={() => onShowExternalId(tx.fundist_transaction.external_id)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="external-id-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span>Click to view</span>
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

  // Отображение содержимого таблицы в зависимости от состояния
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="7" className="loading-cell">
            <div className="loading-container">
              <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Загрузка транзакций...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (isEmpty) {
      return (
        <tr>
          <td colSpan="7" className="empty-cell">
            <div className="empty-container">
              <svg xmlns="http://www.w3.org/2000/svg" className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="empty-title">Транзакций не найдено</p>
              <p className="empty-subtitle">Попробуйте изменить фильтры</p>
            </div>
          </td>
        </tr>
      );
    }

    return transactions.map((tx, index) => (
      <tr key={index} className="transaction-row">
        <td className="info-cell">
          <div className="transaction-info">
            <div className="transaction-id">ID: {tx.fundist_transaction?.id || '-'}</div>
            <div className="user-id">User ID: {tx.fundist_transaction?.user_id || '-'}</div>
            
            <div className="badges-container">
              {tx.fundist_transaction?.user_status && getUserStatusBadge(tx.fundist_transaction.user_status)}
              {getProjectBadge(tx)}
              {getTransactionTypeBadge(tx.type)}
            </div>
          </div>
        </td>
        <td className="amount-cell">
          <div className="amount-info">
            <div className="amount-value">{tx.fundist_transaction?.amount || '-'}</div>
            <div className="amount-currency">{tx.fundist_transaction?.currency || '-'}</div>
          </div>
        </td>
        <td className="status-cell">
          <div className={`status-badge ${getStatusColor(tx.fundist_transaction?.status)}`}>
            {tx.fundist_transaction?.status || '-'}
          </div>
        </td>
        <td className="gateway-cell">{getGatewayInfo(tx)}</td>
        <td className="external-id-cell">{getExternalIdInfo(tx)}</td>
        <td className="payment-info-cell">{getPaymentInfo(tx)}</td>
        <td className="date-cell">
          {tx.fundist_transaction?.date ? new Date(tx.fundist_transaction.date).toLocaleString() : '-'}
        </td>
      </tr>
    ));
  };

  return (
    <div className="transactions-table-container">
      <div className="table-wrapper">
        <table className="transactions-table">
          <thead className="table-header">
            <tr>
              <th className="header-cell info-header">INFO</th>
              <th className="header-cell amount-header">AMOUNT</th>
              <th className="header-cell status-header">STATUS</th>
              <th className="header-cell gateway-header">GATEWAY</th>
              <th className="header-cell external-id-header">EXTERNAL ID</th>
              <th className="header-cell payment-info-header">PAYMENT INFO</th>
              <th className="header-cell date-header">DATE</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {renderTableContent()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable; 