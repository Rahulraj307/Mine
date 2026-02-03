/**
 * ============================================
 * CONCEPT: HTTP Interceptor (Functional Style)
 * LEVEL: Intermediate → Advanced
 * ============================================
 *
 * 📚 WHAT: Intercepts ALL HTTP requests/responses
 *
 * ⚙️ HOW (Angular 17+ Functional Interceptor):
 *   - Function instead of class
 *   - Takes req and next handler
 *   - Returns Observable of HttpEvent
 *
 * 🤔 WHY interceptor for auth?
 *   - DRY: Don't add token to every request manually
 *   - Centralized: All requests go through one point
 *   - Handle 401s: Auto-refresh or logout
 *
 * BEFORE (Class-based):
 *   @Injectable()
 *   export class AuthInterceptor implements HttpInterceptor {
 *     intercept(req, next) { ... }
 *   }
 *
 * AFTER (Functional - Angular 15+):
 *   export const authInterceptor: HttpInterceptorFn = (req, next) => { ... }
 *
 * ⚠️ COMMON MISTAKES:
 *   - Not cloning request before modifying
 *   - Infinite loops when refreshing token
 *   - Not handling all error cases
 *
 * 💡 INTERVIEW TIP: "What are HTTP interceptors?"
 *   → Middleware for HTTP requests
 *   → Can modify request (add headers)
 *   → Can transform response
 *   → Can retry failed requests
 * ============================================
 */

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Track if we're currently refreshing to avoid infinite loops
 */
let isRefreshing = false;

/**
 * ============================================
 * FUNCTIONAL HTTP INTERCEPTOR
 * ============================================
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    /**
     * ============================================
     * CONCEPT: Request Cloning
     * ============================================
     *
     * 📚 WHAT: HTTP requests are immutable
     *
     * ⚙️ HOW: Clone with modifications
     *   req.clone({ setHeaders: { ... } })
     *
     * 🤔 WHY immutable?
     *   - Predictable behavior
     *   - Safe to retry
     *   - Prevent accidental modifications
     */

    // Skip auth header for auth endpoints (login, register)
    const isAuthEndpoint = req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/refresh');

    let authReq = req;

    // Add auth header if we have a token and not auth endpoint
    if (!isAuthEndpoint && authService.hasToken()) {
        const token = authService.getAccessToken();
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * ============================================
     * CONCEPT: Response Handling & Error Recovery
     * ============================================
     *
     * ⚙️ FLOW:
     *   1. Make request with token
     *   2. If 401 (unauthorized) → try refresh token
     *   3. If refresh works → retry original request
     *   4. If refresh fails → logout
     */
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Only handle 401 errors (unauthorized)
            if (error.status === 401 && !isAuthEndpoint && !isRefreshing) {
                console.log('Token expired, attempting refresh...');

                isRefreshing = true;

                /**
                 * ============================================
                 * CONCEPT: switchMap for Chained Observables
                 * ============================================
                 *
                 * 📚 WHAT: switchMap chains async operations
                 *
                 * ⚙️ HOW: Subscribes to inner observable, 
                 * cancels previous if new value comes
                 *
                 * 🤔 WHY: We need to:
                 *   1. Refresh token (async)
                 *   2. Then retry original request (async)
                 */
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        isRefreshing = false;

                        // Clone original request with new token
                        const newToken = authService.getAccessToken();
                        const retryReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`,
                            },
                        });

                        console.log('Token refreshed, retrying request');
                        return next(retryReq);
                    }),
                    catchError((refreshError) => {
                        isRefreshing = false;
                        console.error('Token refresh failed:', refreshError);

                        // Refresh failed - logout user
                        authService.logout();
                        router.navigate(['/login']);

                        return throwError(() => refreshError);
                    })
                );
            }

            // For other errors, just pass through
            return throwError(() => error);
        })
    );
};

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. Functional interceptors are simpler (Angular 15+)
 * 2. Always clone request before modifying
 * 3. Handle 401s with token refresh
 * 4. Use flag to prevent refresh loops
 * 5. Logout on refresh failure
 * 6. Skip auth header for login/register
 *
 * ============================================
 * 📚 NEXT: Check out ./guards/auth.guard.ts
 * ============================================
 */
