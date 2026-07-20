const User = require('../models/User');
const Book = require('../models/Book');
const Review = require('../models/Review');
const ReadingProgress = require('../models/ReadingProgress');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// ─── Get All Users ────────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.name = new RegExp(search, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, data: users, pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    next(err);
  }
};

// ─── Update User Role ─────────────────────────────────────────────────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return next(new AppError('Invalid role', 400));
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return next(new AppError('User not found', 404));

    logger.info(`Admin ${req.user._id} changed role of user ${user._id} to ${role}`);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ─── Deactivate User ──────────────────────────────────────────────────────────
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (err) {
    next(err);
  }
};

// ─── Get Pending Books ────────────────────────────────────────────────────────
const getPendingBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ isApproved: false, isDeleted: false })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: books, count: books.length });
  } catch (err) {
    next(err);
  }
};

// ─── Approve / Reject Book ────────────────────────────────────────────────────
const approveBook = async (req, res, next) => {
  try {
    const { approved } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return next(new AppError('Book not found', 404));

    if (approved === false) {
      book.isDeleted = true; // Reject = soft delete
    } else {
      book.isApproved = true;
    }

    await book.save();
    logger.info(`Admin ${req.user._id} ${approved ? 'approved' : 'rejected'} book ${book._id}`);
    res.json({ success: true, message: `Book ${approved ? 'approved' : 'rejected'}`, data: book });
  } catch (err) {
    next(err);
  }
};

// ─── Analytics ────────────────────────────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBooks,
      totalReviews,
      topBooks,
      categoryDistribution,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Book.countDocuments({ isApproved: true, isDeleted: false }),
      Review.countDocuments(),
      Book.find({ isApproved: true, isDeleted: false })
        .sort({ viewsCount: -1 })
        .limit(5)
        .select('title viewsCount downloadsCount averageRating'),
      Book.aggregate([
        { $match: { isApproved: true, isDeleted: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
    ]);

    res.json({
      success: true,
      data: {
        overview: { totalUsers, totalBooks, totalReviews },
        topBooks,
        categoryDistribution,
        recentUsers,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, updateUserRole, toggleUserStatus, getPendingBooks, approveBook, getAnalytics };
