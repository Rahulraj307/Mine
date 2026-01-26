# 📘 MASTER INTERVIEW Q&A: CSS (Zero to Hero)
> **Section 2: CSS (Modern Layouts, Flexbox, Grid, Responsive Design – 2025)**
> Everything from Basic Styling to Scalable Architecture and Performance.

---

## 🟢 Part 1: The Foundation (Selectors & Box Model)

### 1️⃣ What is CSS? Why is it used?
**Answer:**
CSS (Cascading Style Sheets) is used to style and layout web pages.
*   **HTML**: Structure / Skeleton.
*   **CSS**: Presentation / Skin.
*   **JavaScript**: Behavior / Muscle.

**Why CSS matters:**
*   Controls layout, colors, fonts, spacing.
*   Enables **Responsive Design** (One code, many devices).
*   Improves maintainability (Separation of Concerns).

### 2️⃣ Ways to apply CSS
**Answer:**
| Type | Usage | Best Practice |
| :--- | :--- | :--- |
| **Inline** | `<div style="color:red">` | ❌ **Avoid.** Hard to maintain, no separation. |
| **Internal** | `<style>` in `<head>` | ⚠️ OK for single-page emails or critical path CSS. |
| **External** | `<link href="style.css">` | ✅ **Best.** Caches content, reusable across pages. |

### 3️⃣ What is the CSS Box Model? (Must Know)
**Answer:**
Every element on a web page is a rectangular box. It consists of:
1.  **Content**: The actual text/image.
2.  **Padding**: Space **inside** the border (between content and border).
3.  **Border**: The line around the padding.
4.  **Margin**: Space **outside** the border (pushes other elements away).

**Critical Reset:**
By default, `width` + `padding` + `border` = Total Width. This breaks layouts.
**Always use:**
```css
* {
  box-sizing: border-box;
}
```
*   `content-box` (Default): Width = Content only.
*   `border-box` (Modern): Width = Content + Padding + Border.

### 4️⃣ CSS Selectors & Specificity (Interview Favorite 🔥)
**Answer:**
**Specificity Order (The Hierarchy):**
1.  **Inline Style** (`style="..."`) - (1000)
2.  **ID Selector** (`#header`) - (100)
3.  **Class / Attribute / Pseudo-class** (`.card`, `[type="text"]`, `:hover`) - (10)
4.  **Element / Pseudo-element** (`div`, `::before`) - (1)

**Rules:**
*   Specific wins over General.
*   Same specificity? **Last rule wins** (Cascading).
*   `!important`: Overrides everything (Avoid unless absolutely necessary).

### 5️⃣ Difference between `display: none`, `visibility: hidden`, and `opacity: 0`?
**Answer:**
| Property | Visible? | Takes Space? | Clickable? | Expensive? |
| :--- | :--- | :--- | :--- | :--- |
| `display: none` | No | **No** | No | Triggers **Reflow** (Heavy) |
| `visibility: hidden` | No | **Yes** | No | Triggers Repaint |
| `opacity: 0` | No | **Yes** | **Yes** | GPU accelerated (Fast) |

---

## 🟡 Part 2: Modern Layouts (Flexbox & Grid)

### 6️⃣ Flexbox – One-Dimensional Layout System
**Answer:**
Best for **Rows OR Columns** (1D). Great for Navbars, centering items, and small UI components.

**Key Parent Properties:**
*   `display: flex;`
*   `flex-direction: row | column;`
*   `justify-content`: Main Axis (e.g., Horizontal centering in row).
*   `align-items`: Cross Axis (e.g., Vertical centering in row).
*   `gap: 20px;` (Modern spacing).

**Key Child Properties:**
*   `flex-grow: 1;` (Take available space).
*   `align-self`: Override parent alignment for one item.

### 7️⃣ CSS Grid – Two-Dimensional Layout System
**Answer:**
Best for **Rows AND Columns** (2D). Great for overall Page Layouts (Header, Sidebar, Content, Footer).

```css
.container {
  display: grid;
  /* 3 columns: 200px, remaining space, 200px */
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
}
```

### 8️⃣ Flexbox vs Grid (When to use what?)
**Answer:**
*   **Flexbox:** Content-first. "I have a bunch of items, just line them up." (Menus, Cards in a row).
*   **Grid:** Layout-first. "I have a specific design structure, I need items to fit into these slots." (Dashboard Layouts).

### 9️⃣ Centering a Div (The Classic Question)
**Answer:**
**Method 1: Flexbox (Modern Standard)**
```css
.parent {
  display: flex;
  justify-content: center; /* Main Axis */
  align-items: center;     /* Cross Axis */
}
```
**Method 2: Grid (Shortest)**
```css
.parent {
  display: grid;
  place-items: center;
}
```
**Method 3: Absolute (Old School)**
```css
.child {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}
```

