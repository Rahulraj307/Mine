/**
 * ============================================
 * CONCEPT: Mongoose Schema & Model - Task
 * LEVEL: Beginner → Intermediate
 * ============================================
 *
 * 📚 WHAT: Task schema demonstrating relationships in MongoDB
 *
 * ⚙️ HOW: We reference User documents using ObjectId
 *   - Each task belongs to a user (owner)
 *   - We can "populate" to get full user data
 *
 * 🤔 WHY reference vs embed?
 *
 *   EMBEDDING (store data inside document):
 *   ✅ One query gets all data
 *   ✅ Atomic updates
 *   ❌ Data duplication if shared
 *   ❌ 16MB document limit
 *   Best for: One-to-few, data always accessed together
 *
 *   REFERENCING (store ObjectId, lookup separately):
 *   ✅ No data duplication
 *   ✅ No size limits
 *   ✅ Independent updates
 *   ❌ Multiple queries (populate)
 *   Best for: One-to-many, many-to-many
 *
 * 💡 INTERVIEW TIP: "When to embed vs reference?"
 *   → Embed: Comments on a post (always accessed together)
 *   → Reference: Author of posts (same author, many posts)
 *   → Rule: If data is accessed together 80% of time, embed
 * ============================================
 */

const mongoose = require('mongoose');

/**
 * ============================================
 * Subtask Schema (Embedded Document)
 * ============================================
 *
 * 📚 WHAT: Subtasks are EMBEDDED in task documents
 *
 * 🤔 WHY embed subtasks?
 *   - Always accessed with parent task
 *   - Limited number per task
 *   - No independent existence
 */
const subtaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Subtask title is required'],
        trim: true,
        maxlength: [100, 'Subtask title cannot exceed 100 characters'],
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completedAt: Date,
});

/**
 * Main Task Schema
 */
const taskSchema = new mongoose.Schema(
    {
        /**
         * Task title
         */
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },

        /**
         * Task description (optional)
         */
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },

        /**
         * Status with enum
         */
        status: {
            type: String,
            enum: {
                values: ['todo', 'in-progress', 'completed', 'archived'],
                message: 'Invalid status value',
            },
            default: 'todo',
        },

        /**
         * Priority levels
         */
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },

        /**
         * ============================================
         * CONCEPT: Document References
         * LEVEL: Intermediate
         * ============================================
         *
         * 📚 WHAT: References another collection using ObjectId
         *
         * ⚙️ HOW:
         *   - type: mongoose.Schema.Types.ObjectId → stores ObjectId
         *   - ref: 'User' → tells Mongoose which model to populate from
         *
         * 💡 To get user data: Task.find().populate('owner')
         *   → Mongoose will query User collection
         *   → Replace ObjectId with actual user document
         */
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Task must belong to a user'],
            index: true, // Index for faster queries by owner
        },

        /**
         * ============================================
         * CONCEPT: Embedded Documents (Subdocuments)
         * ============================================
         *
         * 📚 WHAT: Array of subtask documents embedded in task
         *
         * ⚙️ HOW: Each subtask gets its own _id automatically
         *
         * 🤔 WHY: Subtasks always accessed with parent, limited count
         */
        subtasks: [subtaskSchema],

        /**
         * Tags as simple array
         */
        tags: {
            type: [String],
            validate: {
                validator: function (tags) {
                    return tags.length <= 5;
                },
                message: 'Cannot have more than 5 tags',
            },
        },

        /**
         * Due date with validation
         */
        dueDate: {
            type: Date,
            validate: {
                validator: function (date) {
                    // Only validate if date is provided and task is new
                    if (this.isNew && date) {
                        return date > new Date();
                    }
                    return true;
                },
                message: 'Due date must be in the future',
            },
        },

        /**
         * Completion tracking
         */
        completedAt: Date,

        /**
         * Soft delete
         * Instead of deleting, we mark as deleted
         * This preserves data for auditing
         */
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },
        deletedAt: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt

        // Include virtuals when converting to JSON
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

