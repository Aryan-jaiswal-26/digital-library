const express = require('express');
const router = express.Router();
const { getBookReviews, upsertReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validate, reviewSchema } = require('../middleware/validate');

router.get('/book/:bookId', getBookReviews);
router.post('/book/:bookId', protect, validate(reviewSchema), upsertReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
