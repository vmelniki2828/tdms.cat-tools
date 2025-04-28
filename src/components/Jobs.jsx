import React, { useState, useEffect } from 'react';
import './Jobs.css';
import JobDetailsModal from './JobDetailsModal';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/v1/jobs/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setJobs(data.items || []);
      setLoading(false);
    } catch (error) {
      setError('Error loading jobs. Please try again.');
      console.error('Error loading jobs:', error);
      setLoading(false);
    }
  };

  const viewJobDetails = async (jobId) => {
    try {
      const response = await fetch(`/api/v1/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const job = await response.json();
      setSelectedJob(job);
      setShowJobDetails(true);
    } catch (error) {
      console.error('Error loading job details:', error);
      alert('Error loading job details. Please try again.');
    }
  };

  const closeJobDetails = () => {
    setShowJobDetails(false);
    setSelectedJob(null);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
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

  const calculateJobProgress = (job) => {
    if (!job.data || !job.data.progress) return 0;
    
    const progress = job.data.progress;
    let totalSteps = 1; // Fundist
    let completedSteps = progress.fundist_ready ? 1 : 0;
    
    if (progress.payments && Object.keys(progress.payments).length > 0) {
      const paymentCount = Object.keys(progress.payments).length;
      totalSteps += paymentCount * 2;
      
      for (const [_, status] of Object.entries(progress.payments)) {
        if (status.ready) completedSteps++;
        if (status.processed) completedSteps++;
      }
    }
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const formatJobType = (type) => {
    switch (type) {
      case 'load_history':
        return (
          <div className="job-type-display">
            <svg xmlns="http://www.w3.org/2000/svg" className="job-type-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>Load History</span>
          </div>
        );
      default:
        return type;
    }
  };

  return (
    <div className="page-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-header-content">
            <div>
              <h1 className="dashboard-title">Jobs Dashboard</h1>
              <p className="dashboard-subtitle">
                Monitor and manage your background jobs
              </p>
            </div>
            <div className="nav-container">
              <a href="/dashboard" className="nav-link">
                Transactions
              </a>
              <a href="/jobs" className="nav-link active">
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
        {/* Jobs Statistics */}
        <div className="stats-cards-container" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="stats-card-label">Last 24 hours</div>
            </div>
            <div className="stats-card-content">
              <div className="stats-card-title">Total Jobs</div>
              <div className="stats-card-value">{jobs.length}</div>
            </div>
        </div>

          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-icon pending">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              </div>
              <div className="stats-card-label">Last 24 hours</div>
            </div>
            <div className="stats-card-content">
              <div className="stats-card-title">Pending Jobs</div>
              <div className="stats-card-value pending">{jobs.filter(job => job.status === 'pending').length}</div>
            </div>
        </div>

          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-icon completed">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              </div>
              <div className="stats-card-label">Last 24 hours</div>
            </div>
            <div className="stats-card-content">
              <div className="stats-card-title">Completed Jobs</div>
              <div className="stats-card-value completed">{jobs.filter(job => job.status === 'completed').length}</div>
            </div>
        </div>
      </div>

      {/* Jobs List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Recent Jobs</h2>
          <button 
            onClick={loadJobs}
              className="refresh-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
            </svg>
              Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="jobs-table-header">JOB ID</th>
                  <th className="jobs-table-header">TYPE</th>
                  <th className="jobs-table-header">STATUS</th>
                  <th className="jobs-table-header">PROGRESS</th>
                  <th className="jobs-table-header">CREATED</th>
                  <th className="jobs-table-header">ACTIONS</th>
              </tr>
            </thead>
              <tbody>
              {loading ? (
                <tr>
                    <td colSpan="6" className="jobs-table-cell text-center">
                    Loading jobs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                    <td colSpan="6" className="jobs-table-cell text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                    <td colSpan="6" className="jobs-table-cell text-center">
                    No jobs found.
                  </td>
                </tr>
              ) : (
                jobs.map(job => (
                    <tr key={job.id} className="jobs-table-row">
                      <td className="jobs-table-cell">
                      <div className="font-mono">{job.id.substring(0, 8)}...</div>
                    </td>
                      <td className="jobs-table-cell">
                      {formatJobType(job.type)}
                    </td>
                      <td className="jobs-table-cell">
                      <span className={`status-badge status-${job.status.toLowerCase()}`}>
                          {job.status.toUpperCase()}
                      </span>
                    </td>
                      <td className="jobs-table-cell">
                      {job.type === 'load_history' && job.status === 'pending' ? (
                        <>
                          <div className="w-full progress-bar">
                            <div 
                              className="progress-value" 
                              style={{ width: `${calculateJobProgress(job)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {calculateJobProgress(job)}% complete
                          </div>
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                      <td className="jobs-table-cell">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                      <td className="jobs-table-cell">
                      <button 
                        onClick={() => viewJobDetails(job.id)}
                          className="view-details-button"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Модальное окно с деталями задания */}
      {showJobDetails && selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={closeJobDetails} 
          calculateProgress={calculateJobProgress}
        />
      )}
    </div>
  );
};

export default Jobs; 