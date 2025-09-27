import React, { useState } from 'react';
import { api } from '../utils/api';

const CreateClass = ({ onClassCreated }) => {
  const [formData, setFormData] = useState({
    subjectName: '',
    instructorName: '',
    duration: 60
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

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

    if (!formData.subjectName || !formData.instructorName) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.duration < 5 || formData.duration > 480) {
      setError('Duration must be between 5 and 480 minutes');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/classes/create', formData);
      onClassCreated(response.data);
      setFormData({ subjectName: '', instructorName: '', duration: 60 });
      setShowForm(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="class-creation">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h3>Create New Class</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Create Class'}
        </button>
      </div>

      {showForm && (
        <>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="class-form">
              <div className="form-group">
                <label htmlFor="subjectName">Subject Name</label>
                <input
                  type="text"
                  id="subjectName"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleInputChange}
                  placeholder="e.g., Software Engineering"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="instructorName">Instructor Name</label>
                <input
                  type="text"
                  id="instructorName"
                  name="instructorName"
                  value={formData.instructorName}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="5"
                  max="480"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CreateClass;