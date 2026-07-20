const { z } = require('zod');

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * Returns 400 with formatted validation errors on failure.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.validatedBody = result.data; // Attach sanitized data, not raw req.body
  next();
};

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email format').lowercase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['student', 'faculty']).optional().default('student'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format').lowercase().trim(),
  password: z.string().min(1, 'Password is required'),
});

// ─── Book Schemas ─────────────────────────────────────────────────────────────

const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  author: z.string().min(1, 'Author is required').max(100).trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year', 'General Knowledge', 'Reference']),
  branch: z.string().optional().default('Computer Engineering'),
  subject: z.string().min(1, 'Subject is required').trim(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (typeof val === 'string') return val.split(',').map((t) => t.trim().toLowerCase());
      return val.map((t) => t.toLowerCase());
    }),
  totalPages: z.coerce.number().int().positive().optional(),
  isbn: z.string().optional(),
  publishedYear: z.coerce.number().int().min(1000).max(new Date().getFullYear() + 1).optional(),
  language: z.string().optional().default('English'),
  resourceType: z
    .enum(['Textbook', 'Lecture Notes', 'Reference Manual', 'Exam Paper', 'Novel', 'Other'])
    .optional()
    .default('Textbook'),
});

// ─── Review Schemas ───────────────────────────────────────────────────────────

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(5, 'Comment must be at least 5 characters').max(1000).trim(),
});

// ─── Progress Schema ──────────────────────────────────────────────────────────

const progressSchema = z.object({
  lastPageRead: z.coerce.number().int().positive(),
  totalPages: z.coerce.number().int().positive(),
  timeSpentMinutes: z.coerce.number().nonnegative().optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createBookSchema,
  reviewSchema,
  progressSchema,
};
