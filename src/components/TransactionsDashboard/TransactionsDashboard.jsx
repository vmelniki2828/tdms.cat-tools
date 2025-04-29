import React, { useState, useEffect } from 'react';
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
  const [pageSize, setPageSize] = useState(10);
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
  });
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    type: '',
    status: '',
    project: '',
    currency: '',
    compareType: '',
  });

  // Применяем фильтры из состояния при переходе на страницу
  useEffect(() => {
    if (location.state?.filters) {
      setFilters(location.state.filters);
      // Сбрасываем состояние в location, чтобы фильтры не применялись повторно при обновлении страницы
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    console.log(stats);
  }, [stats]);

  // Функция для загрузки данных фильтров с API
  // Загрузка транзакций
  const loadTransactions = async () => {
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
      const totalTransactions = data.total || 0;
      const successfulTransactions = data.transactions.filter(t => t.status === 'completed').length || 0;
      const pendingTransactions = data.transactions.filter(t => t.status === 'pending').length || 0;
      const failedTransactions = data.transactions.filter(t => t.status === 'failed').length || 0;
      
      console.log('Рассчитанная статистика:', {
        total: totalTransactions,
        successful: successfulTransactions,
        pending: pendingTransactions,
        failed: failedTransactions
      });
      
      // Устанавливаем статистику вручную из расчетных значений
      setStats({
        totalTransactions: totalTransactions.toString(),
        successfulTransactions: successfulTransactions.toString(),
        pendingTransactions: pendingTransactions.toString(),
        failedTransactions: failedTransactions.toString(),
        transactionsTrend: data.stats?.total_trend || '0%',
        successTrend: data.stats?.success_trend || '0%',
        pendingTrend: data.stats?.pending_trend || '0%',
        failedTrend: data.stats?.failed_trend || '0%',
      });
      
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для обработки изменения фильтров
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Сброс на первую страницу при изменении фильтров
  };

  // Функция для сброса фильтров
  const resetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      type: '',
      status: '',
      project: '',
      currency: '',
      compareType: '',
    });
    setPageSize(10);
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
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    console.log(stats);
  }, [stats]);

  return (
    <div className="page-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-header-content">
            <div>
              <h1 className="dashboard-title">Transactions Dashboard</h1>
              <p className="dashboard-subtitle">
                Monitor and analyze your transaction data
              </p>
            </div>
            <div className="nav-container">
              <a href="/" className="nav-link active">
                Transactions
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
      </div>

      <div className="container main-content">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">
          Transactions Dashboard
        </h1>
        {/* Filters Section */}
        <FiltersSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          onApply={loadTransactions}
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
