/**
 * ============================================
 * CONCEPT: Mongoose Schema & Model - User
 * LEVEL: Beginner → Advanced
 * ============================================
 *
 * 📚 WHAT: A Mongoose schema defines the structure of documents
 * in a MongoDB collection. This is our User model with authentication.
 *
 * ⚙️ HOW: Mongoose provides:
 *   - Schema: Defines structure, validation, defaults
 *   - Model: Provides CRUD operations (find, save, etc.)
 *   - Middleware: Pre/post hooks for save, find, etc.
 *   - Virtuals: Computed properties (not stored in DB)
 *   - Methods: Custom instance methods
 *   - Statics: Custom model methods
 *
 * 🤔 WHY use schema validation?
 *   - Data consistency (all users have same structure)
 *   - Security (reject malformed data)
 *   - Documentation (schema IS the docs)
 *
 * ⚠️ COMMON MISTAKES:
 *   - Storing plain text passwords
 *   - Not indexing frequently queried fields
 *   - Forgetting to hash password on update
 *
 * 💡 INTERVIEW TIP: "How do you store passwords securely?"
 *   → Never store plain text
 *   → Use bcrypt with salt (cost factor 10-12)
 *   → Compare using bcrypt.compare(), not ===
 *   → Consider adding pepper (app-level secret)
 * ============================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * ============================================
 * CONCEPT: Schema Definition
 * LEVEL: Beginner
 * ============================================
 */
const userSchema = new mongoose.Schema(
    {
        /**
         * Name field
         * - required: must be provided
         * - trim: removes whitespace from both ends
         * - minlength/maxlength: validation bounds
         */
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },

        /**
         * Email field
         * - unique: no duplicate emails (creates index)
         * - lowercase: converts to lowercase before save
         * - match: regex validation for email format
         */
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
                'Please provide a valid email',
            ],
        },

        /**
         * Password field
         * - select: false means it won't be returned in queries by default
         * - We need to explicitly request it: User.findOne().select('+password')
         */
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't include in queries by default!
        },

        /**
         * Role field with enum
         * - enum: only allow specific values
         * - default: value if not provided
         */
        role: {
            type: String,
            enum: {
                values: ['user', 'admin'],
                message: 'Role must be either user or admin',
            },
            default: 'user',
        },

        /**
         * Refresh token for JWT refresh
         * - Stored to allow token invalidation
         * - If user logs out, we clear this
         */
        refreshToken: {
            type: String,
            select: false,
        },

        /**
         * Account status
         */
        isActive: {
            type: Boolean,
            default: true,
        },

        /**
         * Password reset fields
         */
        passwordResetToken: String,
        passwordResetExpires: Date,

        /**
         * Last login tracking
         */
        lastLogin: Date,
    },
    {
        /**
         * Schema options
         */
        timestamps: true, // Adds createdAt and updatedAt automatically

        // Transform output (hide internal fields)
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.password;
                delete ret.refreshToken;
                delete ret.__v;
                return ret;
            },
        },
    }
);

/**
 * ============================================
 * CONCEPT: Mongoose Indexes
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Indexes speed up queries by creating B-tree structures
 *
 * ⚙️ HOW: MongoDB uses indexes to find documents faster
 *   - Without index: full collection scan (slow!)
 *   - With index: B-tree lookup (fast!)
 *
 * 🤔 WHY: Performance at scale
 *   - 1000 docs: might not matter
 *   - 1 million docs: HUGE difference
 *
 * ⚠️ COMMON MISTAKE: Over-indexing
 *   - Each index uses disk space
 *   - Slows down writes (index must update)
 *   - Only index fields you query frequently
 *
 * 💡 INTERVIEW TIP: "When should you use indexes?"
 *   → Fields used in WHERE/find conditions
 *   → Fields used for sorting
 *   → Fields with high cardinality (many unique values)
 */
userSchema.index({ email: 1 }); // Already unique, but explicit

