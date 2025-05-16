import React, { useState, useEffect } from 'react';
import ReportModal from './ReportModal';
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
  const [paymentProcessors, setPaymentProcessors] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);

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

  // Загрузка платежных процессоров
  const loadPaymentProcessors = async () => {
    try {
      const response = await fetch('/api/v1/payments/?connected_history=true');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data || !data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid response format for payment processors');
      }
      
      setPaymentProcessors(data.items || []);
    } catch (error) {
      console.error('Error loading payment processors:', error);
    }
  };

  // Функция для обработки изменения чекбокса платежного процессора
  const handlePaymentProcessorChange = (processorId, processorName) => {
    const currentProcessorIds = filters.paymentProcessorIds || [];
    const currentProcessorNames = filters.paymentProcessors || [];
    let newProcessorIds;
    let newProcessorNames;
    
    if (currentProcessorIds.includes(processorId)) {
      // Удаляем из списка, если уже выбран
      newProcessorIds = currentProcessorIds.filter(id => id !== processorId);
      newProcessorNames = currentProcessorNames.filter(name => name !== processorName);
    } else {
      // Добавляем в список, если еще не выбран
      newProcessorIds = [...currentProcessorIds, processorId];
      newProcessorNames = [...currentProcessorNames, processorName];
    }
    
    onFilterChange('paymentProcessorIds', newProcessorIds);
    onFilterChange('paymentProcessors', newProcessorNames);
  };

  // Функция для выбора/отмены всех процессоров
  const toggleAllPaymentProcessors = () => {
    const currentProcessorIds = filters.paymentProcessorIds || [];
    
    if (currentProcessorIds.length === paymentProcessors.length) {
      // Если все выбраны, очищаем выбор
      onFilterChange('paymentProcessorIds', []);
      onFilterChange('paymentProcessors', []);
    } else {
      // Иначе выбираем все
      onFilterChange('paymentProcessorIds', paymentProcessors.map(p => p.id));
      onFilterChange('paymentProcessors', paymentProcessors.map(p => p.name));
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

  // Добавляем обработчик для открытия и закрытия модального окна генерации отчета
  const toggleReportModal = () => {
    setShowReportModal(!showReportModal);
  };

  // Загрузка опций фильтров при монтировании компонента
  useEffect(() => {
    loadFilterOptions();
    loadPaymentProcessors();
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

      {/* Активные фильтры */}
      <div className="active-filters-container">
        {filters.fromDate && (
          <div className="active-filter">
            <span>From: {filters.fromDate}</span>
            <button 
              className="remove-filter" 
              onClick={() => onFilterChange('fromDate', '')}
              aria-label="Remove from date filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {filters.toDate && (
          <div className="active-filter">
            <span>To: {filters.toDate}</span>
            <button 
              className="remove-filter" 
              onClick={() => onFilterChange('toDate', '')}
              aria-label="Remove to date filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {filters.compareType && (
          <div className="active-filter">
            <span>Comparison: {filters.compareType.replace(/_/g, ' ')}</span>
            <button 
              className="remove-filter" 
              onClick={() => onFilterChange('compareType', '')}
              aria-label="Remove comparison type filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {filters.mismatchStatus && (
          <div className="active-filter">
            <span>Mismatch Status: {filters.mismatchStatus}</span>
            <button 
              className="remove-filter" 
              onClick={() => onFilterChange('mismatchStatus', '')}
              aria-label="Remove mismatch status filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {filters.status && (
          <div className="active-filter">
            <span>Status: {filters.status}</span>
            <button 
              className="remove-filter" 
              onClick={() => onFilterChange('status', '')}
              aria-label="Remove status filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {filters.project && (
          <div className="active-filter">
            <span>Project: {filters.project}</span>
            <button 
              className="remove-filter" 
              onClick={() => onFilterChange('project', '')}
              aria-label="Remove project filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {filters.currency && (
          <div className="active-filter">
            <span>Currency: {filters.currency.toUpperCase()}</span>
            <button 
              className="remove-filter" 
              onClick={() => onFilterChange('currency', '')}
              aria-label="Remove currency filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {filters.paymentProcessors && filters.paymentProcessors.length > 0 && (
          <div className="active-filter">
            <span>Payment Processors: {filters.paymentProcessors.join(', ')}</span>
            <button 
              className="remove-filter" 
              onClick={() => onFilterChange('paymentProcessors', [])}
              aria-label="Remove payment processors filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {(filters.fromDate || filters.toDate || filters.compareType || 
          filters.mismatchStatus || filters.status || filters.project || 
          filters.currency || (filters.paymentProcessors && filters.paymentProcessors.length > 0)) && (
          <button className="clear-all-filters" onClick={onReset}>
            Clear All Filters
          </button>
        )}
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
              Filter transactions by date range, status, and
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
                    type="date"
                    value={filters.fromDate || ''}
                    onChange={e => {
                        onFilterChange('fromDate', e.target.value);
                    }}
                    className="date-calendar"
                  />
                </div>
                <div className="date-input-group">
                  <label>To</label>
                  <input
                    type="date"
                    value={filters.toDate || ''}
                    onChange={e => {
                        onFilterChange('toDate', e.target.value);
                    }}
                    className="date-calendar"
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

            {/* Comparison Type & Mismatch Status */}
            <div className="filter-group">
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

              <label>Mismatch Status</label>
              <div className="select-wrapper">
                <select
                  value={filters.mismatchStatus}
                  onChange={e => {
                    const value = e.target.value;
                    onFilterChange('mismatchStatus', value);
                    
                    // Добавляем логику для установки параметра mismatch_confirmed
                    if (value === 'confirmed') {
                      onFilterChange('mismatch_confirmed', true);
                    } else if (value === 'unconfirmed') {
                      onFilterChange('mismatch_confirmed', false);
                    } else {
                      // Если выбрано "All Status", удаляем параметр mismatch_confirmed
                      onFilterChange('mismatch_confirmed', null);
                    }
                  }}
                >
                  <option value="">All Status</option>
                  <option value="confirmed">Confirmed Mismatches</option>
                  <option value="unconfirmed">Unconfirmed Mismatches</option>
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

              {/* Payment Processors с множественным выбором */}
              <div className="payment-processors-filter">
                <div className="payment-processors-header">
                  <label>Payment Processors</label>
                  {paymentProcessors.length > 0 && (
                    <button 
                      type="button" 
                      onClick={toggleAllPaymentProcessors} 
                      className="select-all-button"
                    >
                      {filters.paymentProcessors && filters.paymentProcessors.length === paymentProcessors.length 
                        ? 'Deselect All' 
                        : 'Select All'}
                    </button>
                  )}
                </div>
                
                <div className="payment-processors-list">
                  {paymentProcessors.length === 0 ? (
                    <div className="no-processors">No payment processors available</div>
                  ) : (
                    <div className="payment-processors-grid">
                      {paymentProcessors.map((processor, index) => (
                        <div key={index} className="payment-processor-item">
                          <input
                            type="checkbox"
                            id={`filter_payment_${processor.name}`}
                            value={processor.name}
                            checked={filters.paymentProcessorIds && filters.paymentProcessorIds.includes(processor.id)}
                            onChange={() => handlePaymentProcessorChange(processor.id, processor.name)}
                            data-id={processor.id}
                          />
                          <label htmlFor={`filter_payment_${processor.name}`}>{processor.name}</label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <label>Items per page</label>
              <div className="select-wrapper items-per-page-select">
                <select
                  value={pageSize}
                  onChange={e => onPageSizeChange(e.target.value)}
                >
                  <option value="100">100 items per page</option>
                  <option value="200">200 items per page</option>
                  <option value="300">300 items per page</option>
                  <option value="400">400 items per page</option>
                  <option value="500">500 items per page</option>
                </select>
              </div>
            </div>
          </div>

          <div className="filters-buttons-container">
            <button 
              onClick={toggleReportModal} 
              className="report-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="report-button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Report
            </button>
            
            <button onClick={onApply} className="load-data-button button-enabled">
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
      
      {/* Модальное окно для генерации отчета */}
      <ReportModal 
        isOpen={showReportModal} 
        onClose={toggleReportModal} 
        filters={filters} 
      />
    </div>
  );
};

export default FiltersSection;
