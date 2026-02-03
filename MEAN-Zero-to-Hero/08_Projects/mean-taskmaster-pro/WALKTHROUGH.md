# TaskMaster Pro - Walkthrough

## Overview

A complete MEAN stack task management application with heavily documented code, created as a learning resource.

---

## What Was Built

### Backend (Node.js + Express + MongoDB)

| File | Concepts |
|------|----------|
| `server.js` | Express middleware chain, async error handling |
| `config/db.js` | MongoDB connection, pooling, graceful shutdown |
| `config/security.js` | Helmet, CORS, rate limiting |
| `models/User.js` | Mongoose schema, bcrypt hashing, virtuals |
| `models/Task.js` | Embedded documents, references, soft delete |
| `utils/jwt.js` | Access/refresh token pattern |
| `middleware/auth.js` | Route protection, role-based access |
| `middleware/errorHandler.js` | Centralized error handling, async wrapper |
| `middleware/validate.js` | express-validator schemas |
| `routes/auth.routes.js` | Login, register, token refresh |
| `routes/task.routes.js` | CRUD, pagination, aggregation |

### Frontend (Angular 17+)

| File | Concepts |
|------|----------|
| `main.ts` | Standalone bootstrap, providers |
| `app.component.ts` | Root component, inject(), @if/@for |
| `app.routes.ts` | Lazy loading, route guards |
| `auth.service.ts` | Signals, computed, token management |
| `task.service.ts` | RxJS operators, Signal caching |
| `auth.interceptor.ts` | Functional HTTP interceptor |
| `auth.guard.ts` | Functional route guards |
| `login.component.ts` | Reactive forms, validation |
| `register.component.ts` | Custom validators |
| `task-list.component.ts` | Filtering, pagination, stats |
| `task-form.component.ts` | FormArray, route params |

---

## Key Features

### Authentication
- JWT with access (15m) and refresh (7d) tokens
- Token rotation on refresh
- Password hashing with bcrypt (10 salt rounds)
- Automatic token refresh in interceptor

### Security
- Helmet for security headers
- CORS with origin whitelist
- Rate limiting (100 req/15min, stricter for auth)
- Input validation and sanitization

### Task Management
- Full CRUD operations
- Pagination and filtering
- Priority and status tracking
- Subtasks (embedded documents)
- Soft delete pattern
- Aggregation for statistics

### Angular Modern Features
- Standalone components (no NgModule)
- Signals for reactive state
- New @if/@for control flow
- Functional interceptors and guards
- inject() function for DI

---

## Code Quality

Every file includes:
- 📚 **WHAT**: What the code does
- ⚙️ **HOW**: Technical implementation
- 🤔 **WHY**: Design decisions
- ⚠️ **COMMON MISTAKES**: Pitfalls to avoid
- 💡 **INTERVIEW TIP**: Related questions

---

## Running the Project

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Add your MongoDB URI
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

Then open http://localhost:4200

---

## Files Created

- **Backend**: 12 files
- **Frontend**: 13 files
- **Documentation**: 3 files (README, IMPLEMENTATION_PLAN, WALKTHROUGH)
- **Total**: 28 files
