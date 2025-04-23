import React, { useState } from 'react';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>Задания</h1>
        <div className="jobs-filter">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Все</option>
            <option value="active">Активные</option>
            <option value="completed">Завершенные</option>
          </select>
        </div>
      </div>
      <div className="jobs-list">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <div className="job-status">{job.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs; 