---

## 🔵 Part 3: Responsive Design & Units

### 🔟 Responsive Design Principles
**Answer:**
Goal: One website code → Looks good on Mobile, Tablet, and Desktop.
**Core Techniques:**
1.  **Fluid Grids:** Using `%` or `fr` instead of fixed `px`.
2.  **Flexible Images:** `img { max-width: 100%; height: auto; }`.
3.  **Media Queries:** CSS that runs only on certain screen sizes.
4.  **Mobile-First:** Write CSS for mobile primarily, then add `@media (min-width)` for larger screens.

### 1️⃣1️⃣ Modern CSS Units (Review Check)
**Answer:**
*   **`px`**: Absolute. Good for borders. Bad for font-size (accessibility issues).
*   **`%`**: Relative to parent.
*   **`rem`**: Relative to Root (`html` tag). **Best for Typography** (Respects user browser settings).
*   **`em`**: Relative to current element font-size. Good for padding around text.
*   **`vw` / `vh`**: Viewport Width/Height. `100vh` = Full Screen Height.
*   **`fr`**: Fractional unit (Grid only). Distributes available space.

### 1️⃣2️⃣ CSS Position Values
**Answer:**
*   `static`: Default. Flows normally.
*   `relative`: Flows normally, but can be nudged (`top`, `left`). Creates a context for absolute children.
*   `absolute`: Removed from flow. Positioned relative to nearest **non-static** ancestor.
*   `fixed`: Removed from flow. Positioned relative to **Viewport** (Stays on scroll).
*   `sticky`: Toggles between relative and fixed based on scroll position.

---

## 🔴 Part 4: Advanced (Architecture, Performance & Gotchas)

### 1️⃣3️⃣ What is the Stacking Context (Z-Index)?
**Answer:**
`z-index` doesn't work on `static` elements. It decides which element is "on top" of another.
**New Stacking Context triggers:**
*   `position: relative/absolute/fixed` + `z-index`.
*   `opacity` less than 1.
*   `transform`, `filter`, `perspective` (CSS Attributes).
*   `isolation: isolate`.

### 1️⃣4️⃣ CSS Preprocessors (Sass/SCSS) vs Native CSS Variables
**Answer:**
*   **Sass Variables (`$color`)**: Compiled at **Build Time**. Browser sees static hex codes. Cannot change dynamically in DOM.
*   **CSS Custom Properties (`--color`)**: Live in the DOM. Can be updated via JavaScript or Media Queries. Focus of modern development.
    ```css
    :root { --main-color: blue; }
    button { background: var(--main-color); }
    ```

### 1️⃣5️⃣ How to implement weird shapes? (Clip-path)
**Answer:**
Don't use images for simple shapes if possible. Use `clip-path`.
```css
/* Creates a Triangle */
clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
```

### 1️⃣6️⃣ CSS Performance Best Practices
**Answer:**
1.  **Avoid `@import`:** It blocks parallel downloading. Use `<link>` instead.
2.  **Minimize Reflows:** changing `width`, `left`, `top` forces the browser to recalculate layout. Prefer `transform` (GPU accelerated) for animations.
3.  **Unused CSS:** Remove it (PurgeCSS).
4.  **Critical CSS:** Inline the CSS meant for the "above the fold" content in `<head>` for faster First Contentful Paint (FCP).

### 1️⃣7️⃣ Pseudo-classes (`:hover`) vs Pseudo-elements (`::before`)
**Answer:**
*   **Pseudo-class (`:hover`, `:focus`, `:nth-child`)**: Selects an element based on **state**.
*   **Pseudo-element (`::before`, `::after`, `::placeholder`)**: Creates a **fake** element or selects a specific part. Requires `content: ''`.

### 1️⃣8️⃣ Accessibility (A11y) in CSS
**Answer:**
1.  **Focus Rings:** NEVER do `outline: none` without a replacement style. Keyboard users need to see where they are.
2.  **Screen Readers:** Use `.sr-only` class to hide elements visually but keep them readable for screen readers (don't use `display: none`).
3.  **Reduced Motion:** Respect user system settings.
    ```css
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; transition: none !important; }
    }
    ```

### 1️⃣9️⃣ BEM Naming Convention
**Answer:**
**Block Element Modifier**. Keeps CSS flat and maintainable.
*   **Block**: `.card`
*   **Element**: `.card__image`
*   **Modifier**: `.card--featured`
```css
.card__button--disabled { ... }
```

### 2️⃣0️⃣ What are Container Queries? (New in 2025)
**Answer:**
Like attributes or media queries, but based on the **parent container's size**, not the viewport.
**Why?** A "Card" component can layout differently if it's in a narrow sidebar vs a wide main content area.
```css
.container { container-type: inline-size; }

@container (min-width: 400px) {
  .card { flex-direction: row; }
}
```
