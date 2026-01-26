# Accessibility (WCAG & ARIA)

## 📚 Table of Contents
- [Beginner: What is Accessibility?](#beginner-what-is-accessibility)
- [Intermediate: WCAG Guidelines Deep Dive](#intermediate-wcag-guidelines-deep-dive)
- [Advanced: ARIA Patterns & Edge Cases](#advanced-aria-patterns--edge-cases)

---

## Beginner: What is Accessibility?

### Definition
Web accessibility (a11y) means designing websites that **everyone can use**, including people with:
- Visual impairments (blind, low vision)
- Motor impairments (can't use mouse)
- Cognitive impairments
- Hearing impairments

### Why It Matters

| Reason | Impact |
|--------|--------|
| **Legal** | ADA lawsuits, WCAG compliance requirements |
| **Business** | 15% of world has disability, larger market |
| **SEO** | Accessible sites rank higher |
| **UX** | Accessibility improvements help everyone |

### The Four Principles (POUR)

```
P - Perceivable    → Can users see/hear content?
O - Operable       → Can users navigate and interact?
U - Understandable → Can users understand content and interface?
R - Robust         → Does it work with assistive tech?
```

### Quick Wins

```html
<!-- 1. Always use alt text -->
<img src="cat.jpg" alt="Orange tabby cat sleeping on couch">

<!-- 2. Use labels for inputs -->
<label for="email">Email</label>
<input id="email" type="email">

<!-- 3. Sufficient color contrast -->
<!-- Minimum 4.5:1 for normal text, 3:1 for large text -->

<!-- 4. Keyboard accessible -->
<button onclick="submit()">Submit</button>  <!-- ✅ Keyboard works -->
<div onclick="submit()">Submit</div>        <!-- ❌ Keyboard fails -->
```

---

## Intermediate: WCAG Guidelines Deep Dive

### WCAG Levels

| Level | Description | Requirement |
|-------|-------------|-------------|
| **A** | Minimum | Must have (basic access) |
| **AA** | Standard | Industry standard, most laws require |
| **AAA** | Enhanced | Best practice, not always achievable |

### Key Guidelines by Category

#### Perceivable (1.x)

```html
<!-- 1.1.1 Non-text Content (Level A) -->
<img src="chart.png" alt="Sales increased 20% in Q1 2024">

<!-- 1.3.1 Info and Relationships (Level A) -->
<table>
  <caption>Monthly Sales</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Sales</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">January</th>
      <td>$10,000</td>
    </tr>
  </tbody>
</table>

<!-- 1.4.3 Contrast Minimum (Level AA) -->
/* Normal text: 4.5:1 ratio */
/* Large text (18px+ bold, 24px+ regular): 3:1 ratio */
```

#### Operable (2.x)

```html
<!-- 2.1.1 Keyboard (Level A) -->
<!-- All functionality available via keyboard -->

<!-- 2.4.4 Link Purpose (Level A) -->
<a href="/report.pdf">Download Q1 Sales Report (PDF, 2MB)</a>
<!-- NOT: <a href="/report.pdf">Click here</a> -->

<!-- 2.4.7 Focus Visible (Level AA) -->
<style>
  button:focus {
    outline: 2px solid blue;
    outline-offset: 2px;
  }
</style>
```

#### Understandable (3.x)

```html
<!-- 3.1.1 Language of Page (Level A) -->
<html lang="en">

<!-- 3.3.1 Error Identification (Level A) -->
<input id="email" type="email" aria-describedby="email-error">
<span id="email-error" role="alert">Please enter a valid email</span>
```

#### Robust (4.x)

```html
<!-- 4.1.2 Name, Role, Value (Level A) -->
<!-- Custom components must expose their state -->
<button aria-pressed="true">Toggle Dark Mode</button>
```

### Testing Tools

| Tool | Purpose |
|------|---------|
| axe DevTools | Browser extension for automated testing |
| WAVE | Visual accessibility checker |
| Lighthouse | Built into Chrome DevTools |
| NVDA | Free Windows screen reader |
| VoiceOver | Built-in Mac/iOS screen reader |

---

## Advanced: ARIA Patterns & Edge Cases

### When to Use ARIA

**First Rule of ARIA**: Don't use ARIA if you can use native HTML.

```html
<!-- ❌ Unnecessary ARIA -->
<div role="button" tabindex="0" aria-pressed="false">Click</div>

<!-- ✅ Native HTML -->
<button>Click</button>
```

**Use ARIA when:**
- Building custom widgets (tabs, accordions, modals)
- Enhancing native elements with additional state
- Providing accessible names for icon-only buttons

### ARIA Roles

```html
<!-- Landmark roles (use semantic HTML instead when possible) -->
<div role="banner">...</div>      <!-- = <header> -->
<div role="navigation">...</div>  <!-- = <nav> -->
<div role="main">...</div>        <!-- = <main> -->
<div role="complementary">...</div> <!-- = <aside> -->

<!-- Widget roles -->
<div role="tablist">
  <button role="tab" aria-selected="true">Tab 1</button>
  <button role="tab" aria-selected="false">Tab 2</button>
</div>
<div role="tabpanel">Content 1</div>

<!-- Live region roles -->
<div role="alert">Error: Form submission failed</div>
<div role="status">Loading complete</div>
```

### ARIA States and Properties

```html
<!-- States (change dynamically) -->
aria-expanded="true|false"     <!-- Accordion, dropdown -->
aria-selected="true|false"     <!-- Tabs, listbox -->
aria-checked="true|false"      <!-- Checkbox -->
aria-pressed="true|false"      <!-- Toggle button -->
aria-hidden="true"             <!-- Hide from AT -->
aria-disabled="true"           <!-- Disabled (but focusable) -->

<!-- Properties (usually static) -->
aria-label="Close"             <!-- Accessible name -->
aria-labelledby="heading-id"   <!-- Reference to naming element -->
aria-describedby="help-id"     <!-- Reference to description -->
aria-controls="panel-id"       <!-- Relationship to controlled element -->
aria-live="polite|assertive"   <!-- Dynamic content announcements -->
```

### Common Patterns

#### Modal Dialog
```html
<div role="dialog" 
     aria-modal="true" 
     aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm Action</h2>
  <p>Are you sure you want to proceed?</p>
  <button>Cancel</button>
  <button>Confirm</button>
</div>

<!-- JavaScript requirements -->
<!-- 1. Focus first focusable element on open -->
<!-- 2. Trap focus within modal -->
<!-- 3. Return focus on close -->
<!-- 4. Close on Escape key -->
```

#### Accordion
```html
<h3>
  <button aria-expanded="true" aria-controls="panel1">
    Section 1
  </button>
</h3>
<div id="panel1" aria-hidden="false">
  Panel 1 content
</div>

<h3>
  <button aria-expanded="false" aria-controls="panel2">
    Section 2
  </button>
</h3>
<div id="panel2" aria-hidden="true">
  Panel 2 content
</div>
```

### Edge Cases and Gotchas

#### aria-hidden vs display:none

```html
<!-- display:none: Hidden from EVERYONE -->
<div style="display: none">Hidden</div>

<!-- aria-hidden: Hidden from AT only -->
<div aria-hidden="true">
  <i class="icon-menu"></i>  <!-- Decorative icons -->
</div>
```

#### Focus Management

```javascript
// When dynamically adding/removing content
const newElement = document.createElement('div');
newElement.textContent = 'New content';
container.appendChild(newElement);
newElement.focus();  // Move focus to new content

// When closing modals
modal.close();
triggerButton.focus();  // Return focus to trigger
```

#### Screen Reader Announcements

```html
<!-- Polite: Wait for user to finish current task -->
<div aria-live="polite">Items loaded successfully</div>

<!-- Assertive: Interrupt immediately (use sparingly) -->
<div aria-live="assertive" role="alert">
  Error: Network connection lost
</div>
```

### Performance Considerations

1. **Don't overuse aria-live**: Every update triggers announcement
2. **Minimize DOM changes in live regions**: Announce only key changes
3. **Test with real users**: Automated tools catch only ~30% of issues

---

## 🎯 Cheatsheet

### Quick Reference

| Need | Solution |
|------|----------|
| Accessible name for icon button | `aria-label="Close"` |
| Hide decorative content | `aria-hidden="true"` |
| Dynamic content update | `aria-live="polite"` |
| Error announcement | `role="alert"` |
| Expanded/collapsed state | `aria-expanded="true/false"` |
| Required field | `aria-required="true"` (or `required`) |
| Describe input | `aria-describedby="help-text-id"` |

### Keyboard Navigation Standards

| Key | Expected Action |
|-----|-----------------|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous focusable element |
| Enter | Activate button/link |
| Space | Activate button, select checkbox |
| Escape | Close modal, cancel action |
| Arrow keys | Navigate within components (tabs, menus) |

---

**Next**: [SEO Fundamentals](../seo/)
