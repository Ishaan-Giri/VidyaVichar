import React from 'react';

const QuestionFilter = ({ filter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'All Questions' },
    { key: 'unanswered', label: 'Unanswered' },
    { key: 'answered', label: 'Answered' },
    { key: 'important', label: 'Important' }
  ];

  return (
    <div className="filter-buttons">
      {filters.map((filterOption) => (
        <button
          key={filterOption.key}
          className={`filter-btn ${filter === filterOption.key ? 'active' : ''}`}
          onClick={() => onFilterChange(filterOption.key)}
        >
          {filterOption.label}
        </button>
      ))}
    </div>
  );
};

export default QuestionFilter;