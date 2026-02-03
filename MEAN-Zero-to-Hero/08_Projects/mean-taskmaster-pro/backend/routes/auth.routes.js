/**
 * ============================================
 * CONCEPT: Express Router & RESTful Routes
 * LEVEL: Beginner → Intermediate
 * ============================================
 *
 * 📚 WHAT: Express Router groups related routes together
 *
 * ⚙️ HOW:
 *   - Create router instance
 *   - Define routes on router
 *   - Export and mount in server.js
 *
 * 🤔 WHY Router?
 *   - Modular: Each feature has its own routes file
 *   - Organized: Related routes together
 *   - Reusable: Can mount same router at different paths
 *
 * 💡 RESTful API Design:
 *   - POST /auth/register → Create user
 *   - POST /auth/login → Authenticate user
 *   - POST /auth/refresh → Get new access token
 *   - POST /auth/logout → Invalidate tokens
 * ============================================
 */

const express = require('express');
const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRegister, validateLogin } = require('../middleware/validate');
const { authRateLimit } = require('../config/security');

const router = express.Router();

/**
 * ============================================
 * POST /api/auth/register
 * ============================================
 *
 * 📚 WHAT: Create a new user account
 *
 * ⚙️ FLOW:
 *   1. Validate input (middleware)
 *   2. Check if email exists
 *   3. Create user (password auto-hashed by pre-save hook)
 *   4. Generate tokens
 *   5. Save refresh token to user
 *   6. Return user + tokens
 */
router.post(
    '/register',
    authRateLimit,         // Stricter rate limit for auth
    validateRegister,      // Validation middleware
    asyncHandler(async (req, res) => {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered',
                code: 'EMAIL_EXISTS',
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password, // Will be hashed by pre-save hook
        });

        // Generate tokens
        const tokens = generateTokens(user._id);

        // Save refresh token to user (for invalidation)
        user.refreshToken = tokens.refreshToken;
        await user.save({ validateBeforeSave: false });

        // Send response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                tokens,
            },
        });
    })
);

/**
 * ============================================
 * POST /api/auth/login
 * ============================================
 *
 * 📚 WHAT: Authenticate user and return tokens
 *
 * ⚙️ FLOW:
 *   1. Validate input
 *   2. Find user by email
 *   3. Compare password using bcrypt
 *   4. Generate new tokens
 *   5. Update last login time
 *   6. Return user + tokens
 *
 * ⚠️ SECURITY: Same error for wrong email/password
 *   → Prevents user enumeration attacks
 */
router.post(
    '/login',
    authRateLimit,
    validateLogin,
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password +refreshToken');

        if (!user) {
            // Don't reveal that email doesn't exist
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS',
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS',
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account is deactivated',
                code: 'ACCOUNT_INACTIVE',
            });
        }

        // Generate tokens
        const tokens = generateTokens(user._id);

        // Update user
        user.refreshToken = tokens.refreshToken;
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                tokens,
            },
        });
    })
);

/**
 * ============================================
 * POST /api/auth/refresh
 * ============================================
 *
 * 📚 WHAT: Get new access token using refresh token
 *
 * ⚙️ FLOW:
 *   1. Verify refresh token
 *   2. Check if token matches stored token
 *   3. Generate new tokens
 *   4. Update stored refresh token
 *
 * 🤔 WHY rotate refresh tokens?
 *   - If refresh token is stolen, attacker's token becomes invalid
 *     when legitimate user next refreshes
 */
router.post(
    '/refresh',
    asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required',
                code: 'NO_REFRESH_TOKEN',
            });
        }

        // Verify the refresh token
        const verification = verifyRefreshToken(refreshToken);

        if (!verification.valid) {
            return res.status(401).json({
                success: false,
                error: verification.expired
                    ? 'Refresh token expired. Please login again.'
                    : 'Invalid refresh token',
                code: verification.expired ? 'REFRESH_EXPIRED' : 'INVALID_REFRESH',
            });
        }

        // Find user and check if refresh token matches
        const user = await User.findById(verification.payload.userId).select(
            '+refreshToken'
        );

        if (!user || user.refreshToken !== refreshToken) {
            /**
             * Token doesn't match stored token
             * This could mean:
             *   - Token was invalidated (logout)
             *   - Token was rotated (someone else refreshed)
             *   - Token is from an old version
             *
             * Security measure: Clear stored token
             */
            if (user) {
                user.refreshToken = undefined;
                await user.save({ validateBeforeSave: false });
            }

            return res.status(401).json({
                success: false,
                error: 'Invalid refresh token. Please login again.',
                code: 'TOKEN_MISMATCH',
            });
        }

        // Generate new tokens (token rotation)
        const tokens = generateTokens(user._id);

        // Update stored refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'Tokens refreshed successfully',
            data: { tokens },
        });
    })
);

/**
 * ============================================
 * POST /api/auth/logout
 * ============================================
 *
 * 📚 WHAT: Invalidate refresh token
 *
 * ⚙️ HOW: Clear stored refresh token
 *   → If someone tries to use stolen refresh token, it won't match
 *
 * 💡 Note: Access token can't be invalidated server-side
 *   → Client should discard it
 *   → That's why access tokens are short-lived
 */
router.post(
    '/logout',
    protect,
    asyncHandler(async (req, res) => {
        // Clear refresh token
        await User.findByIdAndUpdate(req.userId, {
            refreshToken: undefined,
        });

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    })
);

/**
 * ============================================
 * GET /api/auth/me
 * ============================================
 *
 * 📚 WHAT: Get current user's profile
 *
 * ⚙️ HOW: protect middleware already attached user to req
 */
router.get(
    '/me',
    protect,
    asyncHandler(async (req, res) => {
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    createdAt: req.user.createdAt,
                    lastLogin: req.user.lastLogin,
                },
            },
        });
    })
);

module.exports = router;

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. Rate limit auth routes more strictly
 * 2. Validate input before processing
 * 3. Use asyncHandler to catch async errors
 * 4. Same error for wrong email/password (security)
 * 5. Rotate refresh tokens on each refresh
 * 6. Store refresh token to allow invalidation
 * 7. Access tokens can't be invalidated - keep them short
 *
 * ============================================
 * 📚 NEXT: Check out ./routes/task.routes.js for CRUD routes
 * ============================================
 */
