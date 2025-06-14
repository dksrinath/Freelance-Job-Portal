import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="page-container">
      {/* Hero Section - using page-header styling */}      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Find Your Perfect Freelancer</h1>
          <p className="page-subtitle">Connect with talented professionals for your next project</p>
          <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link to="/jobs" className="btn btn-primary">
              Browse Jobs
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-secondary">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container">        {/* Features Section */}
        <section style={{ padding: '4rem 0' }}>
          <h2 className="heading-responsive" style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            How It Works
          </h2>
          
          <div className="features-grid job-grid">
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Post Your Job</h3>
              <p className="text-responsive">Describe your project requirements, budget, and timeline. Get proposals from qualified freelancers.</p>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Review Proposals</h3>
              <p className="text-responsive">Compare freelancer profiles, portfolios, and proposals. Choose the best fit for your project.</p>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Get Work Done</h3>
              <p className="text-responsive">Collaborate with your chosen freelancer, track progress, and get your project completed on time.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
          <h2 className="heading-responsive" style={{ marginBottom: '1rem' }}>Ready to Get Started?</h2>
          <p className="text-responsive" style={{ marginBottom: '2rem', fontSize: '1.125rem' }}>
            Join thousands of clients and freelancers already using our platform
          </p>
          
          {!user && (
            <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/register?type=client" className="btn btn-primary">
                Hire Freelancers
              </Link>
              <Link to="/register?type=freelancer" className="btn btn-secondary">
                Find Work
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
