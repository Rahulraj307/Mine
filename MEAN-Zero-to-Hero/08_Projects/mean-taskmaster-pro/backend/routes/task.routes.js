/**
 * ============================================
 * CONCEPT: CRUD Operations & RESTful API
 * LEVEL: Beginner → Intermediate
 * ============================================
 *
 * 📚 WHAT: Task routes implementing CRUD operations
 *   - CREATE: POST /tasks
 *   - READ:   GET /tasks, GET /tasks/:id
 *   - UPDATE: PUT /tasks/:id, PATCH /tasks/:id
 *   - DELETE: DELETE /tasks/:id
 *
 * ⚙️ RESTful Principles:
 *   - Use nouns for resources (/tasks, not /getTasks)
 *   - HTTP methods define actions
 *   - Stateless (each request is independent)
 *   - Consistent response format
 *
 * 🤔 PUT vs PATCH:
 *   - PUT: Replace entire resource
 *   - PATCH: Update partial resource
 *   - In practice, many APIs use PUT for both
 *
 * 💡 INTERVIEW TIP: "Design a REST API for tasks"
 *   → Use plural nouns: /tasks
 *   → Use HTTP methods: GET, POST, PUT, DELETE
 *   → Return appropriate status codes
 *   → Include pagination for lists
 * ============================================
 */

const express = require('express');
const Task = require('../models/Task');
const { protect, checkOwnership } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const {
    validateCreateTask,
    validateUpdateTask,
    validateObjectId,
    validatePagination,
} = require('../middleware/validate');

const router = express.Router();

/**
 * All task routes require authentication
 * Instead of adding protect to each route, we can use router.use()
 */
router.use(protect);

/**
 * ============================================
 * GET /api/tasks
 * ============================================
 *
 * 📚 WHAT: List all tasks for current user
 *
 * ⚙️ FEATURES:
 *   - Pagination: ?page=1&limit=10
 *   - Filtering: ?status=todo&priority=high
 *   - Sorting: ?sort=-dueDate (- for descending)
 *
 * 🤔 WHY pagination?
 *   - Performance: Don't load 10,000 tasks at once
 *   - UX: Users can't read 10,000 items anyway
 *   - Memory: Reduces server/client memory usage
 */
router.get(
    '/',
    validatePagination,
    asyncHandler(async (req, res) => {
        // Parse query params with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter query
        const filter = { owner: req.userId };

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.priority) {
            filter.priority = req.query.priority;
        }

        if (req.query.search) {
            // Text search on title
            filter.title = { $regex: req.query.search, $options: 'i' };
        }

        // Sorting
        let sort = '-createdAt'; // Default: newest first
        if (req.query.sort) {
            sort = req.query.sort;
        }

        /**
         * ============================================
         * CONCEPT: MongoDB Query Building
         * ============================================
         *
         * Mongoose queries are chainable:
         *   Model.find() → Query object
         *   .sort() → Same Query object
         *   .skip() → Same Query object
         *   .limit() → Same Query object
         *   .exec() or await → Execute query
         */
        const tasks = await Task.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-__v'); // Exclude version key

        // Get total count for pagination metadata
        const total = await Task.countDocuments(filter);

        res.json({
            success: true,
            data: {
                tasks,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1,
                },
            },
        });
    })
);

/**
 * ============================================
 * GET /api/tasks/stats
 * ============================================
 *
 * 📚 WHAT: Get task statistics for dashboard
 *
 * ⚙️ Uses MongoDB Aggregation Pipeline
 */
router.get(
    '/stats',
    asyncHandler(async (req, res) => {
        /**
         * ============================================
         * CONCEPT: MongoDB Aggregation Pipeline
         * LEVEL: Intermediate → Advanced
         * ============================================
         *
         * 📚 WHAT: Process and transform documents in stages
         *
         * ⚙️ HOW: Array of stages, each transforms data
         *   - $match: Filter documents
         *   - $group: Group and aggregate
         *   - $sort: Sort results
         *   - $project: Reshape documents
         *
         * 🤔 WHY aggregation?
         *   - Complex queries not possible with find()
         *   - Processed on DB server (efficient)
         *   - One query instead of multiple
         */
        const stats = await Task.aggregate([
            // Stage 1: Filter by owner
            { $match: { owner: req.userId } },

            // Stage 2: Group by status
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Get overdue count
        const overdue = await Task.countDocuments({
            owner: req.userId,
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' },
        });

        // Format stats object
        const formattedStats = {
            todo: 0,
            'in-progress': 0,
            completed: 0,
            archived: 0,
            overdue,
        };

        stats.forEach((stat) => {
            formattedStats[stat._id] = stat.count;
        });

        res.json({
            success: true,
            data: { stats: formattedStats },
        });
    })
);

/**
 * ============================================
 * GET /api/tasks/:id
 * ============================================
 *
 * 📚 WHAT: Get single task by ID
 *
 * ⚙️ Validates:
 *   - ID format (MongoDB ObjectId)
 *   - Task exists
 *   - User owns the task
 */
router.get(
    '/:id',
    validateObjectId('id'),
    asyncHandler(async (req, res) => {
        const task = await Task.findById(req.params.id);

        if (!task) {
            throw new AppError('Task not found', 404);
        }

        // Check ownership
        if (!checkOwnership(req.userId, task.owner)) {
            throw new AppError('Not authorized to access this task', 403);
        }

        res.json({
            success: true,
            data: { task },
        });
    })
);

/**
 * ============================================
 * POST /api/tasks
 * ============================================
 *
 * 📚 WHAT: Create new task
 *
 * ⚙️ HOW:
 *   1. Validate input
 *   2. Add owner from authenticated user
 *   3. Create task
 *   4. Return created task
 */
router.post(
    '/',
    validateCreateTask,
    asyncHandler(async (req, res) => {
        // Add owner from authenticated user
        req.body.owner = req.userId;

        const task = await Task.create(req.body);

        /**
         * 201 Created status code:
         *   - Successful creation
         *   - Response includes created resource
         */
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: { task },
        });
    })
);

