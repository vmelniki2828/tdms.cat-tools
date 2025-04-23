import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Панель управления</h1>
      </div>
      <div className="dashboard-content">
        <div className="stats-cards">
          {/* Здесь будут карточки со статистикой */}
        </div>
        <div className="recent-activity">
          {/* Здесь будет список последних действий */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 