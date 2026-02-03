/**
 * ============================================
 * CONCEPT: Security Middleware Configuration
 * LEVEL: Intermediate → Advanced
 * ============================================
 *
 * 📚 WHAT: This module configures security-related middleware:
 *   - Helmet: Sets security HTTP headers
 *   - CORS: Controls cross-origin requests
 *   - Rate Limiting: Prevents DDoS attacks
 *
 * 🤔 WHY: Web applications face many threats:
 *   - XSS (Cross-Site Scripting)
 *   - CSRF (Cross-Site Request Forgery)
 *   - Clickjacking
 *   - DDoS (Distributed Denial of Service)
 *   - Sniffing attacks
 *
 * 💡 INTERVIEW TIP: "How do you secure an Express API?"
 *   → Helmet for security headers
 *   → CORS for origin control
 *   → Rate limiting for DDoS protection
 *   → Input validation (we do this in middleware/validate.js)
 *   → JWT for authentication
 *   → HTTPS in production
 * ============================================
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

/**
 * ============================================
 * CONCEPT: Helmet - Security Headers
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Helmet sets various HTTP headers for security
 *
 * ⚙️ HOW: It's a collection of smaller middleware:
 *   - X-Content-Type-Options: nosniff
 *   - X-Frame-Options: DENY (clickjacking prevention)
 *   - Content-Security-Policy: controls resource loading
 *   - X-XSS-Protection: XSS filter (legacy browsers)
 *   - Strict-Transport-Security: force HTTPS
 *
 * ⚠️ COMMON MISTAKE: Not customizing CSP for your app
 *   → Default CSP may block legitimate resources
 */
const configureHelmet = () => {
    return helmet({
        // Content Security Policy - controls what resources can load
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],          // Only allow own origin
                styleSrc: ["'self'", "'unsafe-inline'"],  // Allow inline styles
                scriptSrc: ["'self'"],           // Only own scripts
                imgSrc: ["'self'", "data:", "https:"],   // Allow images from HTTPS
                connectSrc: ["'self'"],          // Only connect to own origin
            },
        },
        // Cross-Origin-Embedder-Policy
        crossOriginEmbedderPolicy: false, // Disable for simpler setup
    });
};

/**
 * ============================================
 * CONCEPT: CORS - Cross-Origin Resource Sharing
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Controls which origins can access your API
 *
 * ⚙️ HOW: Browser enforces Same-Origin Policy
 *   → Request from http://localhost:4200 (Angular)
 *   → To http://localhost:3000 (Express)
 *   → This is cross-origin! Browser blocks by default
 *   → CORS headers tell browser to allow it
 *
 * 🤔 WHY: Without CORS:
 *   → Malicious sites could make requests to your API
 *   → Using user's cookies/session
 *   → CORS ensures only trusted origins access your API
 *
 * ⚠️ COMMON MISTAKES:
 *   - Using `origin: '*'` in production (allows any origin!)
 *   - Forgetting credentials option for cookies
 *   - Not setting allowed methods/headers
 *
 * 💡 INTERVIEW TIP: "What is a preflight request?"
 *   → Browser sends OPTIONS request before actual request
 *   → Checks if server allows the method/headers
 *   → Only for non-simple requests (PUT, DELETE, custom headers)
 */
const configureCors = () => {
    return cors({
        // Which origins can access the API
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman)
            if (!origin) return callback(null, true);

            // List of allowed origins
            const allowedOrigins = [
                process.env.CORS_ORIGIN || 'http://localhost:4200',
                'http://localhost:4200',  // Angular dev server
                'http://localhost:3000',  // Same origin
            ];

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },

        // Allow credentials (cookies, authorization headers)
        credentials: true,

        // Allowed HTTP methods
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

        // Allowed request headers
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
        ],

        // Expose these headers to frontend
        exposedHeaders: ['X-Total-Count'],

        // Preflight request cache time (in seconds)
        maxAge: 86400, // 24 hours
    });
};

/**
 * ============================================
 * CONCEPT: Rate Limiting - DDoS Prevention
 * LEVEL: Intermediate → Advanced
 * ============================================
 *
 * 📚 WHAT: Limits how many requests an IP can make
 *
 * ⚙️ HOW: Tracks requests per IP in memory/Redis
 *   → If limit exceeded, returns 429 Too Many Requests
 *   → Resets after window expires
 *
 * 🤔 WHY: Protects against:
 *   - DDoS attacks (flood of requests)
 *   - Brute force attacks (password guessing)
 *   - API abuse (scraping, spam)
 *
 * ⚠️ COMMON MISTAKES:
 *   - Using in-memory store in production with multiple servers
 *     → Use Redis for shared state
 *   - Setting limits too low (annoying users)
 *   - Not having different limits for different routes
 *
 * 💡 INTERVIEW TIP: "How do you prevent brute force attacks?"
 *   → Rate limit login attempts (e.g., 5 per minute)
 *   → Account lockout after X failures
 *   → CAPTCHA after Y failures
 *   → Exponential backoff
 */
const configureRateLimit = () => {
    return rateLimit({
        // Time window in milliseconds
        windowMs: 15 * 60 * 1000, // 15 minutes

        // Max requests per window per IP
        max: 100,

        // Return rate limit info in headers
        standardHeaders: true, // RateLimit-* headers
        legacyHeaders: false,  // Disable X-RateLimit-* headers

        // Error message when limit exceeded
        message: {
            success: false,
            error: 'Too many requests, please try again later.',
            retryAfter: '15 minutes',
        },

        // Skip rate limiting for successful requests (optional)
        // skipSuccessfulRequests: false,

        // Custom key generator (default uses IP)
        // keyGenerator: (req) => req.ip,
    });
};

/**
 * ============================================
 * AUTH-SPECIFIC RATE LIMITER
 * ============================================
 *
 * 📚 WHAT: Stricter rate limit for authentication routes
 *
 * 🤔 WHY: Login/register are prime targets for:
 *   - Brute force attacks
 *   - Credential stuffing
 *   - Account enumeration
 */
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Only 10 login attempts per 15 min
    message: {
        success: false,
        error: 'Too many login attempts. Please try again in 15 minutes.',
    },
    // Only apply to failed requests (successful logins don't count)
    skipSuccessfulRequests: true,
});

module.exports = {
    configureHelmet,
    configureCors,
    configureRateLimit,
    authRateLimit,
};

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. ALWAYS use Helmet in production
 * 2. NEVER use CORS origin: '*' in production
 * 3. Rate limit to prevent abuse and attacks
 * 4. Use stricter limits for auth routes
 * 5. In production, use Redis for rate limit store
 *
 * ============================================
 * 📚 NEXT: Check out ./models/User.js for authentication setup
 * ============================================
 */
