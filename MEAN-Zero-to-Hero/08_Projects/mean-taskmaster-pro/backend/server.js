/**
 * ============================================
 * CONCEPT: Express Application Entry Point
 * LEVEL: Beginner → Intermediate
 * ============================================
 *
 * 📚 WHAT: This is the main entry point of our Express application.
 * It sets up the server, middleware, routes, and error handling.
 *
 * ⚙️ HOW: Express is a minimal web framework. We:
 *   1. Create an Express app instance
 *   2. Add middleware (functions that process requests)
 *   3. Define routes (URL endpoints)
 *   4. Start listening on a port
 *
 * 🤔 WHY: Separating concerns makes code maintainable.
 *   - Config in /config
 *   - Routes in /routes
 *   - Business logic in /controllers
 *   - Data models in /models
 *
 * ⚠️ COMMON MISTAKES:
 *   - Putting business logic directly in routes
 *   - Not handling async errors properly
 *   - Middleware order matters! (e.g., body parser before routes)
 *
 * 💡 INTERVIEW TIP: "Explain the Express middleware chain"
 *   → Middleware are functions that have access to req, res, next
 *   → They execute in ORDER of definition
 *   → Each can modify req/res or end the cycle
 * ============================================
 */

// Load environment variables FIRST (before anything else uses them)
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');

// Import our custom modules
const connectDB = require('./config/db');
const { configureHelmet, configureCors, configureRateLimit } = require('./config/security');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');

/**
 * ============================================
 * CONCEPT: Express Application Instance
 * ============================================
 *
 * 📚 WHAT: express() creates an Express application
 *
 * ⚙️ HOW: The app object has methods for:
 *   - Routing HTTP requests (get, post, put, delete)
 *   - Configuring middleware (use)
 *   - Rendering HTML views (we use JSON APIs instead)
 *   - Starting a server (listen)
 */
const app = express();

/**
 * ============================================
 * CONCEPT: Middleware Chain
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Middleware are functions that run between receiving
 * a request and sending a response.
 *
 * ⚙️ HOW: Each middleware has signature (req, res, next)
 *   - req: The incoming request object
 *   - res: The response object we'll send back
 *   - next: Function to call the next middleware
 *
 * 🤔 WHY ORDER MATTERS:
 *   1. Security middleware (helmet, cors) → First line of defense
 *   2. Body parsers → So routes can read req.body
 *   3. Logging → Track all requests
 *   4. Routes → Handle the actual request
 *   5. Error handler → Catch any errors (MUST BE LAST)
 *
 * ⚠️ COMMON MISTAKE: Adding error handler before routes
 *   → Errors won't be caught because handler already passed
 */

// ═══════════════════════════════════════════
// STEP 1: Security Middleware (First!)
// ═══════════════════════════════════════════
app.use(configureHelmet());       // Security headers
app.use(configureCors());         // Cross-origin requests
app.use(configureRateLimit());    // Prevent DDoS

// ═══════════════════════════════════════════
// STEP 2: Body Parsers
// ═══════════════════════════════════════════
/**
 * 📚 WHAT: Parse incoming JSON request bodies
 * 
 * ⚙️ HOW: When client sends { "email": "test@example.com" }
 *   → express.json() parses it
 *   → Now accessible as req.body.email
 *
 * ⚠️ COMMON MISTAKE: Forgetting this, then req.body is undefined
 */
app.use(express.json({ limit: '10kb' })); // Limit body size for security

/**
 * 📚 WHAT: Parse URL-encoded form data
 *
 * ⚙️ HOW: When HTML forms submit with enctype="application/x-www-form-urlencoded"
 *   → This parses the data into req.body
 */
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ═══════════════════════════════════════════
// STEP 3: Logging
// ═══════════════════════════════════════════
/**
 * 📚 WHAT: Morgan logs HTTP requests to console
 *
 * Options:
 *   - 'dev': Colored output for development
 *   - 'combined': Apache-style logs for production
 *   - 'tiny': Minimal output
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ═══════════════════════════════════════════
// STEP 4: Routes
// ═══════════════════════════════════════════
/**
 * 📚 WHAT: Mount route handlers at specific paths
 *
 * ⚙️ HOW: app.use('/api/auth', authRoutes) means:
 *   → All routes in authRoutes are prefixed with /api/auth
 *   → authRoutes.post('/login') becomes POST /api/auth/login
 *
 * 💡 INTERVIEW TIP: "What's the difference between app.use() and app.get()?"
 *   → app.use() matches ALL HTTP methods and path prefixes
 *   → app.get() only matches GET requests and exact paths
 */
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint (useful for deployment)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════
// STEP 5: 404 Handler (Before error handler)
// ═══════════════════════════════════════════
/**
 * 📚 WHAT: Handle requests to undefined routes
 *
 * ⚙️ HOW: If request reaches here, no route matched
 *   → We create an error and pass it to the error handler
 */
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error); // Pass to error handler
});

// ═══════════════════════════════════════════
// STEP 6: Global Error Handler (MUST BE LAST!)
// ═══════════════════════════════════════════
/**
 * 📚 WHAT: Centralized error handling
 *
 * ⚙️ HOW: Any error thrown or passed to next(error) comes here
 *
 * 🤔 WHY: Single place to:
 *   - Log errors
 *   - Format error responses
 *   - Hide sensitive info in production
 */
app.use(errorHandler);

// ═══════════════════════════════════════════
// Server Startup
// ═══════════════════════════════════════════
const PORT = process.env.PORT || 3000;

/**
 * 📚 WHAT: Start the server only after DB connection
 *
 * 🤔 WHY: If DB connection fails, we shouldn't accept requests
 *
 * ⚙️ HOW: connectDB() returns a Promise
 *   → When resolved, we start listening
 *   → If rejected, we log error and exit
 */
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start Express server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 TaskMaster Pro Backend                           ║
║                                                       ║
║   Server:  http://localhost:${PORT}                      ║
║   Mode:    ${process.env.NODE_ENV || 'development'}                            ║
║   MongoDB: Connected ✓                                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. Middleware executes in ORDER of definition
 * 2. Security first, error handler last
 * 3. Always handle async errors
 * 4. Separate concerns (routes, controllers, models)
 * 5. Connect to DB before accepting requests
 *
 * ============================================
 * 📚 NEXT: Check out ./config/db.js to see MongoDB connection
 * ============================================
 */
