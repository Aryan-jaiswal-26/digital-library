const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// One review per user per book — enforced at schema level
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// After saving a review, recalculate the book's averageRating and reviewsCount
reviewSchema.post('save', async function () {
  const Book = require('./Book');
  const result = await mongoose.model('Review').aggregate([
    { $match: { book: this.book } },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Book.findByIdAndUpdate(this.book, {
      averageRating: Math.round(result[0].avgRating * 10) / 10,
      reviewsCount: result[0].count,
    });
  }
});

// Also recalculate on delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return;
  const Book = require('./Book');
  const result = await mongoose.model('Review').aggregate([
    { $match: { book: doc.book } },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Book.findByIdAndUpdate(doc.book, {
      averageRating: Math.round(result[0].avgRating * 10) / 10,
      reviewsCount: result[0].count,
    });
  } else {
    await Book.findByIdAndUpdate(doc.book, { averageRating: 0, reviewsCount: 0 });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
