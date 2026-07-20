const Review = require('../models/Review');
const Book = require('../models/Book');
const { AppError } = require('../middleware/errorHandler');

// ─── Get Reviews for a Book ───────────────────────────────────────────────────
const getBookReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ book: req.params.bookId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ book: req.params.bookId }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Create or Update Review ──────────────────────────────────────────────────
const upsertReview = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.validatedBody;

    const book = await Book.findOne({ _id: bookId, isDeleted: false, isApproved: true });
    if (!book) return next(new AppError('Book not found', 404));

    // Check if user already reviewed this book
    const existing = await Review.findOne({ book: bookId, user: req.user._id });

    let review;
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.isEdited = true;
      review = await existing.save();
    } else {
      review = await Review.create({ book: bookId, user: req.user._id, rating, comment });
    }

    await review.populate('user', 'name avatar');
    res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? 'Review updated' : 'Review submitted',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Review ────────────────────────────────────────────────────────────
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return next(new AppError('Review not found', 404));

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return next(new AppError('Not authorized', 403));

    await review.findOneAndDelete({ _id: review._id });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBookReviews, upsertReview, deleteReview };
