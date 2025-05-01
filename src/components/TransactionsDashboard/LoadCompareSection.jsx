import React, { useState, useEffect } from 'react';
import './TransactionsDashboard.css';

const LoadCompareSection = () => {
  const [showSection, setShowSection] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [paymentProcessors, setPaymentProcessors] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Загрузка доступных платежных систем
  const loadPaymentProcessors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/payments/?connected_history=true');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data || !data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid response format');
      }
      
      setPaymentProcessors(data.items);
      setError('');
    } catch (error) {
      console.error('Error loading payment processors:', error);
      setError('Error loading payment processors. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Установка диапазона дат
  const setLoadDateRange = (range) => {
    const today = new Date();
    let from, to;

    switch(range) {
      case 'today':
        from = today.toISOString().split('T')[0];
        to = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        from = yesterday.toISOString().split('T')[0];
        to = yesterday.toISOString().split('T')[0];
        break;
      case 'last7days':
        const last7days = new Date(today);
        last7days.setDate(last7days.getDate() - 7);
        from = last7days.toISOString().split('T')[0];
        to = today.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        from = firstDay.toISOString().split('T')[0];
        to = today.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setFromDate(from);
    setToDate(to);
  };

  // Обработка изменения выбранных платежных систем
  const handlePaymentChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setSelectedPayments([...selectedPayments, value]);
    } else {
      setSelectedPayments(selectedPayments.filter(payment => payment !== value));
    }
  };

  // Отправка запроса на загрузку и сравнение транзакций
  const submitLoadAndCompare = async () => {
    // Проверяем форму перед показом модального окна
    if (!fromDate || !toDate) {
      setError('Please select both from and to dates');
      return;
    }
    
    if (selectedPayments.length === 0) {
      setError('Please select at least one payment processor');
      return;
    }
    
    // Проверка диапазона дат
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    const diffTime = Math.abs(toDateObj - fromDateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      setError('Date range cannot exceed 30 days');
      return;
    }
    
    if (fromDateObj > toDateObj) {
      setError('From date must be before to date');
      return;
    }

    // Показываем модальное окно подтверждения
    setShowConfirmModal(true);
  };

  // Функция подтверждения и отправки
  const confirmAndSubmit = async () => {
    try {
      setError('');
      setIsLoading(true);
      setShowConfirmModal(false);
      
      const response = await fetch('/api/v1/transactions/load-and-compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_date: fromDate,
          to_date: toDate,
          payments: selectedPayments
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start job');
      }
      
      await response.json();
      
      // Перенаправление на страницу задач
      window.location.href = '/jobs';
    } catch (error) {
      console.error('Error submitting load and compare job:', error);
      setError(`Error: ${error.message || 'Failed to start job'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка платежных систем при монтировании компонента
  useEffect(() => {
    loadPaymentProcessors();
  }, []);

  return (
    <div className="load-compare-section">
      <div className="load-compare-header">
        <button 
          onClick={() => setShowSection(!showSection)}
          className="load-compare-toggle"
        >
          <div className="load-compare-title-container">
            <div className="load-compare-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="load-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <span className="load-compare-title">Load and Compare Transactions</span>
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`arrow-icon ${showSection ? 'arrow-up' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showSection && (
        <div className="load-compare-content">
          <div className="load-compare-section-title">
            <h2>Load Historical Transactions</h2>
            <p>Load and compare historical transactions between Fundist and payment processors.</p>
          </div>

          <div className="load-compare-form">
            <div className="load-compare-form-row">
              {/* Date Range */}
              <div className="load-compare-date-range">
                <label>Date Range (Max 30 days)</label>
                <div className="date-inputs">
                  <div className="date-input-group">
                    <label>From Date</label>
                    <input 
                      type="date" 
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="date-input-group">
                    <label>To Date</label>
                    <input 
                      type="date" 
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      required 
                    />
                  </div>
                </div>
                <div className="date-range-buttons">
                  <button type="button" onClick={() => setLoadDateRange('today')} className="date-range-button">Today</button>
                  <button type="button" onClick={() => setLoadDateRange('yesterday')} className="date-range-button">Yesterday</button>
                  <button type="button" onClick={() => setLoadDateRange('last7days')} className="date-range-button">Last 7 Days</button>
                  <button type="button" onClick={() => setLoadDateRange('thisMonth')} className="date-range-button">This Month</button>
                </div>
              </div>

              {/* Payment Processors */}
              <div className="load-compare-payment-processors">
                <label>Payment Processors</label>
                {isLoading ? (
                  <div className="payment-processors-loading">
                    <div className="loading-placeholder"></div>
                    <div className="loading-placeholder"></div>
                    <div className="loading-placeholder"></div>
                  </div>
                ) : (
                  <div className="payment-processors-list">
                    {paymentProcessors.length === 0 ? (
                      <div className="no-processors">No payment processors available for historical data.</div>
                    ) : (
                      paymentProcessors.map((payment, index) => (
                        <div key={index} className="payment-processor-item">
                          <input
                            type="checkbox" 
                            id={`payment_${payment.name}`}
                            value={payment.name}
                            checked={selectedPayments.includes(payment.name)}
                            onChange={handlePaymentChange}
                          />
                          <label htmlFor={`payment_${payment.name}`}>{payment.name}</label>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {error && <div className="error-message">{error}</div>}
              </div>
            </div>

            <div className="load-compare-submit">
              <button 
                onClick={submitLoadAndCompare}
                disabled={isLoading}
                className="load-data-button"
              >
                {isLoading ? (
                  <>
                    <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Start Loading Historical Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-header">
              <h3>Подтверждение действия</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowConfirmModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="confirm-modal-content">
              <p>Вы уверены, что хотите начать загрузку исторических данных?</p>
              <p className="confirm-modal-warning">Этот процесс может занять некоторое время и не может быть остановлен после запуска.</p>
            </div>
            <div className="confirm-modal-footer">
              <button 
                className="cancel-button" 
                onClick={() => setShowConfirmModal(false)}
              >
                Отмена
              </button>
              <button 
                className="confirm-button" 
                onClick={confirmAndSubmit}
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadCompareSection; 