const User = require('../models/User');
const Book = require('../models/Book');
const ReadingProgress = require('../models/ReadingProgress');
const { AppError } = require('../middleware/errorHandler');

// ─── Toggle Favorite ──────────────────────────────────────────────────────────
const toggleFavorite = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.includes(bookId);

    if (isFavorite) {
      user.favorites.pull(bookId);
    } else {
      // Check book exists
      const book = await Book.findById(bookId);
      if (!book || book.isDeleted) return next(new AppError('Book not found', 404));
      user.favorites.push(bookId);
    }

    await user.save();
    res.json({
      success: true,
      isFavorite: !isFavorite,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
    });
  } catch (err) {
    next(err);
  }
};

// ─── Update Reading Progress ──────────────────────────────────────────────────
const updateProgress = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { lastPageRead, totalPages, timeSpentMinutes } = req.validatedBody;

    const progress = await ReadingProgress.findOneAndUpdate(
      { user: req.user._id, book: bookId },
      {
        lastPageRead,
        totalPages,
        $inc: { timeSpentMinutes: timeSpentMinutes || 0 },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};

// ─── Add Bookmark ─────────────────────────────────────────────────────────────
const addBookmark = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { page, note, label } = req.body;

    const progress = await ReadingProgress.findOneAndUpdate(
      { user: req.user._id, book: bookId },
      { $push: { bookmarks: { page, note, label } } },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: progress.bookmarks });
  } catch (err) {
    next(err);
  }
};

// ─── User Dashboard ───────────────────────────────────────────────────────────
// Uses $facet aggregation to get favorites, in-progress, and stats in one round trip
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Parallel queries for dashboard data
    const [favoriteBooks, inProgressBooks, statsResult] = await Promise.all([
      User.findById(userId)
        .populate({
          path: 'favorites',
          match: { isDeleted: false, isApproved: true },
          select: 'title author coverImageUrl category averageRating',
          options: { limit: 10 },
        })
        .select('favorites'),

      ReadingProgress.find({ user: userId, isCompleted: false })
        .populate({
          path: 'book',
          match: { isDeleted: false, isApproved: true },
          select: 'title author coverImageUrl totalPages',
        })
        .sort({ updatedAt: -1 })
        .limit(6),

      ReadingProgress.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalBooksStarted: { $sum: 1 },
            totalBooksCompleted: { $sum: { $cond: ['$isCompleted', 1, 0] } },
            totalPagesRead: { $sum: '$lastPageRead' },
            totalTimeMinutes: { $sum: '$timeSpentMinutes' },
          },
        },
      ]),
    ]);

    const stats = statsResult[0] || {
      totalBooksStarted: 0,
      totalBooksCompleted: 0,
      totalPagesRead: 0,
      totalTimeMinutes: 0,
    };

    res.json({
      success: true,
      data: {
        favorites: favoriteBooks.favorites || [],
        inProgress: inProgressBooks.filter((p) => p.book), // filter out deleted books
        stats,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get User Profile ─────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// ─── Update User Profile ──────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'avatar'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleFavorite, updateProgress, addBookmark, getDashboard, getProfile, updateProfile };
