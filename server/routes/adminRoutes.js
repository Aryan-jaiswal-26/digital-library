const express = require('express');
const router = express.Router();
const {
  getUsers, updateUserRole, toggleUserStatus, getPendingBooks, approveBook, getAnalytics,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All admin routes require admin role
router.use(protect, restrictTo('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/books/pending', getPendingBooks);
router.patch('/books/:id/approve', approveBook);

module.exports = router;
