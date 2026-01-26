# 01 HTML: The Structural Foundation

> **Goal**: Master Semantic HTML, Accessibility (a11y), and SEO. Stop writing "div soup".

---

## 1️⃣ Concept Explanation

### What is Semantic HTML?
Semantic HTML means using elements that clearly describe their meaning to both the browser and the developer (e.g., `<header>`, `<article>`, `<footer>`) rather than generic containers (like `<div>`).

### Why it exists
1.  **Accessibility**: Screen readers rely on tags to navigate content.
2.  **SEO**: Search engines rank pages better when they understand the content hierarchy.
3.  **Maintainability**: Easier to read `<footer>` than `<div class="footer">`.

---

## 2️⃣ Code Examples

### ❌ Bad Example ("Div Soup")
```html
<div class="header">
  <div class="logo">My Site</div>
  <div class="nav">
    <div class="link">Home</div>
  </div>
</div>
<div class="content">
  <div class="article">...</div
</div>
```

### ✅ Good Example (Semantic)
```html
<header>
  <h1>My Site</h1>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h2>Blog Post Title</h2>
    <p>Content...</p>
  </article>
</main>
```

---

## 3️⃣ Internal Working: The DOM Tree

When a browser loads HTML:
1.  **Bytes to Characters**: Reads raw bytes and converts them based on encoding (UTF-8).
2.  **Tokenization**: Converts strings into tokens (StartTag: `html`, StartTag: `body`).
3.  **Lexing/Parsing**: Constructs the **DOM Tree** (Document Object Model).
4.  **Render Tree**: Combines DOM + CSSOM to paint pixels.

> **Note**: Malformed HTML (unclosed tags) forces the browser to "guess" the fix, which impacts performance.

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- Using `<b>` instead of `<strong>` (Style vs Semantics).
- Multiple `<h1>` tags on a single page (though allowed, bad for structure/SEO).
- Missing `alt` text on images.

### ⚠️ Production Mistakes
- **Skipping Heading Levels**: Jumping from `h1` to `h3`.
- **Button vs Link**: Using `<div>` with `onclick` instead of `<button>` or `<a>`.
    - *Rule*: Use `<a>` to go somewhere, `<button>` to do something.
- **Form Labels**: Not connecting `<label for="id">` to `<input id="id">`.

---

## 5️⃣ Optimization & Best Practices

### Performance
- **Script Loading**:
    - `<script src="...">`: Blocks parsing.
    - `<script defer src="...">`: Downloads in parallel, runs after HTML parsing (Best for app bundles).
    - `<script async src="...">`: Downloads in parallel, runs immediately when loaded (Best for analytics).
- **Image Optimization**: Use `loading="lazy"` on below-the-fold images.
- **Preloading**: `<link rel="preload">` for critical assets.

### Accessibility (a11y)
- **Landmarks**: Use `<main>`, `<nav>`, `<aside>` so users can skip content.
- **Focus Management**: Ensure all interactive elements are focusable via keyboard (`Tab` key).

---

## 6️⃣ Interview QnA

### Beginner
**Q: What is the `<!DOCTYPE html>` for?**
A: It tells the browser to render the page in "Standard Mode" rather than "Quirks Mode".

**Q: Explain `data-` attributes.**
A: They allow us to store custom data on elements, accessible via CSS (`attr()`) or JS (`dataset`).

### Intermediate
**Q: What is the difference between `defer` and `async`?**
A: `async` executes as soon as downloaded (pausing HTML parsing if not done). `defer` executes only after HTML parsing is complete.

**Q: Why use `<picture>` over `<img>`?**
A: `<picture>` allows art direction (different images for different screen sizes/formats like WebP).

### Scenario-Based
**Q: You have a button that looks like a link. Which tag do you use?**
A: If it navigates to a URL, use `<a>` and style it like a button. If it triggers an action (like a modal), use `<button>` and style it like a link. Using the wrong tag breaks accessibility.

---

## 7️⃣ Web References

- [MDN HTML Elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)
- [HTML5 Sectioning](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML_sections_and_outlines)
- [WCAG Checklist](https://www.a11yproject.com/checklist/)
- [Google Web Fundamentals - Semantics](https://developers.google.com/web/fundamentals/accessibility/semantics-builtin)
