# Flexbox & CSS Grid

## 📚 Table of Contents
- [Beginner: Understanding Flexbox](#beginner-understanding-flexbox)
- [Beginner: Understanding Grid](#beginner-understanding-grid)
- [Intermediate: Advanced Patterns](#intermediate-advanced-patterns)
- [Advanced: Decision Guide & Edge Cases](#advanced-decision-guide--edge-cases)

---

## Beginner: Understanding Flexbox

### What is Flexbox?
Flexbox is a **one-dimensional** layout method for arranging items in rows OR columns.

### Enable Flexbox
```css
.container {
  display: flex;  /* or inline-flex */
}
```

### Axes
```
Main Axis (default: horizontal)
←────────────────────────────────→

Cross Axis (default: vertical)
↑
│
│
↓
```

### Container Properties

```css
.flex-container {
  display: flex;
  
  /* Direction */
  flex-direction: row;        /* Default: left to right */
  flex-direction: row-reverse; /* Right to left */
  flex-direction: column;      /* Top to bottom */
  flex-direction: column-reverse;
  
  /* Wrapping */
  flex-wrap: nowrap;   /* Default: all on one line */
  flex-wrap: wrap;     /* Wrap to multiple lines */
  
  /* Main axis alignment */
  justify-content: flex-start;    /* Pack at start */
  justify-content: flex-end;      /* Pack at end */
  justify-content: center;        /* Center items */
  justify-content: space-between; /* Even space, none at edges */
  justify-content: space-around;  /* Even space including edges */
  justify-content: space-evenly;  /* Truly even space */
  
  /* Cross axis alignment */
  align-items: stretch;    /* Default: fill container height */
  align-items: flex-start; /* Align to top */
  align-items: flex-end;   /* Align to bottom */
  align-items: center;     /* Center vertically */
  align-items: baseline;   /* Align by text baseline */
}
```

### Item Properties

```css
.flex-item {
  /* Growth factor (default: 0) */
  flex-grow: 1;  /* Item grows to fill space */
  
  /* Shrink factor (default: 1) */
  flex-shrink: 0;  /* Item won't shrink */
  
  /* Base size (default: auto) */
  flex-basis: 200px;  /* Starting size */
  
  /* Shorthand */
  flex: 1 0 200px;  /* grow shrink basis */
  flex: 1;          /* Equal sizing: grow:1 shrink:1 basis:0 */
  
  /* Individual alignment */
  align-self: center;  /* Override container's align-items */
  
  /* Order (default: 0) */
  order: -1;  /* Move before others */
}
```

### Common Patterns

```css
/* Centering (holy grail) */
.center-everything {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Navigation bar */
.nav {
  display: flex;
  justify-content: space-between;
}
.nav-right { margin-left: auto; }  /* Push to right */

/* Equal width items */
.equal-items {
  display: flex;
}
.equal-items > * {
  flex: 1;  /* All items equal width */
}
```

---

## Beginner: Understanding Grid

### What is Grid?
Grid is a **two-dimensional** layout method for arranging items in rows AND columns.

### Enable Grid
```css
.container {
  display: grid;  /* or inline-grid */
}
```

### Defining Columns & Rows

```css
.grid-container {
  display: grid;
  
  /* Fixed columns */
  grid-template-columns: 200px 200px 200px;
  
  /* Flexible columns */
  grid-template-columns: 1fr 2fr 1fr;  /* 1:2:1 ratio */
  
  /* Repeat */
  grid-template-columns: repeat(3, 1fr);  /* 3 equal columns */
  
  /* Auto-fill/fit */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  
  /* Rows */
  grid-template-rows: 100px auto 100px;
  
  /* Gaps */
  gap: 20px;           /* Both row and column gap */
  row-gap: 10px;
  column-gap: 20px;
}
```

### Placing Items

```css
.grid-item {
  /* By line numbers */
  grid-column: 1 / 3;   /* Span columns 1-2 */
  grid-row: 1 / 2;      /* Row 1 only */
  
  /* Span syntax */
  grid-column: span 2;  /* Span 2 columns */
  
  /* Named areas */
  grid-area: header;
}

/* Named grid areas */
.grid-container {
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

### Alignment in Grid

```css
.grid-container {
  /* Align all items in their grid cells */
  justify-items: start | end | center | stretch;  /* Horizontal */
  align-items: start | end | center | stretch;    /* Vertical */
  
  /* Align entire grid in container */
  justify-content: start | end | center | space-between;
  align-content: start | end | center | space-between;
}

.grid-item {
  /* Individual item alignment */
  justify-self: center;
  align-self: end;
}
```

---

## Intermediate: Advanced Patterns

### Responsive Grid without Media Queries

```css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 1rem;
}
/* 
  - auto-fit: Fill space, collapse empty tracks
  - minmax(300px, 1fr): Min 300px, max equal share
  - min(300px, 100%): Prevents overflow on small screens
*/
```

### Holy Grail Layout

```css
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 200px 1fr 200px;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  min-height: 100vh;
}
header { grid-area: header; }
nav    { grid-area: nav; }
main   { grid-area: main; }
aside  { grid-area: aside; }
footer { grid-area: footer; }
```

### Overlapping Grid Items

```css
.stack-grid {
  display: grid;
  grid-template: 1fr / 1fr;  /* Single cell */
}
.stack-grid > * {
  grid-area: 1 / 1;  /* All items in same cell */
}
/* Use z-index to control stacking order */
```

### Flexbox Inside Grid

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.card {
  display: flex;
  flex-direction: column;
}
.card-content {
  flex: 1;  /* Push footer to bottom */
}
```

---

## Advanced: Decision Guide & Edge Cases

### When to Use Flexbox vs Grid

| Scenario | Use | Why |
|----------|-----|-----|
| Navigation bar | Flexbox | One-dimensional, unknown item count |
| Photo gallery | Grid | Two-dimensional, consistent sizing |
| Card content | Flexbox | Vertical stacking, flexible spacing |
| Page layout | Grid | Named areas, precise control |
| Centering one item | Flexbox | Simpler for single item |
| Complex dashboard | Grid | Complex two-dimensional layouts |

### Edge Cases

#### Flexbox: Collapsed Flex Basis
```css
/* ❌ Common mistake */
.item {
  flex: 1;
  width: 200px;  /* Ignored! flex-basis overrides */
}

/* ✅ Correct */
.item {
  flex: 1 0 200px;  /* or use flex-basis explicitly */
}
```

#### Grid: Auto vs 1fr

```css
/* auto: Size to content */
grid-template-columns: auto 1fr;  /* First column = content width */

/* 1fr: Equal share of remaining space */
grid-template-columns: 1fr 1fr;  /* Both columns equal */
```

#### Content Overflow

```css
/* Problem: Long content breaks layout */
.grid-item {
  overflow: hidden;        /* Or hidden */
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Or prevent with min-width */
.grid-item {
  min-width: 0;  /* Allow shrinking below content size */
}
```

### Performance Considerations

1. **Avoid complex calculations** in `minmax()` 
2. **Subgrid support**: Limited but growing (check caniuse.com)
3. **Nesting**: Deep nesting of flex/grid is fine but adds complexity

---

## 🎯 Interview Questions

### Fresher
1. What's the difference between Flexbox and Grid?
2. How do you center an item with Flexbox?
3. What does `flex: 1` mean?

### Mid-Level
1. Explain `justify-content` vs `align-items`.
2. How does `auto-fill` differ from `auto-fit`?
3. When would you use Grid areas?

### Senior
1. How would you create a responsive layout without media queries?
2. Explain the `fr` unit and how it calculates space.
3. What are the performance implications of deeply nested flex containers?

---

**Next**: [CSS Architecture](../architecture/)
