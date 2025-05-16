import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TransactionsDashboard.css';

const PaymentDetailsPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessors, setPaymentProcessors] = useState([]);

  // Функция для получения имени платежной системы по ID
  const getPaymentNameById = (paymentId) => {
    if (!paymentId || !paymentProcessors.length) return '-';
    
    const processor = paymentProcessors.find(p => p.id === paymentId);
    if (!processor) return paymentId; // Возвращаем ID, если платежная система не найдена
    
    // Возвращаем форматированное имя платежной системы
    return processor.name || processor.provider || processor.id;
  };

  useEffect(() => {
    // Загружаем список платежных систем
    const loadPaymentProcessors = async () => {
      try {
        const response = await fetch('/api/v1/payments/?connected_history=true');
        if (response.ok) {
          const data = await response.json();
          // Проверяем, есть ли у данных свойство items (на случай, если API возвращает массив в items)
          const processors = data.items || data;
          setPaymentProcessors(processors);
        }
      } catch (error) {
        console.error('Error loading payment processors:', error);
      }
    };

    loadPaymentProcessors();
  }, []);

  useEffect(() => {
    try {
      setLoading(true);
      
      // Получаем данные платежа из localStorage
      const savedPayment = localStorage.getItem(`payment_details_${paymentId}`);
      
      if (!savedPayment) {
        throw new Error('Данные о платеже не найдены');
      }
      
      const parsedPayment = JSON.parse(savedPayment);
      setPayment(parsedPayment);
      setLoading(false);
    } catch (err) {
      console.error('Error loading payment details:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [paymentId]);

  const goBack = () => {
    navigate(-1);
  };

  // Форматирование статуса с цветовой индикацией
  const formatStatus = (status) => {
    if (!status) return null;

    const statusMap = {
      completed: 'completed',
      status_complete: 'completed',
      pending: 'pending',
      waiting_payment: 'pending',
      failed: 'failed',
      default: 'default'
    };

    const statusClass = statusMap[status.toLowerCase()] || 'default';

    return (
      <span className={`payment-status-value status-${statusClass}`}>
        {status}
      </span>
    );
  };
  
  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Функция для отображения любого значения с учетом типа
  const renderValue = (value) => {
    if (value === null || value === undefined) return '-';
    
    if (typeof value === 'boolean') {
      return value ? 'Да' : 'Нет';
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return 'Пустой массив';
        return (
          <div className="payment-array-value">
            {value.map((item, index) => (
              <div key={index} className="payment-array-item">
                {renderValue(item)}
              </div>
            ))}
          </div>
        );
      }
      
      return (
        <div className="payment-object-value">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="payment-nested-property">
              <span className="payment-property-nested-label">{key}:</span>
              <div className="payment-property-nested-value">
                {renderValue(val)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return String(value);
  };

  // Отображение загрузки
  if (loading) {
    return (
      <div className="payment-details-container">
        <div className="loading-container">
          <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Загрузка данных платежа...</span>
        </div>
      </div>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <div className="payment-details-container">
        <div className="error-container">
          <svg xmlns="http://www.w3.org/2000/svg" className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="error-message">
            <h2>Ошибка при загрузке данных</h2>
            <p>{error}</p>
          </div>
          <button onClick={goBack} className="payment-details-button payment-details-back">
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  // Проверка наличия данных
  if (!payment) {
    return (
      <div className="payment-details-container">
        <div className="empty-container">
          <svg xmlns="http://www.w3.org/2000/svg" className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="empty-content">
            <h2>Платеж не найден</h2>
            <p>Информация о данном платеже отсутствует в системе</p>
          </div>
          <button onClick={goBack} className="payment-details-button payment-details-back">
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }
  
  // Получаем все ключи объекта payment для отображения
  const paymentKeys = Object.keys(payment);

  return (
    <div className="payment-details-container">
      <div className="payment-details-header">
        <div>
          <h1 className="payment-details-title">Информация о платеже</h1>
          <div className="payment-details-id">ID: {payment.id || paymentId}</div>
          {payment.payment_id && (
            <div className="payment-details-name">Payment Name: {getPaymentNameById(payment.payment_id)}</div>
          )}
        </div>
        <button onClick={goBack} className="payment-details-button payment-details-back">
          Вернуться к списку
        </button>
      </div>

      {/* Основные данные платежа */}
      <div className="payment-details-section">
        <h2 className="payment-details-section-title">Основная информация</h2>
        <div className="payment-details-grid-2">
          {payment.id && (
            <div className="payment-property">
              <span className="payment-property-label">ID</span>
              <span className="payment-property-value">{payment.id}</span>
            </div>
          )}
          
          {payment.payment_id && (
            <div className="payment-property">
              <span className="payment-property-label">Payment Name</span>
              <span className="payment-property-value">{getPaymentNameById(payment.payment_id)}</span>
            </div>
          )}
          
          {payment.type && (
            <div className="payment-property">
              <span className="payment-property-label">Тип транзакции</span>
              <span className="payment-property-value">{payment.type}</span>
            </div>
          )}
          
          {payment.created_at && (
            <div className="payment-property">
              <span className="payment-property-label">Дата создания</span>
              <span className="payment-property-value">{formatDate(payment.created_at)}</span>
            </div>
          )}
          
          {'mismatch_confirmed' in payment && (
            <div className="payment-property">
              <span className="payment-property-label">Несоответствие подтверждено</span>
              <span className="payment-property-value">{payment.mismatch_confirmed ? 'Да' : 'Нет'}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Данные Fundist */}
      {payment.fundist_transaction && (
        <div className="payment-details-section">
          <h2 className="payment-details-section-title">Fundist Transaction</h2>
          <div className="payment-details-grid-3">
            {Object.entries(payment.fundist_transaction).map(([key, value]) => (
              <div key={key} className="payment-property">
                <span className="payment-property-label">{key}</span>
                <div className="payment-property-value">
                  {renderValue(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Данные Payment Transaction */}
      {payment.payment_transaction && (
        <div className="payment-details-section">
          <h2 className="payment-details-section-title">Payment Transaction</h2>
          <div className="payment-details-grid-3">
            {Object.entries(payment.payment_transaction).map(([key, value]) => (
              <div key={key} className="payment-property">
                <span className="payment-property-label">{key}</span>
                <div className="payment-property-value">
                  {renderValue(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Комментарии */}
      {payment.comments && payment.comments.length > 0 && (
        <div className="payment-details-section">
          <h2 className="payment-details-section-title">Комментарии</h2>
          <div className="payment-comments">
            {payment.comments.map((comment, index) => (
              <div key={index} className="payment-comment">
                {renderValue(comment)}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Данные Sync */}
      {payment.sync && (
        <div className="payment-details-section">
          <h2 className="payment-details-section-title">Sync Information</h2>
          <div className="payment-details-grid-2">
            {Object.entries(payment.sync).map(([key, value]) => (
              <div key={key} className="payment-property">
                <span className="payment-property-label">{key}</span>
                <div className="payment-property-value">
                  {key.includes('time') && value ? formatDate(value) : renderValue(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* JSON представление всего объекта */}
      <div className="payment-details-section">
        <h2 className="payment-details-section-title">Полные данные (JSON)</h2>
        <pre className="payment-additional-data">
          {JSON.stringify(payment, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default PaymentDetailsPage; 