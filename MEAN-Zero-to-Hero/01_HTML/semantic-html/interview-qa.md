# Semantic HTML: Interview Q&A

## Fresher Level (0-2 Years)

### Q1: What is semantic HTML?
**Answer**: Semantic HTML uses tags that describe the meaning of content, not just appearance. Instead of using generic `<div>` and `<span>` everywhere, we use tags like `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>`.

**Why it matters**: Makes code readable, improves accessibility for screen readers, and helps SEO.

---

### Q2: Name 5 semantic tags and their purposes.

| Tag | Purpose |
|-----|---------|
| `<header>` | Introductory content, not just page header |
| `<nav>` | Major navigation blocks |
| `<main>` | Primary content (only ONE per page) |
| `<article>` | Self-contained, distributive content |
| `<footer>` | Footer for section or page |

---

### Q3: What's the difference between `<div>` and `<section>`?

| `<div>` | `<section>` |
|---------|-------------|
| No semantic meaning | Represents thematic grouping |
| Use for styling/layout | Use for content structure |
| Invisible to screen readers | Creates landmark |
| No accessibility impact | Should have a heading |

---

### Q4: Why should we use `<main>` element?

1. **Accessibility**: Skip navigation links can jump directly to main
2. **SEO**: Signals primary content to search engines
3. **Clarity**: Only ONE main per page (enforced rule)
4. **Screen readers**: Announces as "main landmark"

---

## Mid Level (2-4 Years)

### Q5: Explain the accessibility tree.

**Answer**: The browser creates TWO parallel trees:

1. **DOM Tree**: For visual rendering
2. **Accessibility Tree**: For assistive technologies

```
DOM Element          Accessibility Node
────────────         ──────────────────
<button>        →    role: button
                     name: "Click me"
                     state: enabled

<nav>           →    role: navigation
                     (landmark)
```

Semantic elements automatically populate the accessibility tree correctly. Non-semantic elements require manual ARIA attributes.

---

### Q6: When would you use `<article>` vs `<section>`?

**Use `<article>` when:**
- Content makes sense on its own
- Could be syndicated (RSS, shared independently)
- Examples: blog post, comment, product card

**Use `<section>` when:**
- Content is thematically grouped but not independent
- Examples: chapters, tab panels, grouped form sections

**Real decision**:
> "If I pulled this out and put it on another page or in an email, would it make sense alone?"
> - YES → `<article>`
> - NO → `<section>`

---

### Q7: What's wrong with `<div role="button">`?

```html
<!-- ❌ This requires MANUAL implementation -->
<div role="button" tabindex="0" 
     onkeydown="if(event.key==='Enter') click()">
  Click me
</div>

<!-- ✅ This works automatically -->
<button>Click me</button>
```

**Missing from div:**
- Keyboard activation (Enter/Space)
- Focus management
- Form submission integration
- Disabled state handling
- Click event on keyboard

**Button gives you all these for FREE.**

---

### Q8: How do you make a custom component accessible?

```html
<!-- Custom dropdown example -->
<div class="dropdown" 
     role="listbox"
     aria-label="Select country"
     aria-expanded="false"
     tabindex="0">
  <div role="option" aria-selected="true">USA</div>
  <div role="option" aria-selected="false">Canada</div>
</div>
```

**Required additions:**
1. `role` to define what it is
2. `aria-label` for name
3. `tabindex` for keyboard access
4. Keyboard event handlers
5. State management (aria-expanded, aria-selected)

---

## Senior Level (4+ Years)

### Q9: Explain the document outline algorithm.

**History**: HTML5 proposed that each sectioning element (`<article>`, `<section>`, `<nav>`, `<aside>`) would create a new outline scope. This meant you could use `<h1>` in every section and browsers would calculate the correct level.

**Reality**: No browser ever implemented it. Screen readers still rely on explicit heading levels (h1-h6).

**Correct approach today:**
```html
<body>
  <h1>Page Title</h1>         <!-- Level 1 -->
  <section>
    <h2>Section Title</h2>    <!-- Level 2 (explicit) -->
    <section>
      <h3>Subsection</h3>     <!-- Level 3 (explicit) -->
    </section>
  </section>
</body>
```

**Why this matters**: Many developers were taught to use `<h1>` everywhere. This breaks accessibility.

---

### Q10: How does semantic HTML impact SEO at scale?

1. **Crawl Efficiency**: Search engines parse semantic markup faster
2. **Featured Snippets**: `<article>`, `<section>` help identify excerpt-worthy content
3. **Rich Results**: Combined with structured data, semantics improve SERP display
4. **Core Web Vitals**: Cleaner HTML → smaller payload → better LCP

**At scale considerations:**
- Consistent semantic patterns across thousands of pages
- Template-level enforcement (linting rules)
- Migration strategies for legacy `<div>`-based codebases

---

### Q11: How would you audit a large application for semantic HTML issues?

**Automated tools:**
```bash
# axe-core integration
npm install @axe-core/cli
axe http://localhost:3000

# Lighthouse CLI
lighthouse http://localhost:3000 --only-categories=accessibility
```

**Manual process:**
1. Turn off CSS and check if content is readable
2. Navigate using only keyboard (Tab, Enter, Arrows)
3. Use browser DevTools → Accessibility tab → view accessibility tree
4. Test with screen reader (NVDA, VoiceOver)

**At scale:**
- Add semantic HTML linting to CI/CD
- Create component library with built-in semantics
- Code review checklist for accessibility

---

### Q12: What are the trade-offs of over-using semantic elements?

**Too few semantics:**
- Poor accessibility
- SEO impact
- Harder to maintain

**Too many semantics:**
- Verbosity without benefit
- Nested landmarks confuse screen readers
- Harder to style (specificity issues)

**Balance example:**
```html
<!-- ❌ Over-engineered -->
<article>
  <header>
    <section>
      <nav>
        <aside>...</aside>
      </nav>
    </section>
  </header>
</article>

<!-- ✅ Appropriate -->
<article>
  <header>
    <h2>Title</h2>
    <nav>...</nav>
  </header>
  <p>Content</p>
</article>
```

---

## Trick Questions

### Q: Is `<header>` the same as the page header?

**Answer**: No! `<header>` can be used for:
- Page header (most common)
- Article/section header
- Any introductory group of content

Multiple `<header>` elements are valid in a page.

---

### Q: Can you have `<footer>` inside an `<article>`?

**Answer**: Yes! `<footer>` is for closing content of its nearest sectioning ancestor (article, section, etc.), not just the page.

```html
<article>
  <header>...</header>
  <p>Content</p>
  <footer>Author: John | Date: 2024</footer>
</article>
<footer>© Copyright 2024</footer>
```

---

### Q: What's the difference between `<strong>` and `<b>`?

| `<strong>` | `<b>` |
|------------|-------|
| Semantic importance | Purely visual |
| Screen readers announce emphasis | No announcement |
| Use for critical content | Use for stylistic offset |

Same visual default, very different meaning.
