import React from 'react';
import { Outlet } from 'react-router-dom';
import './BaseLayout.css';

const BaseLayout = () => {
  return (
    <div className="base-layout">
      <header className="header">
        {/* Здесь будет шапка сайта */}
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        {/* Здесь будет подвал сайта */}
      </footer>
    </div>
  );
};

export default BaseLayout; 