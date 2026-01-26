# 📘 MASTER INTERVIEW Q&A: HTML (Zero to Hero)
> **Section 1: HTML (Modern, Interview-Ready, 2025)**
> A complete guide from basic structure to advanced performance, accessibility, and SEO topics.

---

## 🟢 Part 1: The Foundation (Core HTML5)

### 1️⃣ What is HTML? Difference between HTML & HTML5? Advantages of HTML5?
**Answer:**
HTML (HyperText Markup Language) is the standard markup language used to structure content on the web. It defines elements like headings, paragraphs, images, links, forms, etc. **It describes structure, not logic.**

**HTML vs HTML5**
| Feature | HTML (Older) | HTML5 (Modern) |
| :--- | :--- | :--- |
| **Tags** | Limited semantic tags | Rich semantic tags (`header`, `section`, `article`) |
| **Media** | No native audio/video | Built-in `<audio>` and `<video>` support |
| **Tech** | Heavy use of plugins (Flash) | Plugin-free multimedia |
| **Mobile** | Weak mobile support | Mobile-first focus |
| **Syntax** | Complex, strict (in XHTML) | Cleaner, simpler syntax |

**Advantages of HTML5**
*   **Semantic elements** → Better SEO & accessibility.
*   **Built-in multimedia** → No third-party plugins needed.
*   **Modern form inputs** → `email`, `date`, `number`, `range`, etc.
*   **Offline capabilities** → LocalStorage, IndexedDB, Application Cache.
*   **Performance** → Better parsing and rendering on mobile devices.

### 2️⃣ Difference between HTML and XHTML?
**Answer:**
XHTML is HTML written using strict XML rules.

| Feature | HTML | XHTML |
| :--- | :--- | :--- |
| **Case** | Case-insensitive | Case-sensitive |
| **Closing** | Tags may be unclosed | All tags **must** close |
| **Syntax** | Flexible | Strict |

👉 **Real-world:** XHTML is mostly legacy. Modern apps use HTML5.

### 3️⃣ What is the role of `<!DOCTYPE html>`?
**Answer:**
It tells the browser:
1.  Which HTML version is being used (HTML5).
2.  To render the page in **Standards Mode** (correct layout).

**If removed:**
*   Browser enters **Quirks Mode**.
*   Layout & CSS may behave inconsistently (simulating bugs from old IE versions).
*   SEO & accessibility issues may appear.

👉 **Always include it.**

### 4️⃣ Difference between `<head>` and `<body>`? Where to place JS?
**Answer:**
*   **`<head>`**: Information **about** the page (Metadata, SEO, title, styles, scripts).
*   **`<body>`**: The **content** of the page (Text, images, UI).

**JS Placement Best Practice:**
1.  **Historically:** Bottom of `<body>` (to prevent blocking render).
2.  **Modern Preferred:** Inside `<head>` with `defer` attribute.
    ```html
    <script src="app.js" defer></script>
    ```
    *   `defer`: Downloads parallel to HTML parsing, executes *after* HTML parsing.

### 5️⃣ What is the `<title>` tag? Why is it important?
**Answer:**
Defines the page title shown in Browser Tabs, Search Results, Bookmarks, and Social Previews.

**Importance:**
*   **SEO Ranking:** Search engines rely on it heavily.
*   **UX:** Helps users identify open tabs.
*   **Accessibility:** Screen readers announce it first.

### 6️⃣ What are Meta Tags? List important ones.
**Answer:**
Metadata is data about data. It sits in the `<head>` and is used by browsers and search engines.

**Critical Meta Tags:**
```html
<!-- Encoding: Ensures special characters render correctly -->
<meta charset="UTF-8">

<!-- Viewport: CRITICAL for responsive mobile design -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- SEO Description: The snippet shown in Google results -->
<meta name="description" content="Detailed guide on HTML interview questions.">
```

### 7️⃣ What are HTML Elements vs Tags?
**Answer:**
*   **Tag:** The syntax starting or calling an element (e.g., `<p>`).
*   **Element:** The whole package: Start Tag + Content + End Tag.

```html
<p>Hello World</p>
<!-- <p> is the tag -->
<!-- The whole line is the Element -->
```

### 8️⃣ Difference between `<div>` and `<span>`?
**Answer:**
| Feature | `<div>` | `<span>` |
| :--- | :--- | :--- |
| **Display** | Block-level | Inline |
| **Container** | Layout container | Text/small-chunk wrapper |
| **Behavior** | Starts new line, full width | Flows with text, width fits content |

👉 **Pro Tip:** Don't use `<div>` for everything. Use semantic tags (`<section>`, `<article>`) where possible.

### 9️⃣ Common HTML Elements & Their Roles
*   `<p>`: Paragraph.
*   `<a>`: Hyperlink (`href` is mandatory).
*   `<img>`: Image (`alt` is mandatory for a11y).
*   `<button>`: Clickable action.
*   `<input>`: Data entry.
*   `<hr>`: Thematic break (change of topic).
*   `<em>`: Emphasis (semantic importance, usually italics).

