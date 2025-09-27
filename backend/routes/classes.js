const express = require('express');
const {
  createClass,
  getClasses,
  joinClass,
  getClass,
  deleteClass
} = require('../controllers/classController');
const auth = require('../middleware/auth');

const router = express.Router();


router.post('/create', auth, createClass);
router.get('/', auth, getClasses);
router.post('/join', joinClass);
router.get('/:id', getClass);
router.delete('/:id', auth, deleteClass);

module.exports = router;   