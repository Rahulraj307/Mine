/**
 * ============================================
 * CONCEPT: MongoDB Connection with Mongoose
 * LEVEL: Beginner → Intermediate
 * ============================================
 *
 * 📚 WHAT: This module connects our app to MongoDB database.
 *
 * ⚙️ HOW: Mongoose is an ODM (Object Document Mapper)
 *   - Provides schema validation
 *   - Connection pooling (reuses connections)
 *   - Promise-based API
 *
 * 🤔 WHY Mongoose over native MongoDB driver?
 *   - Schema validation before saving
 *   - Middleware hooks (pre/post save)
 *   - Virtual properties
 *   - Population (joins)
 *   - Better TypeScript support
 *
 * ⚠️ COMMON MISTAKES:
 *   - Creating new connection for each request (memory leak!)
 *   - Not handling connection errors
 *   - Not using connection pooling
 *
 * 💡 INTERVIEW TIP: "Explain MongoDB connection pooling"
 *   → Pool maintains multiple open connections
 *   → Requests reuse existing connections
 *   → Avoids overhead of new connection per request
 *   → Default pool size in Mongoose is 100
 * ============================================
 */

const mongoose = require('mongoose');

/**
 * ============================================
 * CONCEPT: Singleton Connection Pattern
 * ============================================
 *
 * 📚 WHAT: We create ONE connection and reuse it
 *
 * ⚙️ HOW: mongoose.connect() creates a default connection
 *   → All models use this connection automatically
 *   → Connection is cached and reused
 *
 * 🤔 WHY: Creating new connections is expensive
 *   → Connection establishment takes time
 *   → Each connection uses memory
 *   → Too many connections can crash DB
 */

const connectDB = async () => {
    try {
        /**
         * Connection Options Explained:
         *
         * Note: Many options are now deprecated in Mongoose 6+
         * Mongoose 6+ uses these by default:
         *   - useNewUrlParser: true
         *   - useUnifiedTopology: true
         *   - useCreateIndex: true
         *   - useFindAndModify: false
         */
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`📦 MongoDB Connected: ${conn.connection.host}`);

        /**
         * ============================================
         * CONCEPT: Connection Events
         * LEVEL: Intermediate
         * ============================================
         *
         * 📚 WHAT: Mongoose emits events for connection state changes
         *
         * 🤔 WHY: Handle reconnection, logging, alerts
         */

        // Connection lost
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        // Reconnected
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

        // Error occurred
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        /**
         * ============================================
         * CONCEPT: Graceful Shutdown
         * LEVEL: Intermediate → Advanced
         * ============================================
         *
         * 📚 WHAT: Close DB connection when app shuts down
         *
         * 🤔 WHY: Prevent connection leaks and data corruption
         *   → Ongoing operations should complete
         *   → New operations should be rejected
         *   → Connection should close cleanly
         */
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('📦 MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        /**
         * ⚠️ COMMON MISTAKE: Swallowing connection errors
         *
         * If DB connection fails:
         *   → App should not start
         *   → Log clearly for debugging
         *   → Exit with error code
         */
        console.error(`❌ MongoDB Connection Error: ${error.message}`);

        // Common connection issues:
        if (error.message.includes('ECONNREFUSED')) {
            console.error('💡 Is MongoDB running? Try: mongod');
        }
        if (error.message.includes('authentication failed')) {
            console.error('💡 Check your username/password in MONGODB_URI');
        }

        // Exit process with failure code
        process.exit(1);
    }
};

module.exports = connectDB;

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. Create ONE connection and reuse it (singleton pattern)
 * 2. Handle connection events (disconnect, error)
 * 3. Implement graceful shutdown
 * 4. Fail fast if DB connection fails
 * 5. Mongoose 6+ has sensible defaults
 *
 * ============================================
 * 📚 NEXT: Check out ./models/User.js for Mongoose schemas
 * ============================================
 */
