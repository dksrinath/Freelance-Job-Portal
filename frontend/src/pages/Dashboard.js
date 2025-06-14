import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    jobs: [],
    proposals: []
  });
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    budget: { min: '', max: '', type: 'fixed' },
    deadline: '',
    skills: '',
    category: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (user.userType === 'client') {
        const jobsResponse = await axios.get('/api/jobs/user/jobs', { headers });
        setData({ jobs: jobsResponse.data });
      } else {
        const proposalsResponse = await axios.get('/api/proposals/my-proposals', { headers });
        setData({ proposals: proposalsResponse.data });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...jobFormData,
        skills: jobFormData.skills.split(',').map(skill => skill.trim()),
        budget: {
          min: Number(jobFormData.budget.min),
          max: Number(jobFormData.budget.max),
          type: jobFormData.budget.type
        }
      };

      await axios.post('/api/jobs', submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Job posted successfully!');
      setShowJobForm(false);
      setJobFormData({
        title: '',
        description: '',
        budget: { min: '', max: '', type: 'fixed' },
        deadline: '',
        skills: '',
        category: ''
      });
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    }
    
    setSubmitting(false);
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
          <h3 className="loading-title">Loading Dashboard</h3>
          <p className="loading-subtitle">Setting up your workspace...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user.name}!</p>
        </div>
      </div>

      <div className="container">
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

      {user.userType === 'client' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
            <h2>My Posted Jobs</h2>
            <button 
              onClick={() => setShowJobForm(true)}
              className="btn btn-primary"
            >
              Post New Job
            </button>
          </div>

          {showJobForm && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3>Post a New Job</h3>
              <form onSubmit={handleJobSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Job Title</label>
                  <input
                    type="text"
                    id="title"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({...jobFormData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData({...jobFormData, description: e.target.value})}
                    required
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={jobFormData.category}
                    onChange={(e) => setJobFormData({...jobFormData, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Design">Design</option>
                    <option value="Writing">Writing</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="budgetMin">Min Budget ($)</label>
                    <input
                      type="number"
                      id="budgetMin"
                      value={jobFormData.budget.min}
                      onChange={(e) => setJobFormData({
                        ...jobFormData, 
                        budget: {...jobFormData.budget, min: e.target.value}
                      })}
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="budgetMax">Max Budget ($)</label>
                    <input
                      type="number"
                      id="budgetMax"
                      value={jobFormData.budget.max}
                      onChange={(e) => setJobFormData({
                        ...jobFormData, 
                        budget: {...jobFormData.budget, max: e.target.value}
                      })}
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="budgetType">Budget Type</label>
                    <select
                      id="budgetType"
                      value={jobFormData.budget.type}
                      onChange={(e) => setJobFormData({
                        ...jobFormData, 
                        budget: {...jobFormData.budget, type: e.target.value}
                      })}
                      required
                    >
                      <option value="fixed">Fixed Price</option>
                      <option value="hourly">Hourly Rate</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="deadline">Deadline</label>
                  <input
                    type="date"
                    id="deadline"
                    value={jobFormData.deadline}
                    onChange={(e) => setJobFormData({...jobFormData, deadline: e.target.value})}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skills">Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    id="skills"
                    value={jobFormData.skills}
                    onChange={(e) => setJobFormData({...jobFormData, skills: e.target.value})}
                    placeholder="e.g., React, JavaScript, CSS"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Posting...' : 'Post Job'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowJobForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="job-grid">
            {data.jobs.length === 0 ? (
              <div className="card">
                <p>You haven't posted any jobs yet.</p>
              </div>
            ) : (
              data.jobs.map((job) => (
                <div key={job._id} className="card">
                  <h3>{job.title}</h3>
                  <p>{job.description.substring(0, 100)}...</p>
                  <div style={{ margin: '1rem 0' }}>
                    <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-warning'}`}>
                      {job.status}
                    </span>
                    <span className="badge" style={{ marginLeft: '0.5rem' }}>
                      {job.proposals?.length || 0} proposals
                    </span>
                  </div>
                  <p><strong>Budget:</strong> ${job.budget.min} - ${job.budget.max}</p>
                  <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div>
          <h2>My Proposals</h2>
          <div className="job-grid">
            {data.proposals.length === 0 ? (
              <div className="card">
                <p>You haven't submitted any proposals yet.</p>
              </div>
            ) : (
              data.proposals.map((proposal) => (
                <div key={proposal._id} className="card">
                  <h3>{proposal.job.title}</h3>
                  <p><strong>Your Bid:</strong> ${proposal.bidAmount}</p>
                  <p><strong>Delivery Time:</strong> {proposal.deliveryTime} days</p>
                  <p><strong>Status:</strong> 
                    <span className={`badge ${
                      proposal.status === 'accepted' ? 'badge-success' : 
                      proposal.status === 'rejected' ? 'badge-warning' : 'badge'
                    }`} style={{ marginLeft: '0.5rem' }}>
                      {proposal.status}
                    </span>
                  </p>
                  <p><strong>Client:</strong> {proposal.job.client?.name}</p>
                </div>
              ))
            )}          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;