### 🔟 Semantic Elements (VERY IMPORTANT)
**Answer:**
Semantic HTML gives meaning to structure, aiding **Accessibility (a11y)** and **SEO**.

| Element | Purpose |
| :--- | :--- |
| `<header>` | Introductory content, logos, nav. |
| `<nav>` | Major navigation blocks. |
| `<main>` | The dominant content of the page (unique to the page). |
| `<article>` | Self-contained content (blog post, news item). |
| `<section>` | Thematic grouping of content. |
| `<footer>` | Copyright, related links, author info. |
| `<aside>` | Tangentially related content (sidebars). |

### 1️⃣1️⃣ `<section>` vs `<article>`
**Answer:**
*   **`<article>`**: Independent, standalone. If you removed it and put it on another site, it would still make sense (e.g., a blog post, a comment).
*   **`<section>`**: A thematic group of content. If you removed it, the context might be lost (e.g., "Reviews" chapter, "Contact Us" area).

### 1️⃣2️⃣ Heading tags & SEO impact
**Answer:**
*   **`<h1>`**: The main topic. **Only ONE per page.** crucial for SEO weighting.
*   **`<h2>` - `<h6>`**: Sub-topics creating a document outline.
*   **Do not use for styling size.** Use them for structure. Screen readers jump between headers to navigate.

### 1️⃣3️⃣ Block-level vs Inline Elements
**Answer:**
*   **Block:** Takes full width, starts new line (`<div>`, `<p>`, `<h1>`, `<header>`, `<ul>`).
*   **Inline:** Takes only necessary width, stays in line (`<span>`, `<a>`, `<img>`, `<strong>`).

### 1️⃣4️⃣ What are Empty (Void) Elements?
**Answer:**
Elements that cannot have child content and don't require a closing tag.
*   `<img>`
*   `<br>`
*   `<hr>`
*   `<input>`
*   `<link>`
*   `<meta>`

### 1️⃣5️⃣ Accessibility (WCAG) – Modern Interview Must-Know 🔥
**Answer:**
Web Content Accessibility Guidelines (WCAG) ensure web is usable by everyone.
**Key Rules:**
1.  **Semantics:** Use `<button>` for actions, `<a>` for navigation. Don't make a `<div>` clickable without ARIA.
2.  **Alt Text:** `<img src="cat.jpg" alt="A fluffy white cat sitting on a fence">`.
3.  **Forms:** Explicitly link labels.
    ```html
    <label for="email">Email</label>
    <input id="email" type="email">
    ```
4.  **Contrast:** Ensure text color contrasts well with background.
5.  **Keyboard:** Ensure all interactive elements are reachable via `Tab` key.

---

## 🟡 Part 2: Intermediate (Forms, APIs & Storage)

### 1️⃣6️⃣ What are Data Attributes (`data-*`)?
**Answer:**
Allow you to store custom data private to the page or application on HTML elements.
```html
<div id="user" data-id="123" data-role="admin">John</div>
```
**Usage in JS:**
```javascript
const user = document.getElementById('user');
console.log(user.dataset.id); // "123"
console.log(user.dataset.role); // "admin"
```
**Why?** Good for passing data from backend to frontend without inline script tags.

