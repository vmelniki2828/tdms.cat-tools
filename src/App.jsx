import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BaseLayout from './components/BaseLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Jobs from './components/Jobs';
import TransactionsDashboard from './components/TransactionsDashboard/TransactionsDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<TransactionsDashboard />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="jobs" element={<Jobs />} />
      </Routes>
    </Router>
  );
};

export default App; 
