/**
 * ============================================
 * CONCEPT: Authentication Middleware
 * LEVEL: Intermediate → Advanced
 * ============================================
 *
 * 📚 WHAT: Middleware that protects routes by verifying JWT
 *
 * ⚙️ HOW:
 *   1. Extract token from Authorization header
 *   2. Verify token signature and expiry
 *   3. Attach user to request object
 *   4. Call next() to proceed or throw error
 *
 * 🤔 WHY middleware?
 *   - DRY: Write once, use on any route
 *   - Separation of concerns
 *   - Easy to test independently
 *
 * ⚠️ COMMON MISTAKES:
 *   - Not checking if user still exists in DB
 *   - Not handling expired tokens gracefully
 *   - Blocking when token is missing vs invalid
 *
 * 💡 INTERVIEW TIP: "How do you protect API routes?"
 *   → Middleware extracts and verifies JWT
 *   → Valid token → attach user, call next()
 *   → Invalid/missing → 401 Unauthorized
 *   → Expired → client should refresh token
 * ============================================
 */

const User = require('../models/User');
const {
    verifyAccessToken,
    extractTokenFromHeader,
} = require('../utils/jwt');

/**
 * ============================================
 * MAIN AUTH MIDDLEWARE
 * ============================================
 *
 * Usage in routes:
 *   router.get('/tasks', protect, taskController.getTasks)
 *
 * After this middleware, req.user is available
 */
const protect = async (req, res, next) => {
    try {
        // Step 1: Extract token from header
        const token = extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            /**
             * No token provided
             * 
             * ⚠️ 401 Unauthorized vs 403 Forbidden:
             *   - 401: "Who are you?" (not authenticated)
             *   - 403: "I know who you are, but you can't" (not authorized)
             */
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.',
                code: 'NO_TOKEN',
            });
        }

        // Step 2: Verify the token
        const verification = verifyAccessToken(token);

        if (!verification.valid) {
            /**
             * Token is invalid or expired
             * 
             * We distinguish between expired and invalid
             * so frontend knows when to refresh vs re-login
             */
            if (verification.expired) {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired. Please refresh your token.',
                    code: 'TOKEN_EXPIRED',
                });
            }

            return res.status(401).json({
                success: false,
                error: 'Invalid token.',
                code: 'INVALID_TOKEN',
            });
        }

        // Step 3: Check if user still exists
        /**
         * 🤔 WHY check DB?
         *   - User might have been deleted
         *   - User might have been deactivated
         *   - Password might have changed (should invalidate tokens)
         *
         * ⚠️ TRADE-OFF:
         *   - DB lookup on every request (slower)
         *   - But more secure (can invalidate immediately)
         *   - Could cache in Redis for performance
         */
        const user = await User.findById(verification.payload.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User no longer exists.',
                code: 'USER_NOT_FOUND',
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'User account is deactivated.',
                code: 'USER_INACTIVE',
            });
        }

        // Step 4: Attach user to request
        /**
         * Now all subsequent middleware and route handlers
         * can access the authenticated user via req.user
         */
        req.user = user;
        req.userId = user._id;

        next();
    } catch (error) {
        next(error); // Pass to error handler
    }
};

/**
 * ============================================
 * CONCEPT: Role-Based Authorization
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Restrict routes to specific user roles
 *
 * ⚙️ HOW: Factory function returns middleware
 *
 * Usage:
 *   router.delete('/user/:id', protect, authorize('admin'), deleteUser)
 *
 * 💡 INTERVIEW TIP: "Authentication vs Authorization?"
 *   - Authentication: Who are you? (login)
 *   - Authorization: What can you do? (permissions)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        /**
         * Check if user's role is in the allowed roles
         * 
         * Example: authorize('admin', 'moderator')
         * → Only admins and moderators can access
         */
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Role '${req.user.role}' is not authorized for this action.`,
                code: 'FORBIDDEN',
            });
        }

        next();
    };
};

/**
 * ============================================
 * OPTIONAL AUTH MIDDLEWARE
 * ============================================
 *
 * 📚 WHAT: Attaches user if token present, but doesn't require it
 *
 * 🤔 WHY: Some routes are public but show extra info if logged in
 *   Example: Product page shows "You purchased this" if logged in
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            // No token, but that's okay - continue without user
            return next();
        }

        const verification = verifyAccessToken(token);

        if (verification.valid) {
            const user = await User.findById(verification.payload.userId);
            if (user && user.isActive) {
                req.user = user;
                req.userId = user._id;
            }
        }

        // Continue regardless of token validity
        next();
    } catch (error) {
        // Ignore errors, just continue without user
        next();
    }
};

/**
 * ============================================
 * RESOURCE OWNERSHIP CHECK
 * ============================================
 *
 * 📚 WHAT: Verify user owns the resource they're accessing
 *
 * Usage: In controller after fetching resource
 *   const task = await Task.findById(id);
 *   checkOwnership(req.user, task.owner);
 */
const checkOwnership = (userId, ownerId) => {
    return userId.toString() === ownerId.toString();
};

module.exports = {
    protect,
    authorize,
    optionalAuth,
    checkOwnership,
};

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. protect: Require authentication
 * 2. authorize: Require specific roles
 * 3. optionalAuth: Attach user if available
 * 4. Always check if user still exists in DB
 * 5. Use different error codes for different failures
 * 6. 401 = not authenticated, 403 = not authorized
 *
 * ============================================
 * 📚 NEXT: Check out ./middleware/errorHandler.js
 * ============================================
 */
