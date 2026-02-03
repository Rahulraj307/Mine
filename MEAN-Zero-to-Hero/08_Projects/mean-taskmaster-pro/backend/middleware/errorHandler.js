/**
 * ============================================
 * CONCEPT: Centralized Error Handling
 * LEVEL: Intermediate → Advanced
 * ============================================
 *
 * 📚 WHAT: A single place to handle all errors in the application
 *
 * ⚙️ HOW: Express recognizes error handlers by 4 parameters:
 *   (err, req, res, next)
 *   
 *   Any middleware that calls next(error) or throws an error
 *   will skip to this handler.
 *
 * 🤔 WHY centralized error handling?
 *   - Consistent error response format
 *   - Single place for error logging
 *   - Don't repeat try/catch in every route
 *   - Hide sensitive error details in production
 *
 * ⚠️ COMMON MISTAKES:
 *   - Not placing error handler LAST in middleware chain
 *   - Returning detailed errors in production
 *   - Not handling async errors (use asyncHandler wrapper)
 *   - Forgetting to call next(error)
 *
 * 💡 INTERVIEW TIP: "How do you handle errors in Express?"
 *   → Wrap async handlers to catch rejected promises
 *   → Use next(error) to pass errors
 *   → Single error handler at the end
 *   → Log errors, send safe response to client
 * ============================================
 */

/**
 * ============================================
 * Custom Error Class
 * ============================================
 *
 * 📚 WHAT: Extends Error with HTTP status code
 *
 * 🤔 WHY: Built-in Error doesn't have statusCode
 *   → We need to know what HTTP status to return
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Known, expected errors

        // Capture stack trace (exclude constructor from stack)
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * ============================================
 * Async Handler Wrapper
 * ============================================
 *
 * 📚 WHAT: Wraps async route handlers to catch errors
 *
 * ⚙️ HOW: Returns a function that catches rejected promises
 *
 * BEFORE (manual try/catch in every route):
 *   router.get('/tasks', async (req, res, next) => {
 *     try {
 *       const tasks = await Task.find();
 *       res.json(tasks);
 *     } catch (error) {
 *       next(error);
 *     }
 *   });
 *
 * AFTER (with asyncHandler):
 *   router.get('/tasks', asyncHandler(async (req, res) => {
 *     const tasks = await Task.find();
 *     res.json(tasks);
 *   }));
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * ============================================
 * Error Response Formatter
 * ============================================
 */
const sendErrorDev = (err, res) => {
    /**
     * Development: Send full error details
     * Helps with debugging
     */
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        error: err.message,
        stack: err.stack,
        details: err,
    });
};

const sendErrorProd = (err, res) => {
    /**
     * Production: Send minimal, safe error
     * Never expose internal details!
     */
    if (err.isOperational) {
        // Known error - safe to send message
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            error: err.message,
        });
    } else {
        // Unknown error - send generic message
        console.error('💥 ERROR:', err);

        res.status(500).json({
            success: false,
            status: 'error',
            error: 'Something went wrong. Please try again later.',
        });
    }
};

/**
 * ============================================
 * Handle Specific Error Types
 * ============================================
 */

// MongoDB Invalid ObjectId
const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

// MongoDB Duplicate Key
const handleDuplicateFields = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists. Please use another value.`;
    return new AppError(message, 400);
};

// Mongoose Validation Error
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Validation failed: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// JWT Errors
const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
    return new AppError('Token expired. Please log in again.', 401);
};

/**
 * ============================================
 * MAIN ERROR HANDLER
 * ============================================
 *
 * ⚠️ MUST BE LAST in middleware chain!
 * ⚠️ MUST have 4 parameters for Express to recognize it!
 */
const errorHandler = (err, req, res, next) => {
    // Default values
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    /**
     * Log all errors (use proper logging in production)
     *
     * Format: [timestamp] METHOD /path - status - message
     */
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${err.statusCode} - ${err.message}`);

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        // Clone error (some errors are not enumerable)
        let error = { ...err };
        error.message = err.message;

        // Handle specific error types
        if (err.name === 'CastError') error = handleCastError(err);
        if (err.code === 11000) error = handleDuplicateFields(err);
        if (err.name === 'ValidationError') error = handleValidationError(err);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

module.exports = errorHandler;
module.exports.AppError = AppError;
module.exports.asyncHandler = asyncHandler;

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. Error handler MUST be last middleware
 * 2. MUST have 4 parameters (err, req, res, next)
 * 3. Use asyncHandler to catch async errors
 * 4. Custom AppError class for operational errors
 * 5. Different error responses for dev vs prod
 * 6. Handle specific error types (validation, duplicate, etc.)
 * 7. Never expose stack traces in production
 *
 * ============================================
 * 📚 NEXT: Check out ./middleware/validate.js for input validation
 * ============================================
 */
