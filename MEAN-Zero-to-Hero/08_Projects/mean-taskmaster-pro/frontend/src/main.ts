/**
 * ============================================
 * CONCEPT: Angular Application Bootstrap
 * LEVEL: Beginner → Intermediate
 * ============================================
 *
 * 📚 WHAT: This is the entry point of our Angular application.
 * It bootstraps (starts) the application.
 *
 * ⚙️ HOW (Angular 17+ Standalone):
 *   - No NgModule required!
 *   - bootstrapApplication() directly bootstraps a component
 *   - Providers are passed in the config object
 *
 * 🤔 WHY standalone?
 *   - Less boilerplate (no NgModule)
 *   - Better tree-shaking (smaller bundles)
 *   - Clearer dependencies (imports in component)
 *   - Easier to understand for beginners
 *
 * ⚠️ COMMON MISTAKE: Forgetting to provide services
 *   → provideHttpClient() for HTTP
 *   → provideRouter() for routing
 *   → These replace module imports
 *
 * 💡 INTERVIEW TIP: "What changed in Angular 17?"
 *   → Standalone components by default
 *   → Signals for reactivity
 *   → Deferrable views (@defer)
 *   → New control flow (@if, @for)
 * ============================================
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

/**
 * ============================================
 * CONCEPT: Application Providers
 * ============================================
 *
 * 📚 WHAT: Configure application-wide services
 *
 * ⚙️ PROVIDERS EXPLAINED:
 *
 * provideRouter(routes):
 *   → Enables routing
 *   → withComponentInputBinding() binds route params to inputs
 *
 * provideHttpClient():
 *   → Enables HttpClient for API calls
 *   → withInterceptors() adds HTTP interceptors
 *
 * provideAnimations():
 *   → Enables Angular animations
 *   → Required for @angular/animations
 */
bootstrapApplication(AppComponent, {
    providers: [
        // Router with route param binding
        provideRouter(routes, withComponentInputBinding()),

        // HTTP client with auth interceptor
        provideHttpClient(withInterceptors([authInterceptor])),

        // Enable animations
        provideAnimations(),
    ],
}).catch((err) => console.error('Bootstrap error:', err));

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. Angular 17+ uses standalone by default
 * 2. No NgModule needed for basic apps
 * 3. Providers replace module imports
 * 4. bootstrapApplication starts the app
 * 5. Interceptors are added via withInterceptors
 *
 * ============================================
 * 📚 NEXT: Check out ./app/app.component.ts
 * ============================================
 */
