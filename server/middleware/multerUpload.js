const multer = require('multer');
const { AppError } = require('./errorHandler');
const logger = require('../config/logger');

// Magic bytes for file type validation
// These are the actual binary signatures — extension alone is spoofable
const MAGIC_BYTES = {
  pdf: { bytes: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf' }, // %PDF
  jpeg: { bytes: [0xff, 0xd8, 0xff], mime: 'image/jpeg' },
  png: { bytes: [0x89, 0x50, 0x4e, 0x47], mime: 'image/png' },
};

/**
 * Validate file magic bytes against expected type
 * @param {Buffer} buffer - File buffer
 * @param {string} type - 'pdf' | 'jpeg' | 'png'
 */
const validateMagicBytes = (buffer, type) => {
  const magic = MAGIC_BYTES[type];
  if (!magic) return false;
  return magic.bytes.every((byte, index) => buffer[index] === byte);
};

/**
 * Multer file filter — checks MIME type AND magic bytes
 */
const fileFilter = (allowedTypes) => (req, file, cb) => {
  const mimeToType = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/png': 'png',
  };

  const detectedType = mimeToType[file.mimetype];

  if (!detectedType || !allowedTypes.includes(detectedType)) {
    logger.warn(`Rejected file upload: invalid MIME type ${file.mimetype} from ${req.ip}`);
    return cb(new AppError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`, 400), false);
  }

  cb(null, true);
};

// Memory storage — we validate the buffer before uploading to Cloudinary
const memoryStorage = multer.memoryStorage();

// PDF upload config (25MB max)
const pdfUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: fileFilter(['pdf']),
});

// Image upload config (5MB max)
const imageUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: fileFilter(['jpeg', 'png']),
});

// Combined upload for book creation (cover image + pdf)
const bookUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 30 * 1024 * 1024, files: 2 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new AppError('Invalid file type', 400), false);
    }
    cb(null, true);
  },
});

/**
 * Post-upload magic byte validation middleware
 * Must be used AFTER multer processes the files
 */
const validateUploadedFiles = (req, res, next) => {
  try {
    if (req.files?.pdf?.[0]) {
      const pdfBuffer = req.files.pdf[0].buffer;
      if (!validateMagicBytes(pdfBuffer, 'pdf')) {
        logger.warn(`Magic byte validation failed for PDF upload from ${req.ip}`);
        return next(new AppError('Invalid PDF file — content does not match declared type', 400));
      }
    }

    if (req.files?.coverImage?.[0]) {
      const imgBuffer = req.files.coverImage[0].buffer;
      const isJpeg = validateMagicBytes(imgBuffer, 'jpeg');
      const isPng = validateMagicBytes(imgBuffer, 'png');
      if (!isJpeg && !isPng) {
        logger.warn(`Magic byte validation failed for image upload from ${req.ip}`);
        return next(new AppError('Invalid image file — content does not match declared type', 400));
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { pdfUpload, imageUpload, bookUpload, validateUploadedFiles };
