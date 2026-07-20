const Book = require('../models/Book');
const { AppError } = require('../middleware/errorHandler');
const { uploadToCloudinary, generateSignedUrl, deleteFromCloudinary } = require('../config/cloudinary');
const logger = require('../config/logger');

// ─── Get All Books (with search, filters, pagination) ────────────────────────
const getBooks = async (req, res, next) => {
  try {
    const { q, category, branch, subject, resourceType, sort, page = 1, limit = 12 } = req.query;

    const filter = { isDeleted: false, isApproved: true };

    // Full-text search using MongoDB native text index
    if (q) {
      filter.$text = { $search: q };
    }

    if (category) filter.category = category;
    if (branch) filter.branch = branch;
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (resourceType) filter.resourceType = resourceType;

    // Sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      rating: { averageRating: -1 },
      views: { viewsCount: -1 },
      title: { title: 1 },
      ...(q ? { relevance: { score: { $meta: 'textScore' } } } : {}),
    };
    const selectedSort = sortOptions[sort] || (q ? sortOptions.relevance : sortOptions.newest);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 50); // cap at 50

    const [books, total] = await Promise.all([
      Book.find(filter, q ? { score: { $meta: 'textScore' } } : {})
        .sort(selectedSort)
        .skip(skip)
        .limit(limitNum)
        .populate('uploadedBy', 'name avatar'),
      Book.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: books,
      pagination: {
        total,
        page: parseInt(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Book ─────────────────────────────────────────────────────────
const getBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      isDeleted: false,
      isApproved: true,
    }).populate('uploadedBy', 'name avatar');

    if (!book) return next(new AppError('Book not found', 404));

    // Atomic increment — no read-then-write race condition
    await Book.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });

    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// ─── Get Signed PDF URL ───────────────────────────────────────────────────────
const getReadUrl = async (req, res, next) => {
  try {
    // Re-fetch with pdfPublicId (normally select:false)
    const book = await Book.findOne({
      _id: req.params.id,
      isDeleted: false,
      isApproved: true,
    }).select('+pdfPublicId');

    if (!book) return next(new AppError('Book not found', 404));

    // Generate short-lived signed URL (10 minutes)
    const signedUrl = generateSignedUrl(book.pdfPublicId, 600);

    logger.info(`Signed URL generated for book ${book._id} by user ${req.user._id}`);

    res.json({
      success: true,
      data: { signedUrl, expiresIn: 600, title: book.title, totalPages: book.totalPages },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Create Book ──────────────────────────────────────────────────────────────
const createBook = async (req, res, next) => {
  try {
    if (!req.files?.pdf?.[0] || !req.files?.coverImage?.[0]) {
      return next(new AppError('Both PDF and cover image are required', 400));
    }

    const { pdf: [pdfFile], coverImage: [imageFile] } = req.files;
    const data = req.validatedBody;

    // Upload PDF to Cloudinary under raw resource type
    const pdfUpload = await uploadToCloudinary(pdfFile.buffer, {
      folder: 'digital-library/pdfs',
      resource_type: 'raw',
      format: 'pdf',
      public_id: `${Date.now()}-${data.title.replace(/\s+/g, '-').toLowerCase()}`,
    });

    // Upload cover image
    const imgUpload = await uploadToCloudinary(imageFile.buffer, {
      folder: 'digital-library/covers',
      resource_type: 'image',
      transformation: [{ width: 400, height: 600, crop: 'fill', quality: 'auto' }],
    });

    const book = await Book.create({
      ...data,
      pdfPublicId: pdfUpload.public_id,
      coverImagePublicId: imgUpload.public_id,
      coverImageUrl: imgUpload.secure_url,
      fileSize: `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedBy: req.user._id,
    });

    logger.info(`Book created: "${book.title}" by user ${req.user._id}`);
    res.status(201).json({ success: true, message: 'Book uploaded and pending approval', data: book });
  } catch (err) {
    next(err);
  }
};

// ─── Update Book ──────────────────────────────────────────────────────────────
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || book.isDeleted) return next(new AppError('Book not found', 404));

    // Server-side ownership check — not just hidden in UI
    const isOwner = book.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return next(new AppError('Not authorized to update this book', 403));

    const allowedFields = ['title', 'author', 'description', 'category', 'branch', 'subject', 'tags',
      'totalPages', 'isbn', 'publishedYear', 'language', 'resourceType'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) book[field] = req.body[field];
    });

    await book.save();
    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

// ─── Soft Delete Book ─────────────────────────────────────────────────────────
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || book.isDeleted) return next(new AppError('Book not found', 404));

    const isOwner = book.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return next(new AppError('Not authorized to delete this book', 403));

    // Soft delete — preserve associated reviews and reading history
    book.isDeleted = true;
    await book.save();

    logger.info(`Book soft-deleted: ${book._id} by user ${req.user._id}`);
    res.json({ success: true, message: 'Book removed from library' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBooks, getBook, getReadUrl, createBook, updateBook, deleteBook };
