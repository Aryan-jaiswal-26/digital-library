const { v2: cloudinaryClient } = require('cloudinary');
const logger = require('./logger');

const cloudinary = cloudinaryClient;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from Multer memory storage
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        logger.error('Cloudinary upload error:', error);
        reject(error);
      } else {
        resolve(result);
      }
    });
    stream.end(buffer);
  });
};

/**
 * Generate a short-lived signed URL for a Cloudinary resource
 * @param {string} publicId - The Cloudinary public_id of the resource
 * @param {number} expiresInSeconds - URL expiry duration in seconds (default: 600 = 10 min)
 * @returns {string} Signed URL
 */
const generateSignedUrl = (publicId, expiresInSeconds = 600) => {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return cloudinary.utils.private_download_url(publicId, 'pdf', {
    resource_type: 'raw',
    expires_at: expiresAt,
    attachment: false,
  });
};

/**
 * Delete a resource from Cloudinary
 * @param {string} publicId - The Cloudinary public_id
 * @param {string} resourceType - 'image' | 'raw' (for PDFs)
 */
const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    logger.info(`Cloudinary delete: ${publicId} — result: ${result.result}`);
    return result;
  } catch (err) {
    logger.error('Cloudinary delete error:', err);
    throw err;
  }
};

module.exports = { cloudinary, uploadToCloudinary, generateSignedUrl, deleteFromCloudinary };
