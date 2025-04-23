import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BaseLayout from './components/BaseLayout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Jobs from './components/Jobs';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App; 