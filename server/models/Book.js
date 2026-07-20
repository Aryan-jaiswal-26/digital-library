const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'General Knowledge', 'Reference'],
        message: 'Invalid category',
      },
      required: [true, 'Category is required'],
    },
    branch: {
      type: String,
      default: 'Computer Engineering',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    // Cloudinary public_id — used server-side to generate signed URLs on demand
    // Never expose this raw to the client
    coverImagePublicId: {
      type: String,
      required: true,
    },
    coverImageUrl: {
      type: String,
      required: true,
    },
    // Cloudinary public_id for the PDF — used to generate signed, expiring URLs
    pdfPublicId: {
      type: String,
      required: true,
      select: false, // never sent to client — only used server-side to generate signed URLs
    },
    fileSize: {
      type: String,
    },
    totalPages: {
      type: Number,
      min: 1,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Admin must approve before it's publicly visible
    isApproved: {
      type: Boolean,
      default: false,
    },
    // Soft delete — don't hard-delete content with reviews/history attached
    isDeleted: {
      type: Boolean,
      default: false,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    downloadsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isbn: {
      type: String,
      trim: true,
    },
    publishedYear: {
      type: Number,
      min: 1000,
      max: new Date().getFullYear() + 1,
    },
    language: {
      type: String,
      default: 'English',
    },
    resourceType: {
      type: String,
      enum: ['Textbook', 'Lecture Notes', 'Reference Manual', 'Exam Paper', 'Novel', 'Other'],
      default: 'Textbook',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.pdfPublicId; // never expose the cloudinary public_id
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound text index for free-tier MongoDB native search
bookSchema.index({ title: 'text', author: 'text', subject: 'text', tags: 'text', description: 'text' });

// Regular indexes for filter queries
bookSchema.index({ category: 1, isApproved: 1, isDeleted: 1 });
bookSchema.index({ uploadedBy: 1 });
bookSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Book', bookSchema);
