import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './TransactionsDashboard.css';
import StatsCards from './StatsCards';
import TransactionsTable from './TransactionsTable';
import Pagination from './Pagination';
import FiltersSection from './FiltersSection';
import LoadCompareSection from './LoadCompareSection';
import ExternalIdModal from './ExternalIdModal';

const TransactionsDashboard = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [transactions, setTransactions] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showExternalIdModal, setShowExternalIdModal] = useState(false);
  const [currentExternalId, setCurrentExternalId] = useState('');
  const [stats, setStats] = useState({
    totalTransactions: '-',
    successfulTransactions: '-',
    pendingTransactions: '-',
    failedTransactions: '-',
    transactionsTrend: '0%',
    successTrend: '0%',
    pendingTrend: '0%',
    failedTrend: '0%',
    successfulPercentage: 0,
    currencyAmounts: {},
  });
  
  // Активные фильтры, которые используются в запросе
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    type: '',
    status: '',
    project: '',
    currency: '',
    compareType: '',
    mismatchStatus: '',
    mismatch_confirmed: null,
    paymentProcessors: [],
    paymentProcessorIds: [],
  });
  
  // Временные фильтры для работы с формой фильтров
  const [tempFilters, setTempFilters] = useState({
    fromDate: '',
    toDate: '',
    type: '',
    status: '',
    project: '',
    currency: '',
    compareType: '',
    mismatchStatus: '',
    mismatch_confirmed: null,
    paymentProcessors: [],
    paymentProcessorIds: [],
  });
  
  const [paymentProcessors, setPaymentProcessors] = useState([]);

  // Функция для загрузки транзакций, обернутая в useCallback
  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: currentPage,
        page_size: pageSize,
      });

      if (filters.fromDate)
        params.append('from_date', `${filters.fromDate}T00:00:00`);
      if (filters.toDate)
        params.append('to_date', `${filters.toDate}T23:59:59`);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.project) params.append('project', filters.project);
      if (filters.currency) params.append('currency', filters.currency);
      if (filters.compareType)
        params.append('compare_type', filters.compareType);
      if (filters.mismatch_confirmed !== null && filters.mismatch_confirmed !== undefined)
        params.append('mismatch_confirmed', filters.mismatch_confirmed);
      if (filters.paymentProcessorIds && filters.paymentProcessorIds.length > 0)
        filters.paymentProcessorIds.forEach(processorId => {
          params.append('payment_ids', processorId);
        });

      const response = await fetch(`/api/v1/transactions/?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Response status:', response.status);
        console.error(
          'Response headers:',
          Object.fromEntries(response.headers.entries())
        );
        console.error('Error data:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Полные данные от API:', data);
      console.log('Данные статистики:', data.stats);
      console.log('Всего транзакций:', data.total);

      if (!data || !data.transactions) {
        throw new Error('Invalid response format');
      }

      setTransactions(data.transactions);
      setTotalItems(data.total || 0);
      setTotalPages(Math.ceil(data.total / pageSize));
      
      // Обновление статистики
      const totalTransactionsOnPage = data.transactions.length || 0;
      
      // Проверяем, есть ли транзакции на странице
      if (totalTransactionsOnPage === 0) {
        console.log('На текущей странице нет транзакций');
        
        // Устанавливаем нулевую статистику для текущей страницы
        const updatedStats = {
          totalTransactions: data.total.toString(),
          successfulTransactions: '0',
          pendingTransactions: '0',
          failedTransactions: '0',
          transactionsTrend: data.stats?.total_trend || '0%',
          successTrend: data.stats?.success_trend || '0%',
          pendingTrend: data.stats?.pending_trend || '0%',
          failedTrend: data.stats?.failed_trend || '0%',
          successfulPercentage: 0,
          currencyAmounts: {}
        };
        
        setStats(updatedStats);
        setIsLoading(false);
        return;
      }
      
      const successfulTransactions = data.transactions.filter(t => 
        t.fundist_transaction && t.payment_transaction
      ).length || 0;
      const pendingTransactions = data.transactions.filter(t => 
        !t.fundist_transaction || !t.payment_transaction
      ).length || 0;
      const failedTransactions = data.transactions.filter(t => t.status === 'failed').length || 0;
      
      // Рассчитываем процент успешных транзакций на текущей странице
      const successfulPercentage = totalTransactionsOnPage > 0 
        ? Math.round((successfulTransactions / totalTransactionsOnPage) * 100)
        : 0;
      
      console.log('Вычисление процента успешных транзакций:');
      console.log(`Успешных: ${successfulTransactions}, Всего на странице: ${totalTransactionsOnPage}`);
      console.log(`Формула: Math.round((${successfulTransactions} / ${totalTransactionsOnPage}) * 100) = ${successfulPercentage}%`);
      
      // Рассчитываем суммы по валютам из fundist_transaction
      const currencyAmounts = {};
      data.transactions.forEach(transaction => {
        if (transaction.fundist_transaction && 
            transaction.fundist_transaction.amount && 
            transaction.fundist_transaction.currency) {
          
          const amount = parseFloat(transaction.fundist_transaction.amount);
          const currency = transaction.fundist_transaction.currency.toLowerCase();
          
          if (!isNaN(amount)) {
            if (currencyAmounts[currency]) {
              currencyAmounts[currency] += amount;
            } else {
              currencyAmounts[currency] = amount;
            }
          }
        }
      });
      
      console.log('Рассчитанная статистика:', {
        total: totalTransactionsOnPage,
        successful: successfulTransactions,
        pending: pendingTransactions,
        failed: failedTransactions,
        successPercent: successfulPercentage,
        currencyAmounts: currencyAmounts
      });
      
      // Устанавливаем статистику вручную из расчетных значений
      const updatedStats = {
        totalTransactions: data.total.toString(),
        successfulTransactions: successfulTransactions.toString(),
        pendingTransactions: pendingTransactions.toString(),
        failedTransactions: failedTransactions.toString(),
        transactionsTrend: data.stats?.total_trend || '0%',
        successTrend: data.stats?.success_trend || '0%',
        pendingTrend: data.stats?.pending_trend || '0%',
        failedTrend: data.stats?.failed_trend || '0%',
        successfulPercentage: successfulPercentage,
        currencyAmounts: currencyAmounts
      };
      
      console.log('Обновляем статистику с новым значением successfulPercentage:', updatedStats.successfulPercentage);
      setStats(updatedStats);
      
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  // Применяем фильтры из состояния при переходе на страницу
  useEffect(() => {
    if (location.state?.filters) {
      const newFilters = location.state.filters;
      setFilters(newFilters);
      setTempFilters(newFilters);
      // Сбрасываем состояние в location, чтобы фильтры не применялись повторно при обновлении страницы
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    console.log(stats);
  }, [stats]);

  // Функция для обработки изменения временных фильтров
  const handleFilterChange = (name, value) => {
    // Специальная логика для поля mismatchStatus
    if (name === 'mismatchStatus') {
      // Если значение пустое, то сбрасываем и related mismatch_confirmed
      if (value === '') {
        setTempFilters(prev => ({ 
          ...prev, 
          mismatchStatus: value,
          mismatch_confirmed: null 
        }));
      } else {
        // Иначе устанавливаем соответствующее значение mismatch_confirmed
        const mismatch_confirmed = value === 'confirmed' ? true : 
                                  value === 'unconfirmed' ? false : null;
        
        setTempFilters(prev => ({ 
          ...prev, 
          mismatchStatus: value,
          mismatch_confirmed: mismatch_confirmed 
        }));
      }
    } else {
      // Обычная логика для всех остальных полей
      setTempFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  // Функция для применения временных фильтров
  const applyFilters = () => {
    // Устанавливаем фильтры из временных фильтров
    setFilters(tempFilters);
    // Сбрасываем страницу на первую
    setCurrentPage(1);
    // Загружаем данные с новыми фильтрами
    loadTransactions();
  };

  // Функция для сброса фильтров
  const resetFilters = () => {
    const emptyFilters = {
      fromDate: '',
      toDate: '',
      type: '',
      status: '',
      project: '',
      currency: '',
      compareType: '',
      mismatchStatus: '',
      mismatch_confirmed: null,
      paymentProcessors: [],
      paymentProcessorIds: [],
    };
    
    // Сбрасываем и временные, и активные фильтры
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    
    setPageSize(100);
    setCurrentPage(1);
  };

  // Функция для перехода на страницу
  const goToPage = pageNumber => {
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages &&
      pageNumber !== currentPage
    ) {
      setCurrentPage(pageNumber);
      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    }
  };

  // Функция для изменения размера страницы
  const handlePageSizeChange = newSize => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
  };

  // Функция для отображения модального окна с external ID
  const handleShowExternalId = externalId => {
    setCurrentExternalId(externalId);
    setShowExternalIdModal(true);
  };

  // Функция для закрытия модального окна с external ID
  const handleCloseExternalIdModal = () => {
    setShowExternalIdModal(false);
  };

  // Функция для выхода из системы
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

  // Загрузка транзакций при первом рендере и изменении страницы/фильтров
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Load payment processors for filters and for table display
  useEffect(() => {
    const loadPaymentProcessors = async () => {
      try {
        const response = await fetch('/api/v1/payments/?connected_history=true');
        if (response.ok) {
          const data = await response.json();
          // Check if data has items property (in case API returns array in items)
          const processors = data.items || data;
          setPaymentProcessors(processors);
        }
      } catch (error) {
        console.error('Error loading payment processors:', error);
      }
    };

    loadPaymentProcessors();
  }, []);

  return (
    <div className="page-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-title-container">
            <h1 className="dashboard-title">Transactions Dashboard</h1>
            <p className="dashboard-subtitle">
              Monitor and analyze your transaction data
            </p>
          </div>
          <div className="nav-container">
            <a href="/" className="nav-link active">
              Transactions
            </a>
            <a href="/reports" className="nav-link">
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
        {/* Filters Section */}
        <FiltersSection
          filters={tempFilters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          onApply={applyFilters}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Load and Compare Section */}
        <LoadCompareSection />

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Transactions Table */}
        <TransactionsTable
          transactions={transactions}
          isLoading={isLoading}
          isEmpty={transactions.length === 0 && !isLoading}
          onShowExternalId={handleShowExternalId}
          payments={paymentProcessors}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={goToPage}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Modals */}
        <ExternalIdModal
          isOpen={showExternalIdModal}
          externalId={currentExternalId}
          onClose={handleCloseExternalIdModal}
        />
      </div>
    </div>
  );
};

export default TransactionsDashboard;
