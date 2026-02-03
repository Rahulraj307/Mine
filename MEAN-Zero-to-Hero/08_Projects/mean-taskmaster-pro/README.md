# 🚀 TaskMaster Pro - MEAN Stack Learning Project

> A complete task management application built to teach **every MEAN stack concept** with heavily commented code.

---

## 📚 What You'll Learn

### Backend (Node.js + Express + MongoDB)
| Concept | File | Key Takeaway |
|---------|------|--------------|
| Express middleware chain | `server.js` | Order matters! |
| MongoDB connection | `config/db.js` | Connection pooling |
| Mongoose schemas | `models/User.js` | Validation, virtuals, methods |
| JWT authentication | `middleware/auth.js` | Access + refresh tokens |
| Centralized error handling | `middleware/errorHandler.js` | Async error catching |
| Input validation | `middleware/validate.js` | Never trust user input |
| Security headers | `config/security.js` | Helmet, CORS, rate limiting |
| Password hashing | `models/User.js` | bcrypt with salt |

### Frontend (Angular 17+)
| Concept | File | Key Takeaway |
|---------|------|--------------|
| Standalone components | All components | Modern Angular |
| Signals | `task-list.component.ts` | New reactivity |
| Change detection | Components | OnPush strategy |
| RxJS operators | Services | switchMap, catchError |
| HTTP interceptors | `auth.interceptor.ts` | Auto-attach JWT |
| Route guards | `auth.guard.ts` | Protect routes |
| Lazy loading | `app.routes.ts` | Code splitting |
| Reactive forms | `login.component.ts` | Form validation |

---

## 🏃 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Angular CLI 17+

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Configure your MongoDB URI
npm run dev            # Starts on http://localhost:3000
```

### Frontend Setup
```bash
cd frontend
npm install
ng serve               # Starts on http://localhost:4200
```

---

## 📁 Project Structure

```
mean-taskmaster-pro/
├── backend/
│   ├── server.js           # 🎯 START HERE - Express entry point
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   ├── env.js          # Environment variables
│   │   └── security.js     # Helmet, CORS, rate limit
│   ├── models/
│   │   ├── User.js         # User schema with auth
│   │   └── Task.js         # Task schema
│   ├── routes/
│   │   ├── auth.routes.js  # Login, register, refresh
│   │   └── task.routes.js  # CRUD operations
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── task.controller.js
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   ├── errorHandler.js # Global error handler
│   │   └── validate.js     # Input validation
│   └── utils/
│       └── jwt.js          # Token utilities
│
└── frontend/
    └── src/app/
        ├── core/              # Singleton services
        │   ├── services/
        │   ├── interceptors/
        │   └── guards/
        ├── shared/            # Reusable components
        └── features/          # Feature modules
            ├── auth/
            └── tasks/
```

---

## 🎯 Learning Path

### Week 1: Backend Fundamentals
1. `server.js` → Understand Express setup
2. `config/db.js` → MongoDB connection
3. `models/User.js` → Mongoose schemas
4. `routes/auth.routes.js` → REST API design

### Week 2: Security & Auth
1. `middleware/auth.js` → JWT flow
2. `config/security.js` → Helmet, CORS
3. `middleware/validate.js` → Input validation

### Week 3: Angular Basics
1. `app.component.ts` → Standalone components
2. `auth.service.ts` → HTTP client
3. `login.component.ts` → Reactive forms

### Week 4: Advanced Angular
1. `task-list.component.ts` → Signals + OnPush
2. `auth.interceptor.ts` → HTTP interceptors
3. `auth.guard.ts` → Route protection

---

## 💡 How to Read the Code

Every file contains structured comments:

```typescript
/**
 * ============================================
 * CONCEPT: [Concept Name]
 * LEVEL: Beginner | Intermediate | Advanced
 * ============================================
 * 
 * 📚 WHAT: What this code does
 * ⚙️ HOW: How it works internally
 * 🤔 WHY: Why we use this approach
 * ⚠️ COMMON MISTAKES: What to avoid
 * 💡 INTERVIEW TIP: Related questions
 * ============================================
 */
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | ❌ |
| POST | `/api/auth/login` | Get tokens | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| GET | `/api/tasks` | List all tasks | ✅ |
| POST | `/api/tasks` | Create task | ✅ |
| PUT | `/api/tasks/:id` | Update task | ✅ |
| DELETE | `/api/tasks/:id` | Delete task | ✅ |

---

> 📖 **Start with `backend/server.js`** - it's the entry point and contains the most foundational concepts!
