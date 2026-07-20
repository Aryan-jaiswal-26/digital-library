const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    lastPageRead: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalPages: {
      type: Number,
      default: 1,
      min: 1,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    timeSpentMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookmarks: [
      {
        page: {
          type: Number,
          required: true,
        },
        note: {
          type: String,
          maxlength: 500,
          default: '',
        },
        label: {
          type: String,
          maxlength: 100,
          default: '',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound unique index — one progress document per user/book pair
readingProgressSchema.index({ user: 1, book: 1 }, { unique: true });

// Auto-calculate completion percentage before save
readingProgressSchema.pre('save', function (next) {
  if (this.totalPages > 0) {
    this.completionPercentage = Math.round((this.lastPageRead / this.totalPages) * 100);
    this.isCompleted = this.completionPercentage >= 100;
  }
  next();
});

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);
