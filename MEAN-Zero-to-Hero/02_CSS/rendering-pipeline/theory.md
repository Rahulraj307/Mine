# CSS Rendering Pipeline

## 📚 Table of Contents
- [Beginner: How Browsers Render Pages](#beginner-how-browsers-render-pages)
- [Intermediate: Reflow vs Repaint](#intermediate-reflow-vs-repaint)
- [Advanced: Critical Rendering Path Optimization](#advanced-critical-rendering-path-optimization)

---

## Beginner: How Browsers Render Pages

### The Basic Flow

```
HTML → DOM Tree → Render Tree → Layout → Paint → Composite
        ↓
      CSSOM
```

### Step by Step

1. **Parse HTML** → Build DOM (Document Object Model)
2. **Parse CSS** → Build CSSOM (CSS Object Model)
3. **Combine** → Create Render Tree (visible elements only)
4. **Layout** → Calculate positions and sizes
5. **Paint** → Fill in pixels (colors, images, text)
6. **Composite** → Layer and display

### What Triggers Each Step

```css
/* Layout triggers (EXPENSIVE) */
width, height, margin, padding
position, display, float
font-size, font-family

/* Paint triggers (MODERATE) */
color, background, border
box-shadow, outline
visibility

/* Composite only (CHEAP) */
transform, opacity
```

---

## Intermediate: Reflow vs Repaint

### Reflow (Layout)

**What**: Browser recalculates positions and dimensions of elements.

**Triggered by**:
```javascript
// Reading layout properties
element.offsetHeight
element.getBoundingClientRect()
window.getComputedStyle()

// Changing layout properties
element.style.width = '100px';
element.style.marginLeft = '10px';
element.classList.add('wide');
```

**Cost**: Very expensive. Affects entire document or subtree.

### Repaint

**What**: Browser redraws visual properties without layout change.

**Triggered by**:
```javascript
element.style.color = 'red';
element.style.backgroundColor = '#fff';
element.style.visibility = 'hidden';
```

**Cost**: Moderate. Only affected elements repainted.

### Layout Thrashing

**Problem**: Reading then writing in loops causes multiple reflows.

```javascript
// ❌ BAD: Forces reflow on each iteration
const elements = document.querySelectorAll('.box');
elements.forEach(el => {
  el.style.width = el.offsetWidth + 10 + 'px'; // Read, write, read, write...
});

// ✅ GOOD: Batch reads, then batch writes
const elements = document.querySelectorAll('.box');
const widths = Array.from(elements).map(el => el.offsetWidth);
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px';
});
```

### Using DevTools to Detect

1. Open Chrome DevTools → Performance tab
2. Record an interaction
3. Look for purple "Layout" bars (reflows)
4. Long/frequent layout = performance issue

---

## Advanced: Critical Rendering Path Optimization

### Render-Blocking Resources

```html
<!-- CSS blocks rendering -->
<link rel="stylesheet" href="styles.css">

<!-- JS blocks DOM parsing (by default) -->
<script src="app.js"></script>
```

### Optimization Strategies

#### 1. Critical CSS
```html
<!-- Inline critical CSS for above-the-fold content -->
<head>
  <style>
    .header { height: 60px; background: #333; }
    .hero { min-height: 100vh; }
    /* Only styles needed for initial viewport */
  </style>
  
  <!-- Load rest asynchronously -->
  <link rel="preload" href="styles.css" as="style" 
        onload="this.rel='stylesheet'">
</head>
```

#### 2. Defer/Async JavaScript
```html
<!-- async: Download parallel, execute ASAP (any order) -->
<script src="analytics.js" async></script>

<!-- defer: Download parallel, execute after DOM parsed (in order) -->
<script src="app.js" defer></script>
```

#### 3. Avoid Forced Synchronous Layout
```javascript
// ❌ Forces layout calculation
function BAD_resize() {
  requestAnimationFrame(() => {
    const width = element.offsetWidth;  // Forces layout
    element.style.width = width / 2 + 'px';
  });
}

// ✅ Read before write
function GOOD_resize() {
  const width = element.offsetWidth;  // Read first
  
  requestAnimationFrame(() => {
    element.style.width = width / 2 + 'px';  // Then write
  });
}
```

#### 4. Promote to Compositor Layers
```css
/* Elements that will animate frequently */
.animated-element {
  will-change: transform;
  /* Creates own layer, avoids triggering layout on parent */
}

/* Alternative: force layer creation */
.layer {
  transform: translateZ(0);
}
```

### Measuring Performance

```javascript
// Performance API
performance.mark('start');
// ... operation ...
performance.mark('end');
performance.measure('operation', 'start', 'end');

const measure = performance.getEntriesByName('operation')[0];
console.log(`Duration: ${measure.duration}ms`);
```

### Core Web Vitals Impact

| Metric | What It Measures | Target |
|--------|-----------------|--------|
| LCP (Largest Contentful Paint) | Main content load | < 2.5s |
| FID (First Input Delay) | Interactivity | < 100ms |
| CLS (Cumulative Layout Shift) | Visual stability | < 0.1 |

**CSS Impact on CLS**:
```css
/* ❌ Causes layout shift */
img {
  /* No dimensions = shift when loaded */
}

/* ✅ Reserve space */
img {
  aspect-ratio: 16 / 9;
  width: 100%;
}
```

---

## 🎯 Cheatsheet

### Property Cost Guide

| Cost Level | Properties | Trigger |
|------------|-----------|---------|
| HIGH | width, height, margin, padding, display | Reflow |
| MEDIUM | color, background, border, shadow | Repaint |
| LOW | transform, opacity | Composite |

### Animation Best Practices

```css
/* ❌ AVOID: Triggers layout on every frame */
@keyframes bad {
  from { left: 0; width: 100px; }
  to { left: 100px; width: 200px; }
}

/* ✅ USE: Compositor-only properties */
@keyframes good {
  from { transform: translateX(0) scale(1); }
  to { transform: translateX(100px) scale(2); }
}
```

---

**Next**: [Flexbox & Grid](../flexbox-grid/)
