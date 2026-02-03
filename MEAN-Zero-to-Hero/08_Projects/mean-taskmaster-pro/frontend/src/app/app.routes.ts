/**
 * ============================================
 * CONCEPT: Angular Routing & Lazy Loading
 * LEVEL: Beginner → Advanced
 * ============================================
 *
 * 📚 WHAT: Routes define which component shows for which URL
 *
 * ⚙️ HOW: Router matches URL path to route config
 *   - path: URL segment to match
 *   - component: Component to render
 *   - loadComponent: Lazy load component
 *   - canActivate: Guards to check before loading
 *
 * 🤔 WHY lazy loading?
 *   - Smaller initial bundle
 *   - Faster first paint
 *   - Load features on demand
 *   - Better for large apps
 *
 * ⚠️ COMMON MISTAKES:
 *   - Forgetting to add route guards
 *   - Not using lazy loading for feature modules
 *   - Path typos (silent failures)
 *
 * 💡 INTERVIEW TIP: "Explain lazy loading in Angular"
 *   → Split app into chunks
 *   → loadComponent/loadChildren loads on demand
 *   → Reduces initial bundle size
 *   → Network tab shows separate chunks loading
 * ============================================
 */

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    /**
     * ============================================
     * CONCEPT: Default Route with Redirect
     * ============================================
     *
     * 📚 WHAT: What happens when user visits root URL
     *
     * pathMatch: 'full' means exact match only
     *   - Without it, '' matches everything!
     */
    {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full',
    },

    /**
     * ============================================
     * CONCEPT: Lazy Loading Components
     * ============================================
     *
     * 📚 WHAT: Load component only when route is visited
     *
     * ⚙️ HOW: loadComponent takes a function that returns
     * a dynamic import. Webpack splits this into separate chunk.
     *
     * 🤔 WHY dynamic import?
     *   - import() is a JavaScript feature
     *   - Returns a Promise
     *   - Webpack/bundler creates separate chunk
     *   - Loaded over network when needed
     */
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login.component').then(
                (m) => m.LoginComponent
            ),
    },

    {
        path: 'register',
        loadComponent: () =>
            import('./features/auth/register/register.component').then(
                (m) => m.RegisterComponent
            ),
    },

    /**
     * ============================================
     * CONCEPT: Route Guards
     * ============================================
     *
     * 📚 WHAT: Check if user can access a route
     *
     * ⚙️ HOW: canActivate runs before loading component
     *   - Returns true → proceed
     *   - Returns false → block
     *   - Returns UrlTree → redirect
     *
     * Guard types:
     *   - canActivate: Can user access this route?
     *   - canDeactivate: Can user leave this route?
     *   - canMatch: Should this route even be considered?
     *   - resolve: Load data before component loads
     */
    {
        path: 'tasks',
        loadComponent: () =>
            import('./features/tasks/task-list/task-list.component').then(
                (m) => m.TaskListComponent
            ),
        canActivate: [authGuard], // Must be logged in
    },

    {
        path: 'tasks/new',
        loadComponent: () =>
            import('./features/tasks/task-form/task-form.component').then(
                (m) => m.TaskFormComponent
            ),
        canActivate: [authGuard],
    },

    {
        path: 'tasks/:id',
        loadComponent: () =>
            import('./features/tasks/task-form/task-form.component').then(
                (m) => m.TaskFormComponent
            ),
        canActivate: [authGuard],
    },

    /**
     * ============================================
     * CONCEPT: Wildcard Route (404)
     * ============================================
     *
     * 📚 WHAT: Catches all unmatched routes
     *
     * ⚠️ MUST be last! Routes are matched in order.
     */
    {
        path: '**',
        loadComponent: () =>
            import('./features/not-found/not-found.component').then(
                (m) => m.NotFoundComponent
            ),
    },
];

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. Routes are matched in ORDER (first match wins)
 * 2. Use loadComponent for lazy loading
 * 3. canActivate guards protect routes
 * 4. pathMatch: 'full' for exact empty path match
 * 5. Wildcard '**' catches unmatched (must be last)
 *
 * ============================================
 * 📚 NEXT: Check out ./core/guards/auth.guard.ts
 * ============================================
 */
