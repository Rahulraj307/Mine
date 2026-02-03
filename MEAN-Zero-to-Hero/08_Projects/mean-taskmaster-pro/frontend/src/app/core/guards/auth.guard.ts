/**
 * ============================================
 * CONCEPT: Route Guards (Functional Style)
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Guards control access to routes
 *
 * ⚙️ HOW (Angular 15+ Functional Guards):
 *   - Function instead of class
 *   - Returns boolean | UrlTree | Observable | Promise
 *
 * 🤔 WHY functional?
 *   - Less boilerplate
 *   - Easier to compose
 *   - Better tree-shaking
 *
 * BEFORE (Class-based):
 *   @Injectable()
 *   export class AuthGuard implements CanActivate {
 *     canActivate() { ... }
 *   }
 *
 * AFTER (Functional):
 *   export const authGuard: CanActivateFn = () => { ... }
 *
 * Guard Return Values:
 *   - true → Allow navigation
 *   - false → Block (stays on current page)
 *   - UrlTree → Redirect to that URL
 *   - Observable<boolean | UrlTree> → Async check
 *
 * 💡 INTERVIEW TIP: "How do you protect routes in Angular?"
 *   → Route guards in route config
 *   → canActivate: Can user access?
 *   → canDeactivate: Can user leave?
 *   → resolve: Load data before showing
 * ============================================
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * ============================================
 * AUTH GUARD
 * ============================================
 *
 * 📚 WHAT: Requires user to be authenticated
 *
 * Usage in routes:
 *   { path: 'tasks', component: ..., canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    /**
     * Check if user is authenticated using Signal
     * 
     * If authenticated → return true (allow)
     * If not → return UrlTree (redirect to login)
     */
    if (authService.isAuthenticated()) {
        return true;
    }

    /**
     * ============================================
     * CONCEPT: UrlTree for Redirect
     * ============================================
     *
     * 📚 WHAT: Returning UrlTree redirects user
     *
     * 🤔 WHY UrlTree instead of router.navigate()?
     *   - More declarative
     *   - Router handles the navigation
     *   - Can include query params
     *
     * We save the attempted URL for redirect after login
     */
    console.log('Access denied - not authenticated');
    return router.createUrlTree(['/login']);
};

/**
 * ============================================
 * NO-AUTH GUARD (Opposite)
 * ============================================
 *
 * 📚 WHAT: Only allow access if NOT authenticated
 *
 * Use case: Login/Register pages
 *   - If already logged in, redirect to tasks
 */
export const noAuthGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return true; // Not logged in, can access login page
    }

    // Already logged in, redirect to tasks
    return router.createUrlTree(['/tasks']);
};

/**
 * ============================================
 * ROLE GUARD FACTORY
 * ============================================
 *
 * 📚 WHAT: Check if user has specific role
 *
 * ⚙️ HOW: Factory function returns guard
 *
 * Usage:
 *   { path: 'admin', canActivate: [requireRole('admin')] }
 */
export const requireRole = (role: string): CanActivateFn => {
    return (): boolean | UrlTree => {
        const authService = inject(AuthService);
        const router = inject(Router);

        const user = authService.user();

        if (user?.role === role) {
            return true;
        }

        // Not authorized for this role
        console.log(`Access denied - requires role: ${role}`);
        return router.createUrlTree(['/tasks']); // Redirect to tasks
    };
};

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. Functional guards are cleaner (Angular 15+)
 * 2. Return true to allow, false to block
 * 3. Return UrlTree for redirect
 * 4. inject() works in guards
 * 5. Factory functions for parameterized guards
 *
 * ============================================
 * 📚 NEXT: Check out ../services/task.service.ts
 * ============================================
 */
