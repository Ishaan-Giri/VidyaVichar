import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import StickyNote from './StickyNote';
import QuestionFilter from './QuestionFilter';
import { useAuth } from '../context/AuthContext';

const ClassView = () => {
  const { classId } = useParams();
  const [classData, setClassData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isClassActive, setIsClassActive] = useState(false);

  const fetchClassDetails = useCallback(async () => {
    try {
      const response = await api.get(`/classes/${classId}`);
      setClassData(response.data);
      setIsClassActive(new Date() < new Date(response.data.endTime));
    } catch (error) {
      console.error('Failed to fetch class details:', error);
      setError('Failed to fetch class details. It may not exist.');
      setLoading(false);
    }
  }, [classId]);

  const fetchQuestions = useCallback(async () => {
    if (!classId) return;
    
    try {
      const response = await api.get(`/questions/for-class/${classId}?status=${filter}`);
      const questionsData = Array.isArray(response.data) ? response.data.filter(q => q && q._id) : [];
      setQuestions(questionsData);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestions([]);
      setError('Failed to fetch questions.');
    } finally {
      setLoading(false);
    }
  }, [classId, filter]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchClassDetails();
  }, [user, navigate, fetchClassDetails]);

  useEffect(() => {
    if (classData) {
      fetchQuestions();
      if (isClassActive) {
        const interval = setInterval(fetchQuestions, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [classData, filter, fetchQuestions, isClassActive]);

  const handleEndClass = async () => {
    if (window.confirm('Are you sure you want to end this class? This cannot be undone.')) {
      try {
        await api.patch(`/classes/${classId}/end`);
        setIsClassActive(false);
        fetchClassDetails();
      } catch (error) {
        console.error('Failed to end class:', error);
        setError(error.response?.data?.message || 'Failed to end class.');
      }
    }
  };

  const handleQuestionStatusChange = async (questionId, newStatus) => {
    if (!questionId || !newStatus) return;
    
    try {
      await api.patch(`/questions/${questionId}/status`, { status: newStatus });
      fetchQuestions();
    } catch (error) {
      console.error('Failed to update question status:', error);
      setError('Failed to update question status');
    }
  };

  const handleClearBoard = async () => {
    if (!classId) return;
    
    if (window.confirm('Are you sure you want to clear all questions from the board? This will archive them.')) {
      try {
        await api.delete(`/questions/class/${classId}/clear`);
        fetchQuestions();
      } catch (error) {
        console.error('Failed to clear questions:', error);
        setError('Failed to clear questions');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading class...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <button onClick={() => navigate('/instructor-dashboard')} className="btn">
          &larr; Back to Dashboard
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {classData && (
        <div className="questions-board">
          <div className="board-header">
            <div>
              <h3>Questions for {classData.subjectName}</h3>
              <p>Access Code: <span className="access-code">{classData.accessCode}</span></p>
            </div>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <QuestionFilter filter={filter} onFilterChange={setFilter} />
              {isClassActive && (
                <button onClick={handleEndClass} className="btn btn-warning">
                  End Class
                </button>
              )}
              <button onClick={handleClearBoard} className="btn btn-danger">
                Clear Board
              </button>
            </div>
          </div>

          <div className="sticky-notes-container">
            {questions.length === 0 ? (
              <div className="empty-state">
                <h3>No questions found</h3>
                <p>Questions from your students will appear here.</p>
              </div>
            ) : (
              questions.map((question) => (
                <StickyNote
                  key={question._id}
                  question={question}
                  isInstructor={true}
                  onStatusChange={handleQuestionStatusChange}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassView;
