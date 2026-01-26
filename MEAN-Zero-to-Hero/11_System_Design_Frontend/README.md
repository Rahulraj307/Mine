# 11 System Design: Frontend & Full Stack

> **Goal**: Designing Scalable Systems, Component Hierarchy, and Data Flow.

---

## 1️⃣ Concept Explanation

### Frontend System Design (RADIO)
- **R**equirements: Functional (What it does) & Non-Functional (Performance, A11y).
- **A**rchitecture: Monolith vs Micro-frontend, SPA vs SSR.
- **D**ata Model: State shape, API contracts, Normalization.
- **I**nterface: Component Tree, Atomic Design.
- **O**ptimization: Bundle size, Caching, UX.

---

## 2️⃣ Architecture Patterns

### Atomic Design
breaking UI into:
1.  **Atoms**: Label, Input, Button.
2.  **Molecules**: Search Form (Label + Input + Button).
3.  **Organisms**: Header (Logo + Nav + Search Form).
4.  **Templates**: Wireframe layout.
5.  **Pages**: Real instance with content.

### Backend for Frontend (BFF)
A dedicated API server for the UI.
- Aggregates multiple microservice calls.
- Formats data specifically for the View.
- Hides complex backend logic.

---

## 3️⃣ Case Study: Designing "Instagram Feed"

### 1. Requirements
- Infinite Scroll.
- Real-time Likes.
- Offline support.

### 2. Data Model (Normalized)
```typescript
interface State {
  posts: { [id: string]: Post }; // Hash map for O(1) lookup
  feed: string[]; // Array of IDs [1, 2, 3]
  users: { [id: string]: User };
}
```

### 3. Optimization
- **Virtual Scroll**: Only render DOM nodes visible in viewport (cdk-virtual-scroll).
- **Optimistic UI**: When "Reacting", turn heart red *immediately* (local state), then send API request. If fail, revert.
- **Image CDN**: `img.cdn.com/post1.jpg?width=400` (Resize on fly).

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- **God Objects**: One state object holding everything un-normalized.
- **Tight Coupling**: UI Components querying API directly (Hard to test).

### ⚠️ Production Mistakes
- **Chatty Apps**: Making 50 API calls on load. (Solution: GraphQL or BFF to aggregate).
- **State De-sync**: Local state disagreeing with Server state. (Solution: Single Source of Truth).

---

## 5️⃣ Best Practices

### API Contract
- Define Types/Interfaces shared between Backend and Frontend (Monorepo or Swagger Codegen).
- Version your APIs (`/v1/`).

### Offline First
- Use **Service Workers** to cache App Shell.
- Use **IndexedDB** to store feed data for offline viewing.

---

## 6️⃣ Interview QnA

### Intermediate
**Q: SSO vs Token?**
A: SSO (Single Sign On) is a user experience (Log in once for Google/Gmail/Drive). Tokens (OIDC/SAML) are the technical mechanism to implement it.

### Senior
**Q: Design a Real-Time Notification System.**
- **Protocol**: WebSockets (Socket.io) or Server Sent Events (SSE).
- **Scale**: Redis Pub/Sub to distribute messages across multiple API servers.
- **Client**: Angular Service buffers messages to avoid UI spam.

---

## 7️⃣ Web References

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Frontend System Design](https://www.greatfrontend.com/system-design)