### 1️⃣7️⃣ Explain `defer` vs `async` in Script tags.
**Answer:**
Controls how external scripts block HTML parsing.
| Mode | Behavior | Use Case |
| :--- | :--- | :--- |
| **Normal** `<script>` | HTML Parsing **Stops** → Download → Execute → Resume HTML. | Rarely used now (blocking). |
| **Async** `<script async>` | Download in background. Executes **immediately** when downloaded (pausing HTML). | Analytics, Ads (order doesn't matter). |
| **Defer** `<script defer>` | Download in background. Executes **after** HTML parsing is complete. Preserves order. | Main Application Bundles. |

### 1️⃣8️⃣ HTML5 Web Storage: LocalStorage vs SessionStorage vs Cookies.
**Answer:**
| Feature | LocalStorage | SessionStorage | Cookies |
| :--- | :--- | :--- | :--- |
| **Persistence** | Permanent (until deleted) | Tab session only (gone on close) | Set expiry time |
| **Capacity** | ~5-10 MB | ~5 MB | ~4 KB |
| **Server Access** | Client-only | Client-only | Sent with **every** HTTP request |
| **Use Case** | Theme preference, Auth tokens | Form drafts, simple session state | Auth tokens (HttpOnly), Server tracking |

### 1️⃣9️⃣ What is the `<canvas>` element vs SVG?
**Answer:**
*   **SVG (Scalable Vector Graphics):**
    *   XML-based vector graphics.
    *   Elements exist in DOM (can add event listeners to a specific circle).
    *   Best for: Logos, Icons, Charts, Simple animations.
    *   **Scales infinitely without blur.**
*   **Canvas:**
    *   Raster-based (pixels).
    *   Drawn via JavaScript (`getContext('2d')`).
    *   No DOM nodes for drawn shapes (high performance for many objects).
    *   Best for: Games, Complex visualizations, Image Manipulation.

---

## 🔴 Part 3: Advanced (Performance, SEO & Internals)

### 2️⃣0️⃣ What is the Critical Rendering Path (CRP)?
**Answer:**
The sequence of steps the browser takes to convert HTML, CSS, and JS into pixels on the screen.
1.  **DOM Construction:** HTML → DOM Tree.
2.  **CSSOM Construction:** CSS → CSSOM Tree.
3.  **Render Tree:** DOM + CSSOM (Visible content only).
4.  **Layout (Reflow):** Calculate position and size of elements.
5.  **Paint:** Fill in pixels (color, borders).
6.  **Composite:** Stacking layers together.

**Interview Win:** "To optimize performance, we minimize Critical Resources (CSS/JS) that block the Render Tree content."

### 2️⃣1️⃣ What is Shadow DOM?
**Answer:**
A scoped subtree of the DOM that is isolated from the main document DOM.
*   **Styles don't leak:** CSS inside Shadow DOM doesn't affect outside, and vice versa.
*   **Core of Web Components:** Used in `<video>` controls, `<input type="date">` internals.
```html
<div id="host"></div>
<script>
  const host = document.querySelector('#host');
  const shadow = host.attachShadow({mode: 'open'});
  shadow.innerHTML = '<style>p { color: red; }</style><p>I am isolated!</p>';
</script>
```

### 2️⃣2️⃣ Responsive Images: `srcset` and `<picture>`.
**Answer:**
Instead of one big image for all devices, serve the right size.
1.  **`srcset` (Resolution Switching):** Browser picks the best image based on screen width/DPR.
    ```html
    <img src="small.jpg"
         srcset="small.jpg 500w, medium.jpg 1000w, large.jpg 2000w"
         alt="responsive">
    ```
2.  **`<picture>` (Art Direction):** You force the browser to change image format or crop completely.
    ```html
    <picture>
        <source media="(min-width: 800px)" srcset="wide-crop.jpg">
        <source media="(min-width: 400px)" srcset="portrait-crop.jpg">
        <img src="fallback.jpg" alt="Art directed">
    </picture>
    ```

### 2️⃣3️⃣ Preload, Prefetch, and Preconnect.
**Answer:**
Resource Hints to help browser prioritize.
*   **`preload`**: "I need this **NOW** for the current page." (Fonts, Hero Image).
*   **`prefetch`**: "I might need this/need it for the **NEXT** page." (Low priority).
*   **`preconnect`**: "I will need a resource from `https://api.example.com` soon, do the DNS/Handshake now."

### 2️⃣4️⃣ What is Accessibility Tree?
**Answer:**
A parallel tree to the DOM created by the browser for Assistive Technologies (Screen Readers).
*   DOM contains all nodes / visual info.
*   Accessibility Tree contains only semantic objects (Name, Role, Value).
*   **ARIA attributes** modify the Accessibility Tree, NOT the DOM.

### 2️⃣5️⃣ SEO: Standard Data (JSON-LD).
**Answer:**
Structured data helps Google understand context (Product, Recipe, Event) for Rich Snippets.
**JSON-LD (JavaScript Object Notation for Linked Data)** is the preferred format.
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Recipe",
  "name": "Grandma's Pie",
  "author": "Rahul",
  "image": "pie.jpg"
}
</script>
```

---

## 🔥 Part 4: Special "Gotcha" Questions

### 2️⃣6️⃣ Why is it bad to change the `src` of an `<img>` in a loop?
**Answer:**
If you change `src` rapidly, the browser might start downloading the image immediately for each change, flooding the network requests queue even if the image is never rendered.

### 2️⃣7️⃣ What is `contenteditable`?
**Answer:**
An attribute that makes any HTML element editable by the user.
```html
<div contenteditable="true">You can edit this text!</div>
```
Used for building Rich Text Editors (like Notion or Medium).

### 2️⃣8️⃣ `display: none` vs `visibility: hidden` vs `hidden` attribute?
**Answer:**
*   **`display: none`**: Removed from Render Tree. No space taken. Triggers Reflow.
*   **`visibility: hidden`**: In Render Tree. Invisible, but **takes up space**. Triggers Repaint.
*   **`hidden` attribute** (`<div hidden>`): Semantic HTML equivalent of `display: none`. easier for a11y tools to understand "this is gone".

### 2️⃣9️⃣ What happens if you don't close a tag?
**Answer:**
HTML is forgiving. The browser guesses where it should close (Auto-insertion).
Example: `<li>Item 1 <li>Item 2` will be fixed by the browser.
*   **Risk:** Unexpected layout breaks, CSS selector failures, or JS targeting wrong elements.
*   **React/JSX:** Will throw a compile error immediately.

### 3️⃣0️⃣ How to optimize SEO for Single Page Applications (SPAs)?
**Answer:**
SPAs (Angular/React) render content via JS, which old crawlers couldn't see.
**Solutions:**
1.  **Server-Side Rendering (SSR):** Angular Universal / Next.js. Delivers full HTML on first load.
2.  **Prerendering:** Generate static HTML at build time for public routes.
3.  **Dynamic Meta Tags:** Using `Title` and `Meta` services in Angular to update tags when route changes.
