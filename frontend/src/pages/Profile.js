import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    profile: {
      bio: '',
      skills: [],
      hourlyRate: '',
      location: '',
      phone: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        profile: {
          bio: response.data.profile?.bio || '',
          skills: response.data.profile?.skills || [],
          hourlyRate: response.data.profile?.hourlyRate || '',
          location: response.data.profile?.location || '',
          phone: response.data.profile?.phone || ''
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    
    setSubmitting(false);
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData({
      ...formData,
      profile: {
        ...formData.profile,
        skills
      }
    });
  };  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3 className="loading-title">Loading Profile</h3>
          <p className="loading-subtitle">Retrieving your information...</p>
        </div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="page-container">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="alert alert-error">
            Failed to load profile data. Please try refreshing the page.
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your personal information</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="content-header">
          {!editing && (
            <button 
              onClick={() => setEditing(true)}
              className="btn btn-primary"
            >
              Edit Profile
            </button>
          )}
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {editing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={formData.profile.bio}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: {...formData.profile, bio: e.target.value}
                })}
                rows="4"
                placeholder="Tell others about yourself..."
              />
            </div>

            {user && user.userType === 'freelancer' && (
              <>
                <div className="form-group">
                  <label htmlFor="skills">Skills (comma-separated)</label>
                  <input
                    type="text"
                    id="skills"
                    value={formData.profile.skills.join(', ')}
                    onChange={handleSkillsChange}
                    placeholder="e.g., React, JavaScript, CSS"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hourlyRate">Hourly Rate ($)</label>
                  <input
                    type="number"
                    id="hourlyRate"
                    value={formData.profile.hourlyRate}
                    onChange={(e) => setFormData({
                      ...formData,
                      profile: {...formData.profile, hourlyRate: e.target.value}
                    })}
                    min="1"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                value={formData.profile.location}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: {...formData.profile, location: e.target.value}
                })}
                placeholder="City, Country"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={formData.profile.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  profile: {...formData.profile, phone: e.target.value}
                })}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                onClick={() => setEditing(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>            <div style={{ marginBottom: '2rem' }}>
              <h2>{profile?.name || 'User'}</h2>
              <p style={{ color: '#6b7280' }}>{profile?.email || ''}</p>
              <span className="badge badge-primary">{profile?.userType || 'User'}</span>
            </div>

            {profile?.profile?.bio && (
              <div style={{ marginBottom: '2rem' }}>
                <h3>Bio</h3>
                <p>{profile.profile.bio}</p>
              </div>
            )}

            {profile?.userType === 'freelancer' && profile?.profile?.skills?.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3>Skills</h3>
                <div>
                  {profile.profile.skills.map((skill, index) => (
                    <span key={index} className="badge badge-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile?.userType === 'freelancer' && profile?.profile?.hourlyRate && (
              <div style={{ marginBottom: '2rem' }}>
                <h3>Hourly Rate</h3>
                <p>${profile.profile.hourlyRate}/hour</p>
              </div>
            )}

            {profile.profile?.location && (
              <div style={{ marginBottom: '2rem' }}>
                <h3>Location</h3>
                <p>{profile.profile.location}</p>
              </div>
            )}

            {profile.profile?.phone && (
              <div style={{ marginBottom: '2rem' }}>
                <h3>Phone</h3>
                <p>{profile.profile.phone}</p>
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <h3>Rating</h3>
              <p>
                {profile.rating?.average 
                  ? `${profile.rating.average.toFixed(1)}/5 (${profile.rating.count} reviews)`
                  : 'No ratings yet'
                }
              </p>
            </div>            <div>
              <h3>Account Information</h3>
              <p><strong>Member since:</strong> {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}</p>
              <p><strong>Verified:</strong> {profile?.isVerified ? 'Yes' : 'No'}</p>
            </div>          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Profile;
