# TaskMaster Pro - Implementation Plan

## Overview

A full-stack MEAN (MongoDB, Express, Angular, Node.js) task management application designed as a comprehensive learning resource with heavily documented code.

---

## Project Goals

1. **Functional App**: Working task manager with auth and CRUD
2. **Learning Resource**: Every file has detailed comments explaining concepts
3. **Modern Stack**: Angular 17+ (Signals, standalone), Node.js, MongoDB
4. **Security Best Practices**: JWT, bcrypt, Helmet, rate limiting

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Angular 17+)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Components │  │   Services  │  │     Interceptors    │  │
│  │  (Standalone)│  │  (Signals)  │  │    (Functional)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP/REST
                              │
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Express   │  │  Middleware │  │       Routes        │  │
│  │   Server    │  │ (Auth/Err)  │  │    (Auth/Tasks)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                          Mongoose
                              │
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE (MongoDB)                       │
│           Users Collection    │    Tasks Collection          │
└─────────────────────────────────────────────────────────────┘
```

---

## Concepts Covered

### Backend
- Express middleware chain
- MongoDB with Mongoose
- JWT authentication (access + refresh)
- Password hashing (bcrypt)
- Security headers (Helmet)
- CORS configuration
- Rate limiting
- Input validation
- Error handling patterns
- RESTful API design

### Frontend
- Angular 17+ standalone components
- Signals for state management
- Functional interceptors
- Functional route guards
- Reactive forms
- New @if/@for control flow
- inject() dependency injection
- RxJS operators
- HTTP client

---

## File Structure

```
mean-taskmaster-pro/
├── README.md                   # Project overview & learning guide
├── IMPLEMENTATION_PLAN.md      # This file
├── WALKTHROUGH.md              # Summary of what was built
│
├── backend/
│   ├── server.js               # Express entry point
│   ├── package.json            # Dependencies
│   ├── .env.example            # Environment variables
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── security.js         # Helmet, CORS, rate limit
│   ├── models/
│   │   ├── User.js             # User schema + bcrypt
│   │   └── Task.js             # Task schema + subtasks
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   ├── errorHandler.js     # Error handling
│   │   └── validate.js         # Input validation
│   ├── routes/
│   │   ├── auth.routes.js      # Login, register, refresh
│   │   └── task.routes.js      # CRUD operations
│   └── utils/
│       └── jwt.js              # Token generation/verification
│
└── frontend/
    ├── angular.json
    ├── package.json
    └── src/
        ├── main.ts             # Bootstrap with providers
        ├── styles.css          # Global styles
        └── app/
            ├── app.component.ts
            ├── app.routes.ts
            ├── core/
            │   ├── services/
            │   │   ├── auth.service.ts
            │   │   └── task.service.ts
            │   ├── interceptors/
            │   │   └── auth.interceptor.ts
            │   └── guards/
            │       └── auth.guard.ts
            └── features/
                ├── auth/
                │   ├── login/
                │   └── register/
                ├── tasks/
                │   ├── task-list/
                │   └── task-form/
                └── not-found/
```

---

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Edit with your MongoDB URI
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/refresh` | ❌ | Refresh tokens |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/tasks` | ✅ | List tasks |
| GET | `/api/tasks/stats` | ✅ | Task stats |
| GET | `/api/tasks/:id` | ✅ | Single task |
| POST | `/api/tasks` | ✅ | Create task |
| PUT | `/api/tasks/:id` | ✅ | Update task |
| DELETE | `/api/tasks/:id` | ✅ | Delete task |
| PATCH | `/api/tasks/:id/complete` | ✅ | Complete task |

---

## Code Comment Style

Every file follows this pattern:
```javascript
/**
 * ============================================
 * CONCEPT: [Topic Name]
 * LEVEL: Beginner → Advanced
 * ============================================
 *
 * 📚 WHAT: What this code does
 * ⚙️ HOW: Technical implementation
 * 🤔 WHY: Design decisions
 * ⚠️ COMMON MISTAKES: Pitfalls to avoid
 * 💡 INTERVIEW TIP: Related questions
 * ============================================
 */
```
