import React from 'react';

const StickyNote = ({ question, isInstructor, onStatusChange }) => {
  // Early return with error handling
  if (!question) {
    return (
      <div className="sticky-note" style={{ backgroundColor: '#FFE135', padding: '1rem' }}>
        <div>Error: No question data</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleStatusChange = (newStatus) => {
    if (onStatusChange && question._id) {
      onStatusChange(question._id, newStatus);
    }
  };

  return (
    <div 
      className="sticky-note" 
      style={{ backgroundColor: question.color || '#FFE135' }}
    >
      {isInstructor && (
        <div className="question-actions">
          <button
            className="action-btn answered-btn"
            onClick={() => handleStatusChange('answered')}
            title="Mark as Answered"
          >
            ✓
          </button>
          <button
            className="action-btn important-btn"
            onClick={() => handleStatusChange('important')}
            title="Mark as Important"
          >
            !
          </button>
        </div>
      )}
      
      <div className="question-text">
        {question.text || 'No question text'}
      </div>
      
      <div className="question-meta">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>By: {question.author || 'Anonymous'}</span>
          <span className={`status-badge status-${question.status || 'unanswered'}`}>
            {question.status || 'unanswered'}
          </span>
        </div>
        <div style={{marginTop: '0.25rem', fontSize: '0.75rem'}}>
          {formatDate(question.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default StickyNote;