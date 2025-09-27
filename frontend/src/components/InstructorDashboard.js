import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import CreateClass from './CreateClass';
import StickyNote from './StickyNote';
import QuestionFilter from './QuestionFilter';

const InstructorDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get('/classes/my-classes');
      // Ensure response.data is an array
      const classesData = Array.isArray(response.data) ? response.data : [];
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setError('Failed to fetch classes');
      setClasses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    if (!activeClass || !activeClass._id) return;
    
    try {
      const response = await api.get(`/questions/class/${activeClass._id}?status=${filter}`);
      // Ensure response.data is an array and filter out any undefined/null values
      const questionsData = Array.isArray(response.data) 
        ? response.data.filter(q => q && q._id) 
        : [];
      
      console.log('Fetched questions:', questionsData); // Debug log
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestions([]); // Set empty array on error
    }
  }, [activeClass, filter]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchClasses();
  }, [user, navigate, fetchClasses]);

  useEffect(() => {
    if (activeClass) {
      fetchQuestions();
      // Set up polling for real-time updates
      const interval = setInterval(fetchQuestions, 3000);
      return () => clearInterval(interval);
    }
  }, [activeClass, filter, fetchQuestions]);

  const handleClassCreated = (newClass) => {
    if (newClass && newClass._id) {
      setClasses(prevClasses => [newClass, ...prevClasses]);
    }
  };

  const handleJoinClass = (classData) => {
    if (classData && classData._id) {
      setActiveClass(classData);
      setFilter('all');
    }
  };

  const handleQuestionStatusChange = async (questionId, newStatus) => {
    if (!questionId || !newStatus) return;
    
    try {
      await api.patch(`/questions/${questionId}/status`, { status: newStatus });
      fetchQuestions(); // Refresh questions
    } catch (error) {
      console.error('Failed to update question status:', error);
      setError('Failed to update question status');
    }
  };

  const handleClearBoard = async () => {
    if (!activeClass || !activeClass._id) return;
    
    if (window.confirm('Are you sure you want to clear all questions?')) {
      try {
        await api.delete(`/questions/class/${activeClass._id}/clear`);
        setQuestions([]);
      } catch (error) {
        console.error('Failed to clear questions:', error);
        setError('Failed to clear questions');
      }
    }
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
              // Add safety check for classData
              if (!classData || !classData._id) return null;
              
              return (
                <div key={classData._id} className="class-card">
                  <h3>{classData.subjectName || 'Unnamed Subject'}</h3>
                  <p><strong>Instructor:</strong> {classData.instructorName || 'Unknown'}</p>
                  <p><strong>Access Code:</strong> <span className="access-code">{classData.accessCode || 'N/A'}</span></p>
                  <p><strong>Duration:</strong> {classData.duration || 0} minutes</p>
                  <p><strong>Status:</strong> {new Date() > new Date(classData.endTime) ? 'Ended' : 'Active'}</p>
                  <button 
                    onClick={() => handleJoinClass(classData)}
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

      {activeClass && (
        <div className="questions-board">
          <div className="board-header">
            <div>
              <h3>Questions for {activeClass.subjectName || 'Unknown Subject'}</h3>
              <p>Access Code: <span className="access-code">{activeClass.accessCode || 'N/A'}</span></p>
            </div>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <QuestionFilter filter={filter} onFilterChange={setFilter} />
              <button onClick={handleClearBoard} className="btn btn-danger">
                Clear Board
              </button>
            </div>
          </div>

          <div className="sticky-notes-container">
            {questions.length === 0 ? (
              <div className="empty-state">
                <h3>No questions yet</h3>
                <p>Questions will appear here when students post them.</p>
              </div>
            ) : (
        questions.map((question, index) => {
  console.log(`Question ${index}:`, question); // Debug log
  
  if (!question) {
    console.error(`Question at index ${index} is undefined`);
    return null;
  }
  
  return (
    <StickyNote
      key={question._id || `question-${index}`}
      question={question}
      isInstructor={true}
      onStatusChange={handleQuestionStatusChange}
    />
  );
})
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;