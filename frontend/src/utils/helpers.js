export const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const getTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const timeDiff = end - now;
  
  if (timeDiff <= 0) return 'Class has ended';
  
  const minutes = Math.floor(timeDiff / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
  return `${minutes}m ${seconds}s remaining`;
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateAccessCode = (code) => {
  return /^[A-Z0-9]{6}$/.test(code);
};