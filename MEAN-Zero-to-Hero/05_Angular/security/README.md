# Angular Security (XSS, CSP, DomSanitizer)

> **Goal**: Understand Angular's built-in security and how to avoid common vulnerabilities.

---

## 1️⃣ Angular's Built-in XSS Protection

Angular **automatically sanitizes** values bound to the DOM to prevent Cross-Site Scripting (XSS) attacks.

### What Angular Sanitizes:
*   `innerHTML`
*   `src` (for iframes, images)
*   `href` (for links)
*   `style` bindings

### Example:
```typescript
// component.ts
userInput = '<script>alert("XSS!")</script><b>Hello</b>';
```
```html
<!-- template.html -->
<div [innerHTML]="userInput"></div>
<!-- Rendered: <b>Hello</b> (script tag is stripped) -->
```

---

## 2️⃣ DomSanitizer (When You MUST Trust Content)

Sometimes you need to render trusted HTML/URLs (e.g., from your own CMS).

**Methods:**
*   `bypassSecurityTrustHtml(value)`: For HTML.
*   `bypassSecurityTrustUrl(value)`: For URLs (href, src).
*   `bypassSecurityTrustResourceUrl(value)`: For iframes, videos.
*   `bypassSecurityTrustScript(value)`: For scripts (**Avoid!**).
*   `bypassSecurityTrustStyle(value)`: For CSS.

```typescript
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

constructor(private sanitizer: DomSanitizer) {}

trustedHtml: SafeHtml;

ngOnInit() {
  const rawHtml = '<iframe src="https://trusted-source.com"></iframe>';
  this.trustedHtml = this.sanitizer.bypassSecurityTrustHtml(rawHtml);
}
```

> [!CAUTION]
> **ONLY use `bypassSecurityTrust*` with content you 100% control.** Never use it with user input!

---

## 3️⃣ Content Security Policy (CSP)

CSP is an HTTP header that restricts where resources (scripts, styles, images) can be loaded from.

**Example Header:**
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
```

### Angular Considerations:
*   Angular CLI's production build generates inline styles for components. You may need `'unsafe-inline'` for `style-src`, or configure Angular to use external styles.
*   Use `nonce` attributes for inline scripts if needed.

---

## 4️⃣ Common Security Mistakes

1.  **Using `bypassSecurityTrust*` on user input.**
    *   **Fix:** Never trust user input.
2.  **Interpolating user input into `href` for `javascript:` URLs.**
    *   **Example:** `<a [href]="userInput">` where `userInput = 'javascript:alert(1)'`.
    *   **Fix:** Angular sanitizes this by default. Don't bypass it.
3.  **Using `ElementRef.nativeElement` for direct DOM manipulation.**
    *   **Fix:** Use Angular's Renderer2 service instead.

---

## 5️⃣ Best Practices

1.  **Rely on Angular's Default Sanitization.**
2.  **If you must bypass, create a dedicated Pipe** and document its usage.
3.  **Implement CSP Headers** on your server/CDN.
4.  **Validate all user input** on the **backend**, not just the frontend.
5.  **Use `HttpOnly` and `Secure` flags** for auth cookies.
