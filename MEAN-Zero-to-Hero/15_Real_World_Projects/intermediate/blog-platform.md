# Intermediate Project: Full-Stack Blog Platform

> Build a complete MEAN stack blog with authentication and CRUD.

---

## 🎯 What You'll Learn

- Full MEAN stack integration
- JWT authentication
- REST API design
- MongoDB schema design
- Angular routing & guards
- State management with services

---

## 📋 Features

- [ ] User registration & login
- [ ] Create, edit, delete posts
- [ ] Rich text editor
- [ ] Categories and tags
- [ ] Comments
- [ ] User profiles
- [ ] Image uploads

---

## 🏗️ Architecture

```
blog-platform/
├── client/                 # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # Auth, guards, interceptors
│   │   │   ├── shared/     # Reusable components
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── posts/
│   │   │   │   └── profile/
│   │   │   └── app.routes.ts
│   │   └── environments/
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── app.js
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Schema

```javascript
// User Model
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  avatar: String,
  bio: String,
  createdAt: { type: Date, default: Date.now }
});

// Post Model
const postSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: String,
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: String,
  tags: [String],
  coverImage: String,
  published: { type: Boolean, default: false },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Comment Model
const commentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
```

---

## 🔌 API Design

```
Authentication
──────────────
POST   /api/auth/register    → Create account
POST   /api/auth/login       → Get JWT token
GET    /api/auth/me          → Get current user
POST   /api/auth/refresh     → Refresh token

Posts
─────
GET    /api/posts            → List published posts
GET    /api/posts/:slug      → Get single post
POST   /api/posts            → Create post (auth)
PUT    /api/posts/:id        → Update post (auth, owner)
DELETE /api/posts/:id        → Delete post (auth, owner)
GET    /api/users/:id/posts  → User's posts

Comments
────────
GET    /api/posts/:id/comments   → List comments
POST   /api/posts/:id/comments   → Add comment (auth)
DELETE /api/comments/:id         → Delete comment (auth, owner)
```

---

## 📝 Backend Implementation

### Server Setup

```javascript
// server/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
```

### Auth Controller

```javascript
// server/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name
    });
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### Auth Middleware

```javascript
// server/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 📝 Frontend Implementation

### Auth Service

```typescript
// client/src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = '/api/auth';
  private userSubject = new BehaviorSubject<User | null>(null);
  
  user$ = this.userSubject.asObservable();
  isLoggedIn$ = this.user$.pipe(map(user => !!user));
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkStoredAuth();
  }
  
  private checkStoredAuth(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.userSubject.next(JSON.parse(user));
    }
  }
  
  register(data: { email: string; password: string; name: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => this.handleAuth(response))
    );
  }
  
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password }).pipe(
      tap(response => this.handleAuth(response))
    );
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  private handleAuth(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
```

### Auth Interceptor

```typescript
// client/src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
```

### Auth Guard

```typescript
// client/src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.isLoggedIn$.pipe(
    map(isLoggedIn => {
      if (!isLoggedIn) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};
```

---

## 🚀 Deployment

### Backend (Railway/Render)

```yaml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"

[[services]]
name = "blog-api"
port = 3000
```

### Frontend (Vercel/Netlify)

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🎯 Challenges to Extend

1. **Markdown editor:** Replace textarea with rich editor
2. **Search:** Full-text search with MongoDB Atlas
3. **Social sharing:** Share buttons, OG meta tags
4. **Analytics:** Track post views
5. **Email notifications:** New comments, followers

---

**Next**: [Advanced Projects](../advanced/)
