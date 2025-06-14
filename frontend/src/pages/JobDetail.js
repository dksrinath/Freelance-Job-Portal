import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    coverLetter: '',
    bidAmount: '',
    deliveryTime: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    }
    setLoading(false);
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/proposals', {
        jobId: id,
        ...proposalData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Proposal submitted successfully!');
      setShowProposalForm(false);
      setProposalData({ coverLetter: '', bidAmount: '', deliveryTime: '' });
      fetchJob(); // Refresh job data to show updated proposal count
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit proposal');
    }
    
    setSubmitting(false);
  };

  const formatBudget = (job) => {
    if (job.budget.type === 'fixed') {
      return `$${job.budget.min} - $${job.budget.max} (Fixed Price)`;
    }
    return `$${job.budget.min} - $${job.budget.max} per hour`;
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
          <h3 className="loading-title">Loading Job Details</h3>
          <p className="loading-subtitle">Fetching project information...</p>
        </div>
      </div>
    );
  }
  if (!job) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="card">
            <h2>Job not found</h2>
            <p>The job you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const canSubmitProposal = user && user.userType === 'freelancer' && job.status === 'open';
  const isOwner = user && user.id === job.client._id;
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">{job.title}</h1>
          <p className="page-subtitle">Job Details</p>
        </div>
      </div>

      <div className="container">
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}        <div className="card">
          <div style={{ margin: '2rem 0' }}>
            <h3>Job Description</h3>
            <p style={{ lineHeight: '1.6' }}>{job.description}</p>
          </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', margin: '2rem 0' }}>
          <div>
            <h4>Budget</h4>
            <p>{formatBudget(job)}</p>
          </div>

          <div>
            <h4>Deadline</h4>
            <p>{new Date(job.deadline).toLocaleDateString()}</p>
          </div>

          <div>
            <h4>Category</h4>
            <p>{job.category}</p>
          </div>

          <div>
            <h4>Status</h4>
            <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-warning'}`}>
              {job.status}
            </span>
          </div>
        </div>

        <div style={{ margin: '2rem 0' }}>
          <h4>Required Skills</h4>
          <div>
            {job.skills.map((skill, index) => (
              <span key={index} className="badge badge-primary">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div style={{ margin: '2rem 0' }}>
          <h4>Client Information</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <p><strong>{job.client.name}</strong></p>
              <p>Rating: {job.client.rating?.average || 'No rating yet'}</p>
            </div>
          </div>
        </div>

        <div style={{ margin: '2rem 0' }}>
          <h4>Proposals ({job.proposals?.length || 0})</h4>
          {isOwner && job.proposals?.length > 0 && (
            <div>
              {job.proposals.map((proposal) => (
                <div key={proposal._id} className="card" style={{ margin: '1rem 0' }}>
                  <h5>{proposal.freelancer.name}</h5>
                  <p><strong>Bid:</strong> ${proposal.bidAmount}</p>
                  <p><strong>Delivery Time:</strong> {proposal.deliveryTime} days</p>
                  <p><strong>Cover Letter:</strong> {proposal.coverLetter}</p>
                  <span className={`badge ${proposal.status === 'submitted' ? 'badge-warning' : 'badge-success'}`}>
                    {proposal.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {canSubmitProposal && (
          <div style={{ marginTop: '2rem' }}>
            {!showProposalForm ? (
              <button 
                onClick={() => setShowProposalForm(true)}
                className="btn btn-primary"
              >
                Submit Proposal
              </button>
            ) : (
              <div className="card">
                <h3>Submit Your Proposal</h3>
                <form onSubmit={handleProposalSubmit}>
                  <div className="form-group">
                    <label htmlFor="bidAmount">Your Bid ($)</label>
                    <input
                      type="number"
                      id="bidAmount"
                      value={proposalData.bidAmount}
                      onChange={(e) => setProposalData({...proposalData, bidAmount: e.target.value})}
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="deliveryTime">Delivery Time (days)</label>
                    <input
                      type="number"
                      id="deliveryTime"
                      value={proposalData.deliveryTime}
                      onChange={(e) => setProposalData({...proposalData, deliveryTime: e.target.value})}
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="coverLetter">Cover Letter</label>
                    <textarea
                      id="coverLetter"
                      value={proposalData.coverLetter}
                      onChange={(e) => setProposalData({...proposalData, coverLetter: e.target.value})}
                      required
                      rows="5"
                      placeholder="Explain why you're the best fit for this project..."
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowProposalForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default JobDetail;
