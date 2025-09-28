import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import StickyNote from './StickyNote';

const StudentDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isPast, setIsPast] = useState(false);

  const updateTimer = useCallback(() => {
    if (!classData || isPast) return;
    
    const now = new Date();
    const endTime = new Date(classData.endTime);
    const timeDiff = endTime - now;
    
    if (timeDiff <= 0) {
      setTimeLeft('Class has ended');
      setIsPast(true); // Mark class as ended
      return;
    }
    
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    setTimeLeft(`${minutes}m ${seconds}s remaining`);
  }, [classData, isPast]);

  const fetchQuestions = useCallback(async () => {
    if (!classData) return;
    
    try {
      const response = await api.get(`/questions/class/${classData.classId}`);
      const data = response.data;
      setQuestions(data?.questions || []);
      
      if (data?.isPast) {
        setIsPast(true);
      }
      
      if (data?.analytics) {
        setClassData(prev => ({ ...prev, analytics: data.analytics }));
      }
    } catch (error) {
      console.error('Failed to fetch questions');
    }
  }, [classData]);

  useEffect(() => {
    const data = location.state?.classData;
    if (!data) {
      navigate('/');
      return;
    }
    setClassData(data);
    setIsPast(data.isPast || new Date() > new Date(data.endTime));
  }, [location, navigate]);

  useEffect(() => {
    if (classData) {
      fetchQuestions();
      
      // Set up polling for questions
      const questionsInterval = setInterval(fetchQuestions, 3000);
      
      // Set up timer only if class is not in the past
      if (!isPast) {
        const timerInterval = setInterval(updateTimer, 1000);
        return () => {
          clearInterval(questionsInterval);
          clearInterval(timerInterval);
        };
      }
    }
  }, [classData, fetchQuestions, updateTimer, isPast]);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) {
      setError('Please enter a question');
      return;
    }
    
    if (newQuestion.length > 500) {
      setError('Question is too long (max 500 characters)');
      return;
    }

    try {
      await api.post('/questions/post', {
        text: newQuestion.trim(),
        classId: classData.classId,
        author: studentName.trim() || 'Anonymous Student'
      });
      
      setNewQuestion('');
      setStudentName(''); // Clear the name field
      setSuccess('Question posted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchQuestions();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to post question');
    }
  };

  const handleLeaveClass = () => {
    navigate('/');
  };

  if (!classData) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">{classData.subjectName}</h2>
          <p>Instructor: {classData.instructorName}</p>
          <p className={isPast ? 'error-message' : 'success-message'}>
            {isPast ? 'Class has ended' : timeLeft}
          </p>
        </div>
        <button onClick={handleLeaveClass} className="logout-btn">
          Leave Class
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {isPast ? (
        <div className="class-analytics">
          <h3>Class Analytics</h3>
          {classData.analytics ? (
            <div className="analytics-grid">
              <div className="analytic-item">
                <span>{classData.analytics.totalQuestions}</span>
                <p>Total Questions</p>
              </div>
              <div className="analytic-item">
                <span>{classData.analytics.answered}</span>
                <p>Answered</p>
              </div>
              <div className="analytic-item">
                <span>{classData.analytics.unanswered}</span>
                <p>Unanswered</p>
              </div>
              <div className="analytic-item">
                <span>{classData.analytics.important}</span>
                <p>Marked Important</p>
              </div>
            </div>
          ) : (
            <p>Analytics for this class are not available.</p>
          )}
          <div className="error-message" style={{marginTop: '1rem'}}>
            This class session has ended. You can no longer post questions.
          </div>
        </div>
      ) : (
        <div className="question-form">
          <h3>Ask a Question</h3>
          <form onSubmit={handleSubmitQuestion}>
            <div className="form-group">
              <label htmlFor="studentName">Your Name (optional)</label>
              <input
                type="text"
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name or leave blank for anonymous"
                maxLength={50}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="question">Your Question</label>
                <textarea
                  id="question"
                  className="question-input"
                  value={newQuestion}
                  onChange={(e) => {
                    setNewQuestion(e.target.value);
                    setError('');
                  }}
                  placeholder="Type your question here..."
                  maxLength={500}
                  required
                />
                <small style={{color: '#666'}}>
                  {newQuestion.length}/500 characters
                </small>
              </div>
              <button type="submit" className="btn btn-primary">
                Post Question
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="questions-board">
        <div className="board-header">
          <h3>All Questions ({questions.length})</h3>
        </div>
        
        <div className="sticky-notes-container">
          {questions.length === 0 ? (
            <div className="empty-state">
              <h3>No questions posted yet</h3>
              <p>Be the first to ask a question!</p>
            </div>
          ) : (
            questions.map((question) => (
              <StickyNote
                key={question._id}
                question={question}
                isInstructor={false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;