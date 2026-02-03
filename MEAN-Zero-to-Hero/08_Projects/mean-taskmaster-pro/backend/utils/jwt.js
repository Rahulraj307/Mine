/**
 * ============================================
 * CONCEPT: JWT (JSON Web Token) Utilities
 * LEVEL: Intermediate → Advanced
 * ============================================
 *
 * 📚 WHAT: JWT is a secure way to transmit information between parties
 * as a JSON object that is digitally signed.
 *
 * ⚙️ HOW: A JWT has 3 parts (separated by dots):
 *   1. HEADER: { "alg": "HS256", "typ": "JWT" }
 *   2. PAYLOAD: { "userId": "123", "exp": 1234567890 }
 *   3. SIGNATURE: HMACSHA256(header + payload, secret)
 *
 *   Example: xxxxx.yyyyy.zzzzz
 *
 * 🤔 WHY JWT for authentication?
 *   - Stateless: Server doesn't need to store sessions
 *   - Scalable: Works across multiple servers
 *   - Self-contained: Token has all info needed
 *   - Secure: Signed, so can't be tampered
 *
 * ⚠️ COMMON MISTAKES:
 *   - Storing JWTs in localStorage (vulnerable to XSS)
 *   - Very long expiry times (security risk)
 *   - Storing sensitive data in payload (it's base64, not encrypted)
 *   - Not handling token refresh properly
 *
 * 💡 INTERVIEW TIP: "How does JWT authentication work?"
 *   1. User logs in with credentials
 *   2. Server verifies, creates JWT with user ID
 *   3. Client stores token (httpOnly cookie best)
 *   4. Client sends token with each request
 *   5. Server verifies signature, extracts user ID
 * ============================================
 */

const jwt = require('jsonwebtoken');

/**
 * ============================================
 * ACCESS TOKEN vs REFRESH TOKEN
 * ============================================
 *
 * ACCESS TOKEN:
 *   - Short-lived (15 min)
 *   - Used to access protected resources
 *   - Sent with every request
 *   - If stolen, limited damage (expires soon)
 *
 * REFRESH TOKEN:
 *   - Long-lived (7 days)
 *   - Used ONLY to get new access tokens
 *   - Stored more securely (httpOnly cookie)
 *   - Can be invalidated (stored in DB)
 *
 * 🤔 WHY two tokens?
 *   - Security + UX balance
 *   - Short access = less risk
 *   - Refresh token = no re-login every 15 min
 */

/**
 * Generate Access Token
 * Short-lived, carries minimal payload
 */
const generateAccessToken = (userId) => {
    return jwt.sign(
        {
            userId,
            type: 'access',
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
            issuer: 'taskmaster-pro',
            audience: 'taskmaster-users',
        }
    );
};

/**
 * Generate Refresh Token
 * Long-lived, used only for getting new access tokens
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        {
            userId,
            type: 'refresh',
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
            issuer: 'taskmaster-pro',
            audience: 'taskmaster-users',
        }
    );
};

/**
 * Generate both tokens together
 * Called during login/registration
 */
const generateTokens = (userId) => {
    return {
        accessToken: generateAccessToken(userId),
        refreshToken: generateRefreshToken(userId),
    };
};

/**
 * ============================================
 * CONCEPT: Token Verification
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Verify a token is valid and not tampered
 *
 * ⚙️ HOW: jwt.verify()
 *   1. Splits token into parts
 *   2. Decodes header and payload
 *   3. Recreates signature using secret
 *   4. Compares signatures
 *   5. Checks expiry and other claims
 *
 * ⚠️ What can go wrong:
 *   - TokenExpiredError: exp claim is past
 *   - JsonWebTokenError: Invalid signature/format
 *   - NotBeforeError: nbf claim is in future
 */
const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
            issuer: 'taskmaster-pro',
            audience: 'taskmaster-users',
        });

        // Make sure it's an access token
        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }

        return {
            valid: true,
            expired: false,
            payload: decoded,
        };
    } catch (error) {
        return {
            valid: false,
            expired: error.name === 'TokenExpiredError',
            payload: null,
            error: error.message,
        };
    }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
            issuer: 'taskmaster-pro',
            audience: 'taskmaster-users',
        });

        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        return {
            valid: true,
            expired: false,
            payload: decoded,
        };
    } catch (error) {
        return {
            valid: false,
            expired: error.name === 'TokenExpiredError',
            payload: null,
            error: error.message,
        };
    }
};

/**
 * ============================================
 * CONCEPT: Token Extraction from Headers
 * ============================================
 *
 * 📚 WHAT: Extract JWT from Authorization header
 *
 * ⚙️ HOW: Header format: "Bearer <token>"
 *   → Split by space, take second part
 *
 * 💡 Why "Bearer"?
 *   → HTTP spec defines multiple auth schemes
 *   → Bearer = "whoever bears this token gets access"
 *   → Other schemes: Basic, Digest, etc.
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    return authHeader.split(' ')[1];
};

/**
 * ============================================
 * CONCEPT: Decode without verification
 * ============================================
 *
 * 📚 WHAT: Read token payload WITHOUT verifying signature
 *
 * ⚠️ WARNING: Never trust the data from this!
 *   → Use only for logging, debugging
 *   → ALWAYS verify before using data
 */
const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken,
    extractTokenFromHeader,
    decodeToken,
};

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. JWT has 3 parts: header.payload.signature
 * 2. Access tokens: short-lived, for API access
 * 3. Refresh tokens: long-lived, for getting new access tokens
 * 4. Always verify tokens before trusting the data
 * 5. Store refresh tokens in DB to allow invalidation
 * 6. Use httpOnly cookies for storage (not localStorage)
 *
 * ============================================
 * 📚 NEXT: Check out ./middleware/auth.js for auth middleware
 * ============================================
 */
