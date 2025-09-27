export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    ME: '/auth/me'
  },
  CLASSES: {
    CREATE: '/classes',
    MY_CLASSES: '/classes',
    JOIN: '/classes/join',
    GET_CLASS: '/classes'
  },
  QUESTIONS: {
    POST: '/questions',
    GET_BY_CLASS: '/questions/class',
    UPDATE: '/questions',
    CLEAR: '/questions/class'
  }
};


export const STICKY_NOTE_COLORS = [
  '#FFE135', '#FF6B6B', '#4ECDC4', '#45B7D1', 
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
];