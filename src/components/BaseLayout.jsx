import React from 'react';
import { Outlet } from 'react-router-dom';
import './BaseLayout.css';

const BaseLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="dashboard-header animate__animated animate__fadeIn">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Transactions Dashboard</h1>
              <p className="text-gray-100">Monitor and analyze your transaction data</p>
            </div>
            <div className="flex space-x-4">
              {/* Header actions will be inserted here */}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default BaseLayout; 