/**
 * ============================================
 * CONCEPT: Compound Indexes
 * LEVEL: Intermediate → Advanced
 * ============================================
 *
 * 📚 WHAT: Index on multiple fields
 *
 * ⚙️ HOW: Speeds up queries that filter by both fields
 *
 * 🤔 WHY: Common query patterns:
 *   - Find tasks by owner + status
 *   - Find tasks by owner + priority
 *
 * ⚠️ Order matters!
 *   - { owner: 1, status: 1 } helps: owner=X, status=Y
 *   - Does NOT help efficiently: status=Y only
 */
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });

/**
 * ============================================
 * CONCEPT: Virtual Population
 * LEVEL: Advanced
 * ============================================
 *
 * 📚 WHAT: Compute completion percentage from subtasks
 */
taskSchema.virtual('completionPercentage').get(function () {
    if (!this.subtasks || this.subtasks.length === 0) {
        return this.status === 'completed' ? 100 : 0;
    }

    const completedCount = this.subtasks.filter((st) => st.completed).length;
    return Math.round((completedCount / this.subtasks.length) * 100);
});

/**
 * ============================================
 * CONCEPT: Virtual for "is overdue"
 * ============================================
 */
taskSchema.virtual('isOverdue').get(function () {
    if (!this.dueDate || this.status === 'completed') {
        return false;
    }
    return new Date() > this.dueDate;
});

/**
 * ============================================
 * CONCEPT: Pre-save Middleware
 * ============================================
 *
 * Set completedAt when status changes to completed
 */
taskSchema.pre('save', function (next) {
    // If status changed to completed, set completedAt
    if (this.isModified('status') && this.status === 'completed') {
        this.completedAt = new Date();
    }

    // If status changed from completed, clear completedAt
    if (
        this.isModified('status') &&
        this.status !== 'completed' &&
        this.completedAt
    ) {
        this.completedAt = undefined;
    }

    next();
});

/**
 * ============================================
 * CONCEPT: Query Middleware
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Middleware that runs on queries (find, findOne, etc.)
 *
 * ⚙️ HOW: Automatically exclude soft-deleted documents
 *
 * 🤔 WHY: Don't want deleted tasks showing up in normal queries
 */
taskSchema.pre(/^find/, function (next) {
    // 'this' points to the current query
    // Only show non-deleted tasks by default
    this.find({ isDeleted: { $ne: true } });
    next();
});

/**
 * ============================================
 * CONCEPT: Instance Methods
 * ============================================
 */

// Soft delete a task
taskSchema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};

// Mark task as complete
taskSchema.methods.markComplete = function () {
    this.status = 'completed';
    this.completedAt = new Date();

    // Also mark all subtasks as complete
    this.subtasks.forEach((subtask) => {
        subtask.completed = true;
        subtask.completedAt = new Date();
    });

    return this.save();
};

/**
 * ============================================
 * CONCEPT: Static Methods
 * ============================================
 */

// Find tasks by owner with filtering
taskSchema.statics.findByOwner = function (ownerId, filters = {}) {
    const query = { owner: ownerId };

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.priority) {
        query.priority = filters.priority;
    }

    return this.find(query).sort({ dueDate: 1, priority: -1 });
};

// Get task statistics for a user
taskSchema.statics.getStats = async function (ownerId) {
    const stats = await this.aggregate([
        { $match: { owner: ownerId, isDeleted: { $ne: true } } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    // Convert array to object
    return stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
    }, {});
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. EMBED: One-to-few, always accessed together
 * 2. REFERENCE: One-to-many, independent updates
 * 3. Compound indexes for common query patterns
 * 4. Virtuals for computed properties
 * 5. Query middleware for automatic filtering
 * 6. Soft delete instead of hard delete
 * 7. Static methods for complex queries
 *
 * ============================================
 * 📚 NEXT: Check out ./routes/auth.routes.js for API routes
 * ============================================
 */
