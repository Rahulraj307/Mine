# 📘 MASTER GUIDE: AWS S3 + CloudFront Deployment for Angular SPAs
> **Section 10: Deploying Angular to AWS (The Production Way – 2025)**
> A complete guide to hosting, CDN, HTTPS, and CI/CD for Single Page Applications.

---

## 🎯 Goal

Deploy an Angular application to:
*   **S3**: Cheap, scalable static file storage.
*   **CloudFront**: Global CDN for low-latency delivery & HTTPS.

---

## 🟢 Part 1: Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER (Browser)                             │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS Request (e.g., example.com/dashboard)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CLOUDFRONT (CDN Edge Location)                  │
│  - Caches static assets (JS, CSS, images)                           │
│  - Provides HTTPS via AWS Certificate Manager (ACM)                 │
│  - Custom Error Response: 404 → /index.html (SPA Fix)               │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ Origin Request (if not cached)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          S3 BUCKET (Origin)                         │
│  - Stores the `dist/` folder (index.html, *.js, *.css)              │
│  - Static Website Hosting ENABLED                                   │
│  - Public Access BLOCKED (CloudFront accesses via OAC)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🟡 Part 2: Step-by-Step Setup

### Step 1: Build Your Angular App
```bash
ng build --configuration=production
# Output: dist/<project-name>/browser/
```

### Step 2: Create S3 Bucket
1.  Go to **S3 Console** → **Create Bucket**.
2.  **Bucket Name:** `my-angular-app-prod` (must be globally unique).
3.  **Region:** Choose one close to your primary users.
4.  **Block Public Access:** Keep ON (CloudFront will access it privately).
5.  Create bucket.

### Step 3: Upload Files to S3
*   Upload all contents of `dist/<project-name>/browser/` to the bucket root.
*   **Important:** `index.html` must be at the root level.

### Step 4: Create CloudFront Distribution
1.  Go to **CloudFront Console** → **Create Distribution**.
2.  **Origin Domain:** Select your S3 bucket.
3.  **Origin Access:** Use **Origin Access Control (OAC)** (recommended). CloudFront will create/update the S3 bucket policy for you.
4.  **Viewer Protocol Policy:** **Redirect HTTP to HTTPS**.
5.  **Default Root Object:** `index.html`.
6.  **Custom Error Responses (SPA FIX - CRITICAL):**
    *   HTTP Error Code: `403`
    *   Customize Error Response: Yes
    *   Response Page Path: `/index.html`
    *   HTTP Response Code: `200`
    *   Repeat for `404`.
7.  **Create Distribution.**

> [!IMPORTANT]
> The **Custom Error Response** is essential for SPAs. Without it, navigating directly to `/dashboard` would return a 404 because no `dashboard` file exists. This setting tells CloudFront to serve `index.html` for all routes, allowing Angular Router to handle the path.

### Step 5: Add Custom Domain & HTTPS (Optional)
1.  **Request Certificate** in AWS Certificate Manager (ACM) in **us-east-1** region (required for CloudFront).
2.  **Validate** via DNS (add CNAME record).
3.  In CloudFront Distribution, add **Alternate Domain Name (CNAME)** (e.g., `app.example.com`).
4.  Select your ACM certificate.
5.  In your DNS provider (Route 53, Cloudflare), add a **CNAME** record pointing `app.example.com` to the CloudFront distribution URL (`d1234.cloudfront.net`).

---

## 🔵 Part 3: CI/CD with GitHub Actions

### The Flow
```
Push to main → GitHub Actions → ng build → Upload to S3 → Invalidate CloudFront Cache
```

### `.github/workflows/deploy.yml`
```yaml
name: Deploy to S3 + CloudFront

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Angular App
        run: npm run build -- --configuration=production

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Sync to S3
        run: aws s3 sync dist/<project-name>/browser s3://my-angular-app-prod --delete

      - name: Invalidate CloudFront Cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

> [!NOTE]
> **Cache Invalidation:** After deploying new code, the old `main.js` might be cached at edge locations. The `create-invalidation` command clears the cache, forcing CloudFront to fetch fresh files from S3.

---

## 🔴 Part 4: Interview Q&A

### 1️⃣ Why use CloudFront in front of S3?
**Answer:**
*   **Performance:** CDN caches assets at edge locations globally (low latency).
*   **HTTPS:** S3 static hosting doesn't support HTTPS on custom domains. CloudFront does (via ACM).
*   **Security:** S3 bucket can remain private; only CloudFront can access it via OAC.

### 2️⃣ What is the "SPA Routing Fix"?
**Answer:**
SPAs have a single `index.html`. All routes (`/home`, `/dashboard`) are handled by the client-side router (Angular Router). When a user directly navigates to `/dashboard`, S3/CloudFront looks for a `dashboard` file, which doesn't exist (→ 404). The fix: configure Custom Error Response to return `/index.html` with a `200` status, allowing Angular to handle the route.

### 3️⃣ What is OAC vs OAI?
**Answer:**
*   **OAI (Origin Access Identity):** Legacy method for CloudFront to access private S3. Deprecated.
*   **OAC (Origin Access Control):** Modern, more secure method. Recommended.

### 4️⃣ How do you handle environment-specific configs?
**Answer:**
Angular's `environment.ts` and `environment.prod.ts` files. The `--configuration=production` flag swaps them at build time. For secrets, use AWS Systems Manager Parameter Store or Secrets Manager, fetched at runtime.

### 5️⃣ Describe your deployment pipeline.
**Answer (STAR):**
*   **Trigger:** Push to `main` branch.
*   **Build:** GitHub Actions runs `ng build --prod`, generating `dist/`.
*   **Deploy:** `aws s3 sync` uploads files, `--delete` removes old files.
*   **Invalidate:** `aws cloudfront create-invalidation` clears CDN cache.
*   **Result:** Users see new version within minutes globally.

---

## 🔥 Rapid Fire

*   **S3 Transfer Acceleration?**
    *   Uses CloudFront edge locations for faster uploads to S3. Useful for uploading large files from users far from your S3 region.
*   **`Cache-Control` header?**
    *   Controls how long browsers/CloudFront cache a file. For hashed JS files (`main.abc123.js`), use `max-age=31536000` (1 year). For `index.html`, use `no-cache` (always check).
*   **What is a CDN?**
    *   Content Delivery Network. A network of geographically distributed servers that cache and serve content from locations closer to the user.
