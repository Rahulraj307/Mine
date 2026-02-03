/**
 * ============================================
 * CONCEPT: Root Component (Standalone)
 * LEVEL: Beginner → Intermediate
 * ============================================
 *
 * 📚 WHAT: The root component - everything starts here
 *
 * ⚙️ HOW (Angular 17+ Standalone):
 *   - No NgModule wrapping
 *   - Imports directly in @Component decorator
 *   - standalone: true (default in Angular 17+)
 *
 * 🤔 WHY standalone?
 *   - Self-contained components
 *   - Explicit dependencies
 *   - Better tree-shaking
 *   - Easier testing
 *
 * 💡 INTERVIEW TIP: "What are standalone components?"
 *   → Components that don't need NgModule
 *   → Import dependencies directly in decorator
 *   → Angular 17+ default behavior
 *   → Can still use with NgModules if needed
 * ============================================
 */

import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
    /**
     * selector: The HTML tag name for this component
     * In index.html: <app-root></app-root>
     */
    selector: 'app-root',

    /**
     * standalone: true means this component manages its own dependencies
     * This is the default in Angular 17+
     */
    standalone: true,

    /**
     * imports: Dependencies this component needs
     * - CommonModule: ngIf, ngFor, pipes, etc.
     * - RouterOutlet: displays routed component
     * - RouterLink: navigation links
     */
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],

    template: `
    <!-- 
      ============================================
      CONCEPT: Template Syntax Overview
      ============================================
      
      Angular 17 NEW control flow:
      - @if (condition) { } @else { }
      - @for (item of items; track item.id) { }
      - @switch (value) { @case (x) { } }
      
      These replace *ngIf, *ngFor (though those still work)
    -->
    
    <div class="app-container">
      <!-- Navigation Header -->
      <header class="header">
        <div class="container flex items-center justify-between">
          <a routerLink="/" class="logo">
            <span class="logo-icon">✨</span>
            <span class="logo-text">TaskMaster</span>
          </a>
          
          <nav class="nav">
            <!-- Show different nav based on auth state -->
            @if (authService.isAuthenticated()) {
              <a routerLink="/tasks" routerLinkActive="active">
                Tasks
              </a>
              <button class="btn btn-secondary" (click)="logout()">
                Logout
              </button>
            } @else {
              <a routerLink="/login" routerLinkActive="active">
                Login
              </a>
              <a routerLink="/register" routerLinkActive="active" class="btn btn-primary">
                Sign Up
              </a>
            }
          </nav>
        </div>
      </header>
      
      <!-- Main Content Area -->
      <main class="main-content">
        <!--
          ============================================
          CONCEPT: Router Outlet
          ============================================
          
          📚 WHAT: Placeholder where routed components render
          
          ⚙️ HOW: When URL changes:
            1. Router matches URL to route config
            2. Loads the component for that route
            3. Renders it inside <router-outlet>
          
          💡 Can have multiple outlets (named outlets)
        -->
        <router-outlet />
      </main>
      
      <!-- Footer -->
      <footer class="footer">
        <div class="container text-center">
          <p class="text-muted">
            TaskMaster Pro - MEAN Stack Learning Project
          </p>
        </div>
      </footer>
    </div>
  `,

    styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      background: var(--color-bg-secondary);
      border-bottom: 1px solid var(--color-border);
      padding: var(--spacing-md) 0;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text);
    }
    
    .logo:hover {
      color: var(--color-text);
    }
    
    .logo-icon {
      font-size: 1.5rem;
    }
    
    .logo-text {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .nav {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
    
    .nav a:not(.btn) {
      color: var(--color-text-secondary);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }
    
    .nav a:not(.btn):hover,
    .nav a:not(.btn).active {
      color: var(--color-text);
      background: var(--color-bg-tertiary);
    }
    
    .main-content {
      flex: 1;
      padding: var(--spacing-xl) 0;
    }
    
    .footer {
      padding: var(--spacing-lg) 0;
      border-top: 1px solid var(--color-border);
    }
  `],
})
export class AppComponent {
    /**
     * ============================================
     * CONCEPT: inject() Function
     * LEVEL: Intermediate
     * ============================================
     *
     * 📚 WHAT: Inject dependencies without constructor
     *
     * ⚙️ HOW: inject() gets service from DI container
     *
     * 🤔 WHY use inject() over constructor?
     *   - Can use in functions (not just classes)
     *   - Works with inheritance (no constructor call issues)
     *   - Cleaner syntax for many dependencies
     *   - Enables Signals integration
     *
     * BEFORE (constructor injection):
     *   constructor(private authService: AuthService) {}
     *
     * AFTER (inject function):
     *   authService = inject(AuthService);
     */
    authService = inject(AuthService);

    logout(): void {
        this.authService.logout();
    }
}

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. Standalone components import their own dependencies
 * 2. @if/@for are the new control flow syntax
 * 3. inject() is the modern way to get dependencies
 * 4. router-outlet is where routed content appears
 * 5. routerLinkActive adds class when link is active
 *
 * ============================================
 * 📚 NEXT: Check out ./app.routes.ts for routing
 * ============================================
 */
