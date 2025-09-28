import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import CreateClass from './CreateClass';

const InstructorDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get('/classes/my-classes');
      const classesData = Array.isArray(response.data) ? response.data : [];
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setError('Failed to fetch classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchClasses();
  }, [user, navigate, fetchClasses]);

  const handleClassCreated = (newClass) => {
    if (newClass && newClass._id) {
      setClasses(prevClasses => [newClass, ...prevClasses]);
    }
  };

  const handleViewClass = (classId) => {
    navigate(`/class/${classId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Instructor Dashboard</h2>
          <p>Welcome back, {user?.username}!</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <CreateClass onClassCreated={handleClassCreated} />

      <div className="classes-section">
        <h3>Your Classes</h3>
        {classes.length === 0 ? (
          <div className="empty-state">
            <h3>No classes created yet</h3>
            <p>Create your first class to get started!</p>
          </div>
        ) : (
          <div className="classes-grid">
            {classes.map((classData) => {
              if (!classData || !classData._id) return null;
              
              return (
                <div key={classData._id} className="class-card">
                  <h3>{classData.subjectName || 'Unnamed Subject'}</h3>
                  <p><strong>Instructor:</strong> {classData.instructorName || 'Unknown'}</p>
                  <p><strong>Access Code:</strong> <span className="access-code">{classData.accessCode || 'N/A'}</span></p>
                  <p><strong>Duration:</strong> {classData.duration || 0} minutes</p>
                  <p><strong>Status:</strong> {new Date() > new Date(classData.endTime) ? 'Ended' : 'Active'}</p>
                  <button 
                    onClick={() => handleViewClass(classData._id)}
                    className="btn btn-primary"
                    style={{marginTop: '1rem'}}
                  >
                    View Questions
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;