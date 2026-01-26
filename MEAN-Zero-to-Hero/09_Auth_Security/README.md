# 09 Auth & Security: Fortress Building

> **Goal**: Master JWT, OAuth2, CORS, and XSS/CSRF Prevention.

---

## 1️⃣ Concept Explanation

### Authentication vs Authorization
- **Authentication (AuthN)**: Who are you? (Login, ID Card).
- **Authorization (AuthZ)**: What can you do? (Permissions, Access Level).

### JWT (JSON Web Token)
Stateless authentication. The server signs a token, and the client stores it.
- **Header**: Algorithm used.
- **Payload**: Data (User ID, Expiry).
- **Signature**: Verifies the token wasn't tampered with.

---

## 2️⃣ Code Examples

### ❌ Bad Example (Storing JWT in LocalStorage)
```javascript
// Vulnerable to XSS
localStorage.setItem('token', jwt);
const token = localStorage.getItem('token');
```

### ✅ Good Example (HttpOnly Cookies)
```javascript
// Server-side (Express)
res.cookie('jwt', token, {
    httpOnly: true, // JS cannot read this
    secure: true,   // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 3600000
});
```

---

## 3️⃣ Internal Working: The Handshake

1.  **Client**: Sends Credentials (User/Pass).
2.  **Server**: Validates DB -> Creates JWT (Signs with Secret) -> Sends Cookie.
3.  **Client**: Auto-sends Cookie on subsequent requests.
4.  **Server**: Middleware checks Cookie -> Verifies Signature -> Extracts User -> Calls `next()`.

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- **Hardcoded Secrets**: `const secret = '123456';` (Commit to keys to Git). Use `.env`!
- **No Expiry**: Tokens that live forever are dangerous if stolen.

### ⚠️ Production Mistakes
- **CSRF Ignorance**: Relying on Cookies without CSRF tokens (if not using SameSite: Strict).
- **Broken Access Control**: Checking `if (user.role === 'admin')` in the Client only. **ALWAYS** check in the Backend.

---

## 5️⃣ Optimization & Best Practices

### Security Headers
Use **Helmet.js** to set:
- `Content-Security-Policy` (Prevents XSS).
- `X-Frame-Options` (Prevents Clickjacking).
- `Strict-Transport-Security` (Force HTTPS).

### Refresh Tokens
- **Access Token**: Short life (15 mins). Stored in memory or httpOnly cookie.
- **Refresh Token**: Long life (7 days). Stored in httpOnly cookie (path restricted). Used to get new Access Tokens.

---

## 6️⃣ Interview QnA

### Beginner
**Q: Difference between SHA-256 (Hashing) and Encryption?**
A: Hashing is one-way (cannot be reversed). Encryption is two-way (can be decrypted with a key). Passwords should be Hashed.

### Intermediate
**Q: How does CORS protect you?**
A: **It doesn't.** CORS protects the *User* from a malicious site reading data from your API. It does NOT protect your API (Postman/cURL can still call it).

### Scenario-Based
**Q: A user reports their account was hacked. What do you do?**
A:
1.  Invalidate all existing Refresh Tokens for that user (Revocation).
2.  Force logout.
3.  Require password reset.
4.  Check logs for suspicious IPs.

---

## 7️⃣ Web References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT.io Debugger](https://jwt.io/)