/**
 * ============================================
 * PUT /api/tasks/:id
 * ============================================
 *
 * 📚 WHAT: Update task
 *
 * ⚙️ OPTIONS:
 *   - findByIdAndUpdate: Returns old or new document
 *   - findById + save: Triggers pre-save hooks
 *
 * 🤔 We use findById + save to trigger status change hook
 */
router.put(
    '/:id',
    validateObjectId('id'),
    validateUpdateTask,
    asyncHandler(async (req, res) => {
        const task = await Task.findById(req.params.id);

        if (!task) {
            throw new AppError('Task not found', 404);
        }

        // Check ownership
        if (!checkOwnership(req.userId, task.owner)) {
            throw new AppError('Not authorized to update this task', 403);
        }

        // Update allowed fields
        const allowedUpdates = [
            'title',
            'description',
            'status',
            'priority',
            'dueDate',
            'tags',
            'subtasks',
        ];

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                task[field] = req.body[field];
            }
        });

        // Save triggers pre-save hooks (e.g., set completedAt)
        await task.save();

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: { task },
        });
    })
);

/**
 * ============================================
 * DELETE /api/tasks/:id
 * ============================================
 *
 * 📚 WHAT: Delete task (soft delete)
 *
 * 🤔 Soft delete vs Hard delete:
 *   - Hard: Actually removes from database
 *   - Soft: Marks as deleted, keeps data
 *
 * WHY soft delete?
 *   - Recovery: User can undo
 *   - Audit: Keep history
 *   - References: Other documents might reference it
 */
router.delete(
    '/:id',
    validateObjectId('id'),
    asyncHandler(async (req, res) => {
        const task = await Task.findById(req.params.id);

        if (!task) {
            throw new AppError('Task not found', 404);
        }

        if (!checkOwnership(req.userId, task.owner)) {
            throw new AppError('Not authorized to delete this task', 403);
        }

        // Soft delete
        await task.softDelete();

        /**
         * 204 No Content:
         *   - Successful deletion
         *   - No response body
         *
         * Or 200 with confirmation message (we use this)
         */
        res.json({
            success: true,
            message: 'Task deleted successfully',
        });
    })
);

/**
 * ============================================
 * PATCH /api/tasks/:id/complete
 * ============================================
 *
 * 📚 WHAT: Mark task as complete
 *
 * ⚙️ Uses instance method from model
 */
router.patch(
    '/:id/complete',
    validateObjectId('id'),
    asyncHandler(async (req, res) => {
        const task = await Task.findById(req.params.id);

        if (!task) {
            throw new AppError('Task not found', 404);
        }

        if (!checkOwnership(req.userId, task.owner)) {
            throw new AppError('Not authorized to update this task', 403);
        }

        // Use instance method
        await task.markComplete();

        res.json({
            success: true,
            message: 'Task marked as complete',
            data: { task },
        });
    })
);

/**
 * ============================================
 * POST /api/tasks/:id/subtasks
 * ============================================
 *
 * 📚 WHAT: Add subtask to task
 *
 * ⚙️ CONCEPT: Working with subdocuments
 */
router.post(
    '/:id/subtasks',
    validateObjectId('id'),
    asyncHandler(async (req, res) => {
        const task = await Task.findById(req.params.id);

        if (!task) {
            throw new AppError('Task not found', 404);
        }

        if (!checkOwnership(req.userId, task.owner)) {
            throw new AppError('Not authorized', 403);
        }

        const { title } = req.body;

        if (!title || title.trim().length < 1) {
            throw new AppError('Subtask title is required', 400);
        }

        // Push to subdocument array
        task.subtasks.push({ title: title.trim() });
        await task.save();

        res.status(201).json({
            success: true,
            message: 'Subtask added',
            data: { task },
        });
    })
);

module.exports = router;

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. RESTful: Use nouns, HTTP methods define actions
 * 2. Always check ownership before modify/delete
 * 3. Pagination for list endpoints
 * 4. Aggregation pipeline for complex queries
 * 5. Soft delete for recoverability
 * 6. Use appropriate HTTP status codes
 * 7. Return consistent response format
 *
 * ============================================
 * 📚 BACKEND COMPLETE! Now check the Angular frontend
 * ============================================
 */
