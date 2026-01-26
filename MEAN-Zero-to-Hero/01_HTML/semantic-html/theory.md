# Semantic HTML

## 📚 Table of Contents
- [Beginner: What is Semantic HTML?](#beginner-what-is-semantic-html)
- [Intermediate: How Semantics Work](#intermediate-how-semantics-work)
- [Advanced: Document Outline & Edge Cases](#advanced-document-outline--edge-cases)

---

## Beginner: What is Semantic HTML?

### Definition
Semantic HTML uses tags that **describe their content's meaning**, not just appearance.

### Non-Semantic vs Semantic

```html
<!-- ❌ Non-semantic: What is this div? -->
<div class="header">
  <div class="nav">
    <div class="nav-item">Home</div>
  </div>
</div>

<!-- ✅ Semantic: Self-documenting structure -->
<header>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>
```

### Core Semantic Tags

| Tag | Purpose | Use When |
|-----|---------|----------|
| `<header>` | Introductory content | Top of page/section |
| `<nav>` | Navigation links | Main menus, breadcrumbs |
| `<main>` | Primary content | Only ONE per page |
| `<article>` | Self-contained content | Blog posts, cards |
| `<section>` | Thematic grouping | Chapters, tabs |
| `<aside>` | Tangentially related | Sidebars, callouts |
| `<footer>` | Closing content | Copyright, links |

### Why It Matters
1. **Screen Readers**: Navigate by landmarks
2. **SEO**: Search engines understand content
3. **Maintainability**: Developers read faster
4. **Accessibility**: Required for WCAG compliance

---

## Intermediate: How Semantics Work

### The Accessibility Tree

Browsers build TWO trees:
1. **DOM Tree**: For rendering
2. **Accessibility Tree**: For assistive tech

```
DOM                    Accessibility Tree
─────                  ──────────────────
<div>                  (ignored)
<header>        →      banner landmark
<nav>           →      navigation landmark
<main>          →      main landmark
<button>        →      button role
```

### Implicit vs Explicit Roles

Every semantic element has an **implicit ARIA role**:

```html
<!-- These are IDENTICAL to assistive tech -->
<nav>...</nav>
<div role="navigation">...</div>

<!-- But NAV is better because: -->
<!-- 1. Less code -->
<!-- 2. Harder to mess up -->
<!-- 3. Built-in keyboard handling -->
```

### Sectioning Content Rules

```html
<!-- Each sectioning element creates a NEW outline -->
<article>
  <h1>Article Title</h1>        <!-- Outline level 1 -->
  <section>
    <h2>Section Title</h2>      <!-- Outline level 2 -->
    <section>
      <h3>Subsection</h3>       <!-- Outline level 3 -->
    </section>
  </section>
</article>
```

### Common Mistakes

```html
<!-- ❌ WRONG: Multiple <main> elements -->
<main>Content 1</main>
<main>Content 2</main>

<!-- ❌ WRONG: Nav for non-navigation -->
<nav>
  <p>Just some text</p>  <!-- Not navigation! -->
</nav>

<!-- ❌ WRONG: Section without heading -->
<section>
  <p>Content without heading</p>  <!-- Accessibility issue -->
</section>
```

---

## Advanced: Document Outline & Edge Cases

### The Document Outline Algorithm (Deprecated but Important)

The HTML5 outline algorithm was **never implemented** by browsers, but understanding it helps:

```html
<!-- Theory: headings restart in sections -->
<body>
  <h1>Page Title</h1>
  <section>
    <h1>Section Title</h1>  <!-- Would be h2 in outline -->
  </section>
</body>

<!-- Reality: Use explicit heading levels -->
<body>
  <h1>Page Title</h1>
  <section>
    <h2>Section Title</h2>  <!-- Correct approach -->
  </section>
</body>
```

### When to Use `<article>` vs `<section>`

**Decision tree:**

```
Is the content self-contained and independently distributable?
├── YES → Use <article>
│         (blog post, comment, product card)
└── NO → Is it a thematic grouping?
         ├── YES → Use <section>
         │         (chapter, tab panel)
         └── NO → Use <div>
                  (purely for styling)
```

### Edge Cases

#### Nested Articles
```html
<!-- Valid: Comments inside a blog post -->
<article class="blog-post">
  <h1>Post Title</h1>
  <p>Post content...</p>
  
  <section class="comments">
    <article class="comment">  <!-- Article inside article -->
      <p>Comment text</p>
    </article>
  </section>
</article>
```

#### Header in Non-Header Position
```html
<!-- Valid but unusual: header inside article -->
<article>
  <header>
    <h2>Article Title</h2>
    <time>Jan 2024</time>
  </header>
  <p>Content...</p>
  <footer>Author info</footer>
</article>
```

### Performance Impact

Semantic HTML has **no direct performance impact**, but:

1. **Smaller HTML** = faster parsing
2. **No role attributes needed** = smaller file size
3. **Better accessibility** = legal compliance (business impact)

---

## 🎯 Interview Questions

### Fresher Level
1. What is semantic HTML? Name 5 semantic tags.
2. What's the difference between `<div>` and `<section>`?
3. Why should we use `<main>`?

### Mid Level
1. Explain the accessibility tree.
2. When would you use `<article>` vs `<section>`?
3. What's wrong with using `<div role="button">` instead of `<button>`?

### Senior Level
1. Explain the document outline algorithm and why it was abandoned.
2. How does semantic HTML impact SEO at scale?
3. How would you audit a large application for semantic HTML issues?

---

**Next**: [Accessibility (WCAG & ARIA)](../accessibility/)
