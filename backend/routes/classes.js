const express = require('express');
const {
  createClass,
  getMyClasses,
  joinClass,
  getClassById
} = require('../controllers/classController');
const auth = require('../middleware/auth');

const router = express.Router();


router.post('/create', auth, createClass);
router.get('/my-classes', auth, getMyClasses);
router.post('/join', joinClass);
router.get('/:id', getClassById);
// router.delete('/:id', auth, deleteClass);

module.exports = router;   