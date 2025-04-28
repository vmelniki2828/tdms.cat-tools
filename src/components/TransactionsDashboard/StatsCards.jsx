import React, { useEffect } from 'react';
import './TransactionsDashboard.css';

const StatsCards = ({ stats }) => {
  // Функция для определения цвета тренда (если значение не является числом, возвращаем зеленый)
  const getTrendColor = (trend) => {
    if (trend === '-' || trend === '0%') return '';
    return parseFloat(trend) >= 0 ? 'green-trend' : 'red-trend';
  };
  useEffect(()=>{console.log(stats)},[stats])
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
        <div className="stats-card-title">Total Transactions</div>
        <div className="stats-card-value">{stats.totalTransactions}</div>
        <div className="stats-card-period">vs. previous period</div>
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
        <div className="stats-card-title">Successful Transactions</div>
        <div className="stats-card-value">{stats.successfulTransactions}</div>
        <div className="stats-card-period">vs. previous period</div>
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
        <div className="stats-card-title">Pending Transactions</div>
        <div className="stats-card-value">{stats.pendingTransactions}</div>
        <div className="stats-card-period">vs. previous period</div>
      </div>

      <div className="stats-card failed-card">
        <div className="stats-card-header">
          <div className="stats-icon-container red-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="stats-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className={`stats-trend ${getTrendColor(stats.failedTrend)}`}>
            {stats.failedTrend}
          </div>
        </div>
        <div className="stats-card-title">Failed Transactions</div>
        <div className="stats-card-value">{stats.failedTransactions}</div>
        <div className="stats-card-period">vs. previous period</div>
      </div>
    </div>
  );
};

export default StatsCards; 