/**
 * ============================================
 * CONCEPT: Mongoose Middleware (Pre Hooks)
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Functions that run before/after certain operations
 *
 * ⚙️ HOW: 'pre' runs BEFORE the operation, 'post' runs AFTER
 *
 * 🤔 WHY pre('save')? 
 *   - Hash password before storing
 *   - Validate/transform data
 *   - Set computed fields
 *
 * ⚠️ COMMON MISTAKE: Using arrow functions
 *   → Arrow functions don't have their own 'this'
 *   → Use regular function to access the document
 */
userSchema.pre('save', async function (next) {
    /**
     * Only hash password if it's new or modified
     * 
     * Why? If we're just updating name or email,
     * we don't want to re-hash an already hashed password!
     */
    if (!this.isModified('password')) {
        return next();
    }

    /**
     * ============================================
     * CONCEPT: Password Hashing with bcrypt
     * LEVEL: Intermediate → Advanced
     * ============================================
     *
     * 📚 WHAT: bcrypt is a password hashing function
     *
     * ⚙️ HOW:
     *   1. genSalt(rounds) creates a random salt
     *   2. hash(password, salt) creates the hash
     *   3. Result: $2b$12$salt22chars.hash31chars
     *
     * 🤔 WHY bcrypt?
     *   - Intentionally slow (prevents brute force)
     *   - Salt is built into the hash
     *   - Adaptive: increase rounds as hardware gets faster
     *
     * 💡 Salt Rounds (Cost Factor):
     *   - 10: ~10 hashes/second (fast, development)
     *   - 12: ~2 hashes/second (good for production)
     *   - 14: ~0.5 hashes/second (high security)
     *
     * ⚠️ Why not SHA-256 or MD5?
     *   → Too fast! Billions of hashes/second
     *   → No built-in salt
     *   → Vulnerable to rainbow tables
     */
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

/**
 * ============================================
 * CONCEPT: Instance Methods
 * LEVEL: Beginner → Intermediate
 * ============================================
 *
 * 📚 WHAT: Methods available on document instances
 *
 * ⚙️ HOW: user.comparePassword('test') calls this method
 *
 * 🤔 WHY: Encapsulate password comparison logic
 *   - DRY: Use same logic everywhere
 *   - Secure: Never expose how we compare
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    /**
     * bcrypt.compare handles:
     *   1. Extracting salt from stored hash
     *   2. Hashing candidate with same salt
     *   3. Constant-time comparison (prevents timing attacks)
     *
     * ⚠️ COMMON MISTAKE: Using === to compare
     *   → Timing attack: attacker can measure response time
     *   → bcrypt.compare uses constant-time comparison
     */
    return bcrypt.compare(candidatePassword, this.password);
};

/**
 * ============================================
 * CONCEPT: Virtual Properties
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Properties that don't exist in the database
 * but are computed from other fields
 *
 * 🤔 WHY: Compute values without storing redundant data
 */
userSchema.virtual('initials').get(function () {
    return this.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
});

/**
 * ============================================
 * CONCEPT: Static Methods
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Methods on the Model itself (not instances)
 *
 * ⚙️ HOW: User.findByEmail('test@example.com')
 *
 * 🤔 WHY: Common queries that should be reusable
 */
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};

/**
 * Create and export the model
 *
 * mongoose.model('User', userSchema)
 *   - 'User': Model name
 *   - MongoDB collection will be 'users' (lowercase, pluralized)
 */
const User = mongoose.model('User', userSchema);

module.exports = User;

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. Always hash passwords with bcrypt (salt rounds 10-12)
 * 2. Use select: false for sensitive fields
 * 3. Pre hooks modify data before save
 * 4. Instance methods for document operations
 * 5. Static methods for model-level queries
 * 6. Index frequently queried fields
 * 7. Use virtuals for computed properties
 *
 * ============================================
 * 📚 NEXT: Check out ./models/Task.js for task schema
 * ============================================
 */
