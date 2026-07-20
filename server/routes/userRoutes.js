const express = require('express');
const router = express.Router();
const {
  toggleFavorite, updateProgress, addBookmark, getDashboard, getProfile, updateProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate, progressSchema } = require('../middleware/validate');

// All user routes require auth
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/favorites/:bookId', toggleFavorite);
router.put('/progress/:bookId', validate(progressSchema), updateProgress);
router.post('/bookmarks/:bookId', addBookmark);

module.exports = router;
