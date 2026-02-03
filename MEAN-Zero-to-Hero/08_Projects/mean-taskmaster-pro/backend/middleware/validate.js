/**
 * ============================================
 * CONCEPT: Input Validation Middleware
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Validate and sanitize user input before processing
 *
 * ⚙️ HOW: express-validator provides:
 *   - Validation chains: check('email').isEmail()
 *   - Sanitization: trim(), escape(), normalizeEmail()
 *   - Custom validators: check(...).custom(fn)
 *   - Error accumulation: validationResult(req)
 *
 * 🤔 WHY validate on server?
 *   - Client validation can be bypassed
 *   - Attacker can send direct HTTP requests
 *   - Prevents injection attacks
 *   - Data consistency
 *
 * ⚠️ COMMON MISTAKES:
 *   - Only validating on frontend (easily bypassed!)
 *   - Not sanitizing input (XSS, injection)
 *   - Unclear error messages
 *   - Not validating all fields
 *
 * 💡 INTERVIEW TIP: "How do you prevent injection attacks?"
 *   → Validate: Is the input the right type/format?
 *   → Sanitize: Remove/escape dangerous characters
 *   → Parameterized queries (for SQL)
 *   → Mongoose handles MongoDB injection
 * ============================================
 */

const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * ============================================
 * Validation Result Handler
 * ============================================
 *
 * 📚 WHAT: Middleware to check if validation passed
 *
 * ⚙️ HOW: Called after validation chains
 *   → Collects all validation errors
 *   → Returns 400 if errors exist
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Format errors nicely
        const formattedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
            value: err.value,
        }));

        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: formattedErrors,
        });
    }

    next();
};

/**
 * ============================================
 * AUTH VALIDATION SCHEMAS
 * ============================================
 */

/**
 * Register validation
 */
const validateRegister = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be 2-50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(), // Sanitize: lowercase, remove dots from gmail

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage(
            'Password must contain uppercase, lowercase, number, and special character'
        ),

    body('confirmPassword')
        .notEmpty()
        .withMessage('Please confirm your password')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),

    handleValidation,
];

/**
 * Login validation
 */
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password').notEmpty().withMessage('Password is required'),

    handleValidation,
];

/**
 * ============================================
 * TASK VALIDATION SCHEMAS
 * ============================================
 */

/**
 * Create task validation
 */
const validateCreateTask = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be 3-100 characters')
        .escape(), // Sanitize: escape HTML entities

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters')
        .escape(),

    body('status')
        .optional()
        .isIn(['todo', 'in-progress', 'completed', 'archived'])
        .withMessage('Invalid status value'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority value'),

    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format')
        .toDate() // Convert to Date object
        .custom((value) => {
            if (value && value < new Date()) {
                throw new Error('Due date must be in the future');
            }
            return true;
        }),

    body('tags')
        .optional()
        .isArray({ max: 5 })
        .withMessage('Maximum 5 tags allowed'),

    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Each tag must be 1-20 characters'),

    handleValidation,
];

/**
 * Update task validation (similar but all optional)
 */
const validateUpdateTask = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be 3-100 characters')
        .escape(),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters')
        .escape(),

    body('status')
        .optional()
        .isIn(['todo', 'in-progress', 'completed', 'archived'])
        .withMessage('Invalid status value'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority value'),

    handleValidation,
];

/**
 * ============================================
 * PARAM VALIDATION
 * ============================================
 */

/**
 * Validate MongoDB ObjectId in URL params
 */
const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName} format`),
    handleValidation,
];

/**
 * ============================================
 * QUERY VALIDATION
 * ============================================
 */

/**
 * Validate pagination query params
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer')
        .toInt(),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be 1-100')
        .toInt(),

    query('sort')
        .optional()
        .isIn(['createdAt', '-createdAt', 'dueDate', '-dueDate', 'priority', '-priority'])
        .withMessage('Invalid sort field'),

    handleValidation,
];

module.exports = {
    handleValidation,
    validateRegister,
    validateLogin,
    validateCreateTask,
    validateUpdateTask,
    validateObjectId,
    validatePagination,
};

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. ALWAYS validate server-side (client can be bypassed)
 * 2. Use validation chains for type/format checking
 * 3. Sanitize input to prevent XSS/injection
 * 4. Return clear, field-specific error messages
 * 5. Validate all input: body, params, query
 * 6. Custom validators for complex rules
 *
 * ============================================
 * 📚 NEXT: Check out ./routes/auth.routes.js for API routes
 * ============================================
 */
