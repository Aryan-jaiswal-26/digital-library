const express = require('express');
const router = express.Router();
const {
  getBooks, getBook, getReadUrl, createBook, updateBook, deleteBook,
} = require('../controllers/bookController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { bookUpload, validateUploadedFiles } = require('../middleware/multerUpload');
const { validate, createBookSchema } = require('../middleware/validate');

// Public routes
router.get('/', getBooks);
router.get('/:id', getBook);

// Authenticated routes
router.get('/:id/read-url', protect, getReadUrl);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

// Faculty + Admin upload
router.post(
  '/',
  protect,
  restrictTo('faculty', 'admin'),
  uploadLimiter,
  bookUpload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]),
  validateUploadedFiles,
  validate(createBookSchema),
  createBook
);

module.exports = router;
