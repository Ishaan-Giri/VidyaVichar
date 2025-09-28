import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState('instructor');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    accessCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'instructor') {
        if (!formData.username || !formData.password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        
        const result = await login({
          username: formData.username,
          password: formData.password
        }, true);

        if (result.success) {
          navigate('/instructor-dashboard');
        } else {
          setError(result.message);
        }
      } else {
        if (!formData.accessCode) {
          setError('Please enter the access code');
          setLoading(false);
          return;
        }

        const result = await login({
          accessCode: formData.accessCode
        }, false);

        if (result.success) {
          navigate('/student-dashboard', { 
            state: { classData: result.classData } 
          });
        } else {
          setError(result.message);
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="tab-buttons" style={{marginBottom: '2rem', display: 'flex', borderRadius: '8px', overflow: 'hidden'}}>
        <button
          className={`tab-button ${activeTab === 'instructor' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructor')}
          style={{
            flex: 1,
            padding: '1rem',
            border: 'none',
            background: activeTab === 'instructor' ? '#667eea' : '#e1e1e1',
            color: activeTab === 'instructor' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Instructor Login
        </button>
        <button
          className={`tab-button ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => setActiveTab('student')}
          style={{
            flex: 1,
            padding: '1rem',
            border: 'none',
            background: activeTab === 'student' ? '#667eea' : '#e1e1e1',
            color: activeTab === 'student' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Student/TA Access
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {activeTab === 'instructor' ? (
          <>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>
          </>
        ) : (
          <div className="form-group">
            <label htmlFor="accessCode">Access Code</label>
            <input
              type="text"
              id="accessCode"
              name="accessCode"
              value={formData.accessCode}
              onChange={handleInputChange}
              placeholder="Enter 6-digit class access code"
              maxLength={6}
              style={{textTransform: 'uppercase'}}
              required
            />
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Signing In...' : `Sign In as ${activeTab === 'instructor' ? 'Instructor' : 'Student'}`}
        </button>
      </form>

      {activeTab === 'instructor' && (
        <div className="auth-links">
          <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
        </div>
      )}
    </div>
  );
};

export default Login;