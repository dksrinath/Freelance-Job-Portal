import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    skills: '',
    budget: ''
  });  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');
        
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.skills) params.append('skills', filters.skills);
        if (filters.budget) params.append('budget', filters.budget);
        if (searchTerm) params.append('search', searchTerm);

        const response = await axios.get(`/api/jobs?${params}`);
        setJobs(response.data.jobs || []);
      } catch (error) {
        setError('Failed to load jobs');
        setJobs([]);
      }
      setLoading(false);
    };

    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  const retryFetch = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.skills) params.append('skills', filters.skills);
      if (filters.budget) params.append('budget', filters.budget);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(`/api/jobs?${params}`);
      setJobs(response.data.jobs || []);
    } catch (error) {
      setError('Failed to load jobs');
      setJobs([]);
    }
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ category: '', skills: '', budget: '' });
    setSearchTerm('');
  };

  const formatBudget = (job) => {
    if (!job?.budget) return 'Budget not specified';
    const type = job.budget.type === 'fixed' ? 'Fixed' : '/hr';
    return `$${job.budget.min} - $${job.budget.max} ${type}`;
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    const diffDays = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return date.toLocaleDateString();
  };
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3 className="loading-title">Loading Jobs</h3>
          <p className="loading-subtitle">Finding the best opportunities for you...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Find Your Next Project</h1>
          <p className="page-subtitle">Browse {jobs.length} available opportunities</p>
        </div>
      </div>

      <div className="container">
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
            <button onClick={retryFetch} className="btn btn-small btn-primary">
              Try Again
            </button>
          </div>
        )}
          <div className="filters-card">
          <div className="filters-header">
            <h3>Filter Jobs</h3>
            <div className="filters-actions">
              {(searchTerm || Object.values(filters).some(f => f)) && (
                <span className="active-filters-count">
                  {[searchTerm, ...Object.values(filters)].filter(Boolean).length} active
                </span>
              )}
              <button onClick={clearFilters} className="btn btn-secondary btn-small">
                Clear All
              </button>
            </div>
          </div>          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search jobs by title, skills, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`form-input search-input ${searchTerm ? 'has-value' : ''}`}
            />
          </div><div className="filters-grid">            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="select-wrapper">
                <select 
                  name="category" 
                  value={filters.category} 
                  onChange={handleFilterChange} 
                  className={`form-input form-select ${filters.category ? 'has-value' : ''}`}
                >
                  <option value="">🏷️ All Categories</option>
                  <option value="Web Development">💻 Web Development</option>
                  <option value="Mobile Development">📱 Mobile Development</option>
                  <option value="Design">🎨 Design</option>
                  <option value="Writing">✍️ Writing</option>
                  <option value="Marketing">📈 Marketing</option>
                </select>
                <div className="select-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Skills</label>
              <input
                type="text"
                name="skills"
                placeholder="🔧 e.g., React, Python, Design"
                value={filters.skills}
                onChange={handleFilterChange}
                className={`form-input ${filters.skills ? 'has-value' : ''}`}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Budget Range</label>
              <div className="select-wrapper">
                <select 
                  name="budget" 
                  value={filters.budget} 
                  onChange={handleFilterChange} 
                  className={`form-input form-select ${filters.budget ? 'has-value' : ''}`}
                >
                  <option value="">💰 Any Budget</option>
                  <option value="0-500">💵 $0 - $500</option>
                  <option value="500-1000">💶 $500 - $1,000</option>
                  <option value="1000-5000">💷 $1,000 - $5,000</option>
                  <option value="5000-">💎 $5,000+</option>
                </select>
                <div className="select-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="jobs-grid">
          {jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search criteria to find more opportunities</p>
              {(searchTerm || Object.values(filters).some(f => f)) && (
                <button onClick={clearFilters} className="btn btn-primary">
                  Show All Jobs
                </button>
              )}
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="job-card">
                <div className="job-header">
                  <h3 className="job-title">
                    <Link to={`/jobs/${job._id}`} className="job-link">
                      {job.title}
                    </Link>
                  </h3>
                  <div className="job-meta">
                    <span className="job-deadline">
                      ⏰ {formatDeadline(job.deadline)}
                    </span>
                    <span className="badge badge-success">
                      {job.proposals?.length || 0} proposals
                    </span>
                  </div>
                </div>
                
                <p className="job-description">
                  {job.description?.substring(0, 150)}
                  {job.description?.length > 150 && '...'}
                </p>

                <div className="job-budget">
                  <span className="budget-label">💰 Budget:</span>
                  <span className="budget-amount">{formatBudget(job)}</span>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="job-skills">
                    {job.skills.slice(0, 4).map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="skill-more">+{job.skills.length - 4} more</span>
                    )}
                  </div>
                )}

                <div className="job-footer">
                  <span className="client-name">
                    👤 {job.client?.name || 'Anonymous Client'}
                  </span>
                  <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-small">
                    View Details →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
