import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    type: '',
    status: '',
    project: '',
    currency: '',
    compareType: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showLoadCompare, setShowLoadCompare] = useState(false);
  const [showExternalIdModal, setShowExternalIdModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [externalId, setExternalId] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    projects: [],
    currencies: []
  });
  const [paymentProcessors, setPaymentProcessors] = useState([]);
  const [stats, setStats] = useState({
    totalTransactions: '-',
    successfulTransactions: '-',
    pendingTransactions: '-',
    failedTransactions: '-',
    transactionsTrend: '0%',
    successTrend: '0%',
    pendingTrend: '0%',
    failedTrend: '0%'
  });

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        page_size: pageSize
      });

      if (filters.fromDate) params.append('from_date', `${filters.fromDate}T00:00:00`);
      if (filters.toDate) params.append('to_date', `${filters.toDate}T23:59:59`);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.project) params.append('project', filters.project);
      if (filters.currency) params.append('currency', filters.currency);
      if (filters.compareType) params.append('compare_type', filters.compareType);

      const response = await fetch(`/api/v1/transactions/?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (!data || !data.transactions) {
        throw new Error('Invalid response format');
      }

      setTransactions(data.transactions);
      setTotalPages(Math.ceil(data.total / pageSize));
    } catch (error) {
      setError(error.message);
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/v1/transactions/filters-data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFilterOptions(data);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadPaymentProcessors = async () => {
    try {
      const response = await fetch('/api/v1/payments/?connected_history=true');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPaymentProcessors(data.items || []);
    } catch (error) {
      console.error('Error loading payment processors:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      type: '',
      status: '',
      project: '',
      currency: '',
      compareType: ''
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/v1/users/logout', {
        method: 'POST'
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

  useEffect(() => {
    loadFilterOptions();
    loadPaymentProcessors();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [currentPage, pageSize, filters]);

  const getPaymentInfo = (tx) => {
    if (tx.payment_transaction) {
      return (
        <div className="text-sm space-y-1">
          <div className="font-medium text-gray-900">ID: {tx.payment_transaction.id}</div>
          <div className="text-gray-500">Status: {capitalizePayment(tx.payment_transaction.status)}</div>
          <div className="text-gray-500">Amount: {tx.payment_transaction.amount}</div>
          {tx.payment_transaction.external_id && (
            <div className="text-gray-500">External ID: {tx.payment_transaction.external_id}</div>
          )}
          {tx.fundist_transaction?.payment && (
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {capitalizePayment(tx.fundist_transaction.payment)}
            </div>
          )}
        </div>
      );
    } else if (tx.fundist_transaction?.connected) {
      return (
        <div className="flex items-center justify-center p-2 bg-yellow-50 rounded-md">
          <div className="flex items-center space-x-2 text-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">Connected but awaiting payment info</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">No payment info</span>
        </div>
      );
    }
  };

  const getGatewayInfo = (tx) => {
    return tx.fundist_transaction?.gateway ? (
      <div className="flex items-center space-x-2 text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="text-sm font-medium">{capitalizePayment(tx.fundist_transaction.gateway)}</span>
      </div>
    ) : '-';
  };

  const getProjectInfo = (tx) => {
    return tx.fundist_transaction?.project ? (
      <div className="flex items-center space-x-2 text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="text-sm font-medium">{tx.fundist_transaction.project}</span>
      </div>
    ) : '-';
  };

  const getExternalIdInfo = (tx) => {
    return tx.fundist_transaction?.external_id ? (
      <div 
        className="flex items-center space-x-2 text-gray-600 cursor-pointer hover:text-blue-600" 
        onClick={() => {
          setExternalId(tx.fundist_transaction.external_id);
          setShowExternalIdModal(true);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span className="text-sm font-medium">Click to view</span>
      </div>
    ) : '-';
  };

  const getUserStatusBadge = (status) => {
    const statusConfig = {
      'previp': {
        color: 'bg-purple-100 text-purple-800',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )
      },
      'vip': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )
      },
      'streamer': {
        color: 'bg-blue-100 text-blue-800',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      }
    };

    const config = statusConfig[status?.toLowerCase()] || {
      color: 'bg-gray-100 text-gray-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    };

    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{status || 'Unknown'}</span>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const capitalizePayment = (payment) => {
    if (!payment) return '';
    return payment.charAt(0).toUpperCase() + payment.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="dashboard-header animate__animated animate__fadeIn">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Панель транзакций</h1>
              <p className="text-gray-100">Мониторинг и анализ данных транзакций</p>
            </div>
            <div className="flex space-x-4">
              <nav className="flex space-x-2">
                <Link to="/" className="nav-link active">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Транзакции</span>
                </Link>
                <Link to="/jobs" className="nav-link">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>Задачи</span>
                </Link>
              </nav>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 transition-all duration-200 px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stats-card p-6 animate__animated animate__fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="stat-trend-up flex items-center text-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>{stats.transactionsTrend}</span>
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Всего транзакций</h3>
            <p className="stats-value text-3xl font-bold mt-2">{stats.totalTransactions}</p>
            <p className="text-gray-400 text-sm mt-2">vs. предыдущий период</p>
          </div>

          <div className="stats-card p-6 animate__animated animate__fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-trend-up flex items-center text-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>{stats.successTrend}</span>
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Успешные транзакции</h3>
            <p className="stats-value text-3xl font-bold mt-2">{stats.successfulTransactions}</p>
            <p className="text-gray-400 text-sm mt-2">vs. предыдущий период</p>
          </div>

          <div className="stats-card p-6 animate__animated animate__fadeInUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-trend-down flex items-center text-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
                <span>{stats.pendingTrend}</span>
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Ожидающие транзакции</h3>
            <p className="stats-value text-3xl font-bold mt-2">{stats.pendingTransactions}</p>
            <p className="text-gray-400 text-sm mt-2">vs. предыдущий период</p>
          </div>

          <div className="stats-card p-6 animate__animated animate__fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-trend-down flex items-center text-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
                <span>{stats.failedTrend}</span>
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Неудачные транзакции</h3>
            <p className="stats-value text-3xl font-bold mt-2">{stats.failedTransactions}</p>
            <p className="text-gray-400 text-sm mt-2">vs. предыдущий период</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className="w-full sm:w-auto flex items-center justify-between text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <div className="flex items-center space-x-3">
                <div className="icon-container bg-indigo-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <span className="font-semibold text-lg">Фильтры</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`filter-badge ${Object.values(filters).some(Boolean) ? '' : 'hidden'}`}>
                  {Object.values(filters).filter(Boolean).length} активных
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`filters-toggle text-gray-400 transform transition-transform ${showFilters ? 'rotate' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
          </div>

          {showFilters && (
            <div className="filters-container show">
              {/* ... filter content ... */}
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <div className="flex items-center space-x-2">
                      <span>Информация</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th>
                    <div className="flex items-center space-x-2">
                      <span>Сумма</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th>
                    <div className="flex items-center space-x-2">
                      <span>Статус</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th>
                    <div className="flex items-center space-x-2">
                      <span>Шлюз</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th>
                    <div className="flex items-center space-x-2">
                      <span>Внешний ID</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th>
                    <div className="flex items-center space-x-2">
                      <span>Платеж</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                  <th>
                    <div className="flex items-center space-x-2">
                      <span>Дата</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
                      <div className="loading-spinner">
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Загрузка транзакций...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-red-500">
                      <div className="error-message">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
                      <div className="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>Нет транзакций</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{getPaymentInfo(tx)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{tx.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`status-badge ${getStatusColor(tx.fundist_transaction?.status)}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {tx.fundist_transaction?.status || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getGatewayInfo(tx)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getExternalIdInfo(tx)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getPaymentInfo(tx)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.fundist_transaction?.date ? new Date(tx.fundist_transaction.date).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm items-center space-x-2" aria-label="Pagination">
            <button 
              onClick={() => handlePageChange(1)} 
              className="pagination-btn"
              disabled={currentPage <= 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0L9.586 11l4.707-4.707a1 1 0 111.414 1.414L11.414 11l4.293 4.293a1 1 0 010 1.414zM6.707 15.707a1 1 0 01-1.414 0L.586 11 5.293 6.293a1 1 0 011.414 1.414L2.414 11l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              className="pagination-btn"
              disabled={currentPage <= 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0L6.586 11l4.707-4.707a1 1 0 111.414 1.414L8.414 11l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white rounded-md">
              <span className="text-sm text-gray-700">Страница</span>
              <input 
                type="number" 
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value && value >= 1 && value <= totalPages) {
                    handlePageChange(value);
                  }
                }}
                className="mx-2 w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center text-sm"
              />
              <span className="text-sm text-gray-700">из <span className="font-medium">{totalPages}</span></span>
            </div>

            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              className="pagination-btn"
              disabled={currentPage >= totalPages}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 15.707a1 1 0 001.414 0L13.414 11 8.707 6.293a1 1 0 00-1.414 1.414L11.586 11 7.293 14.293a1 1 0 000 1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <button 
              onClick={() => handlePageChange(totalPages)} 
              className="pagination-btn"
              disabled={currentPage >= totalPages}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0L10.414 11 5.707 6.293a1 1 0 00-1.414 1.414L8.586 11 4.293 14.293a1 1 0 000 1.414zM13.293 15.707a1 1 0 001.414 0L19.414 11 14.707 6.293a1 1 0 00-1.414 1.414L17.586 11l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>

          <div className="page-size-selector">
            <div className="flex items-center space-x-2">
              <label htmlFor="pageSize" className="text-sm text-gray-600">Элементов на странице:</label>
              <select 
                id="pageSize" 
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Показано <span className="font-medium">{transactions.length ? (currentPage - 1) * pageSize + 1 : 0}</span> - <span className="font-medium">{Math.min(currentPage * pageSize, transactions.length)}</span> из <span className="font-medium">{transactions.length}</span> элементов
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLogoutModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowLogoutModal(false)}>&times;</span>
            <h2 className="text-xl font-semibold mb-4">Подтверждение выхода</h2>
            <p className="mb-6">Вы уверены, что хотите выйти из системы?</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="btn btn-secondary"
              >
                Отмена
              </button>
              <button 
                onClick={handleLogout}
                className="btn btn-primary"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 