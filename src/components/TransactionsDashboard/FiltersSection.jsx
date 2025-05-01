import React, { useState, useEffect } from 'react';
import './TransactionsDashboard.css';

const FiltersSection = ({
  filters,
  onFilterChange,
  onReset,
  onApply,
  pageSize,
  onPageSizeChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  // Загрузка опций для фильтров
  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/v1/transactions/filters-data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setStatusOptions(data.statuses || []);
      setProjectOptions(data.projects || []);
      setCurrencyOptions(data.currencies || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  // Функция для установки диапазона дат
  const setDateRange = range => {
    const today = new Date();
    let fromDate, toDate;

    switch (range) {
      case 'today':
        fromDate = today.toISOString().split('T')[0];
        toDate = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        fromDate = yesterday.toISOString().split('T')[0];
        toDate = yesterday.toISOString().split('T')[0];
        break;
      case 'last7days':
        const last7days = new Date(today);
        last7days.setDate(last7days.getDate() - 7);
        fromDate = last7days.toISOString().split('T')[0];
        toDate = today.toISOString().split('T')[0];
        break;
      case 'last30days':
        const last30days = new Date(today);
        last30days.setDate(last30days.getDate() - 30);
        fromDate = last30days.toISOString().split('T')[0];
        toDate = today.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        fromDate = firstDay.toISOString().split('T')[0];
        toDate = today.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    onFilterChange('fromDate', fromDate);
    onFilterChange('toDate', toDate);
  };

  // Загрузка опций фильтров при монтировании компонента
  useEffect(() => {
    loadFilterOptions();
  }, []);

  return (
    <div className="load-compare-section">
      <div className="load-compare-header">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="load-compare-toggle"
        >
          <div className="load-compare-title-container">
            <div className="load-compare-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="load-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <span className="load-compare-title">Filters</span>
          </div>
          <svg
            className={`arrow-icon ${showFilters ? 'arrow-up' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {showFilters && (
        <div className="load-compare-content">
          <div className="load-compare-section-title">
            <h2>Filter Transactions</h2>
            <button className="reset-button" onClick={onReset}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset Filters
            </button>
          </div>

          <div className="load-compare-section-description">
            <p>
              Filter transactions by date range, transaction type, status, and
              other criteria.
            </p>
          </div>

          <div className="filters-grid">
            {/* Date Range */}
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-inputs">
                <div className="date-input-group">
                  <label>From</label>
                  <input
                    type="text"
                    placeholder="ДД.ММ.ГГГГ"
                    value={
                      filters.fromDate
                        ? filters.fromDate.split('-').reverse().join('.')
                        : ''
                    }
                    onChange={e => {
                      // Преобразование формата ДД.ММ.ГГГГ в ГГГГ-ММ-ДД для API
                      const parts = e.target.value.split('.');
                      if (parts.length === 3) {
                        onFilterChange(
                          'fromDate',
                          `${parts[2]}-${parts[1]}-${parts[0]}`
                        );
                      } else {
                        onFilterChange('fromDate', e.target.value);
                      }
                    }}
                  />
                </div>
                <div className="date-input-group">
                  <label>To</label>
                  <input
                    type="text"
                    placeholder="ДД.ММ.ГГГГ"
                    value={
                      filters.toDate
                        ? filters.toDate.split('-').reverse().join('.')
                        : ''
                    }
                    onChange={e => {
                      // Преобразование формата ДД.ММ.ГГГГ в ГГГГ-ММ-ДД для API
                      const parts = e.target.value.split('.');
                      if (parts.length === 3) {
                        onFilterChange(
                          'toDate',
                          `${parts[2]}-${parts[1]}-${parts[0]}`
                        );
                      } else {
                        onFilterChange('toDate', e.target.value);
                      }
                    }}
                  />
                </div>
              </div>
              <div className="date-range-buttons">
                <button
                  className="date-range-button"
                  onClick={() => setDateRange('today')}
                >
                  Today
                </button>
                <button
                  className="date-range-button"
                  onClick={() => setDateRange('yesterday')}
                >
                  Yesterday
                </button>
                <button
                  className="date-range-button"
                  onClick={() => setDateRange('last7days')}
                >
                  Last 7 Days
                </button>
                <button
                  className="date-range-button"
                  onClick={() => setDateRange('last30days')}
                >
                  Last 30 Days
                </button>
                <button
                  className="date-range-button"
                  onClick={() => setDateRange('thisMonth')}
                >
                  This Month
                </button>
              </div>
            </div>

            {/* Transaction Type */}
            <div className="filter-group">
              <label>Transaction Type</label>
              <div className="select-wrapper">
                <select
                  value={filters.type}
                  onChange={e => onFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                </select>
              </div>

              <label>Comparison Type</label>
              <div className="select-wrapper">
                <select
                  value={filters.compareType}
                  onChange={e => onFilterChange('compareType', e.target.value)}
                >
                  <option value="">All Comparisons</option>
                  <option value="full_match">Full Match</option>
                  <option value="fundist_match">Fundist Only</option>
                  <option value="payment_match">Payment Only</option>
                  <option value="amount_mismatch">Amount Mismatch</option>
                </select>
              </div>
            </div>

            {/* Status & Project */}
            <div className="filter-group">
              <label>Status</label>
              <div className="select-wrapper status-select">
                <select
                  value={filters.status}
                  onChange={e => onFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((status, index) => (
                    <option key={index} value={status.display_name}>
                      {status.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <label>Project</label>
              <div className="select-wrapper project-select">
                <select
                  value={filters.project}
                  onChange={e => onFilterChange('project', e.target.value)}
                >
                  <option value="">All Projects</option>
                  {projectOptions.map((project, index) => (
                    <option key={index} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Currency & Items per page */}
            <div className="filter-group">
              <label>Currency</label>
              <div className="select-wrapper currency-select">
                <select
                  value={filters.currency}
                  onChange={e => onFilterChange('currency', e.target.value)}
                >
                  <option value="">All Currencies</option>
                  {currencyOptions.map((currency, index) => (
                    <option key={index} value={currency}>
                      {currency.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <label>Items per page</label>
              <div className="select-wrapper items-per-page-select">
                <select
                  value={pageSize}
                  onChange={e => onPageSizeChange(e.target.value)}
                >
                  <option value="10">10 items per page</option>
                  <option value="25">25 items per page</option>
                  <option value="50">50 items per page</option>
                  <option value="100">100 items per page</option>
                </select>
              </div>
            </div>
          </div>

          <div className="load-compare-submit">
            <button onClick={onApply} className="load-data-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="button-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersSection;
