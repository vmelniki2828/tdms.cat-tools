import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './components/Login';

import Jobs from './components/Jobs';
import Reports from './components/Reports';
import TransactionsDashboard from './components/TransactionsDashboard/TransactionsDashboard';
import PaymentDetailsPage from './components/TransactionsDashboard/PaymentDetailsPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<TransactionsDashboard />} />
        <Route path="/payment-details/:paymentId" element={<PaymentDetailsPage />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/jobs" element={<Jobs />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
