import React, { useEffect } from 'react';
import './TransactionsDashboard.css';

const StatsCards = ({ stats }) => {
  // Функция для определения цвета тренда (если значение не является числом, возвращаем зеленый)
  const getTrendColor = (trend) => {
    if (trend === '-' || trend === '0%') return '';
    return parseFloat(trend) >= 0 ? 'green-trend' : 'red-trend';
  };
  
  useEffect(() => {
    console.log("StatsCards получил новые данные:", stats);
    console.log("Процент успешных транзакций:", stats.successfulPercentage);
  }, [stats]);
  
  return (
    <div className="stats-cards-container">
      <div className="stats-card total-card">
        <div className="stats-card-header">
          <div className="stats-icon-container blue-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="stats-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className={`stats-trend ${getTrendColor(stats.transactionsTrend)}`}>
            {stats.transactionsTrend}
          </div>
        </div>
        <div className="stats-card-title">All Transactions</div>
        <div className="stats-card-value">{stats.totalTransactions}</div>
        <div className="stats-card-period">Total count</div>
      </div>

      <div className="stats-card success-card">
        <div className="stats-card-header">
          <div className="stats-icon-container green-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="stats-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className={`stats-trend ${getTrendColor(stats.successTrend)}`}>
            {stats.successTrend}
          </div>
        </div>
        <div className="stats-card-title">Complete Transactions</div>
        <div className="stats-card-value">{stats.successfulTransactions}</div>
        <div className="stats-card-period">Both Fundist & Payment exist</div>
      </div>

      <div className="stats-card pending-card">
        <div className="stats-card-header">
          <div className="stats-icon-container yellow-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="stats-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className={`stats-trend ${getTrendColor(stats.pendingTrend)}`}>
            {stats.pendingTrend}
          </div>
        </div>
        <div className="stats-card-title">Incomplete Transactions</div>
        <div className="stats-card-value">{stats.pendingTransactions}</div>
        <div className="stats-card-period">Missing Fundist or Payment data</div>
      </div>

      <div className="stats-card failed-card">
        <div className="stats-card-header">
          <div className="stats-icon-container red-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="stats-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <div className={`stats-trend ${getTrendColor(stats.successTrend)}`}>
            {stats.successTrend}
          </div>
        </div>
        <div className="stats-card-title">Complete Ratio</div>
        <div className="stats-card-value">
          {stats.totalTransactions === '0' 
            ? 'N/A' 
            : `${typeof stats.successfulPercentage === 'number' ? stats.successfulPercentage : 0}%`
          }
        </div>
        <div className="stats-card-period">% of transactions on current page</div>
      </div>

      <div className="stats-card amount-card">
        <div className="stats-card-header">
          <div className="stats-icon-container purple-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="stats-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="stats-card-title currency-title">Transactions Amount</div>
        <div className="stats-card-value amounts-container">
          {stats.currencyAmounts && Object.keys(stats.currencyAmounts).length > 0 ? (
            <div className="currency-amounts-grid">
              {Object.entries(stats.currencyAmounts).map(([currency, amount], index) => (
                <div key={index} className="currency-amount">
                  <span className="currency-code">{currency.toUpperCase()}</span>
                  <span className="amount-value">{parseFloat(amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No amount data</div>
          )}
        </div>
        <div className="stats-card-period">Total amounts by currency</div>
      </div>
    </div>
  );
};

export default StatsCards; 