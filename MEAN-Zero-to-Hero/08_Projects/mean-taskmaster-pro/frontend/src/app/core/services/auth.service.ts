/**
 * ============================================
 * CONCEPT: Angular Service with Signals
 * LEVEL: Intermediate → Advanced
 * ============================================
 *
 * 📚 WHAT: AuthService handles all authentication logic
 *   - Login, register, logout
 *   - Token management
 *   - Current user state
 *
 * ⚙️ HOW (Angular 17+ Signals):
 *   - signal() creates reactive state
 *   - computed() creates derived state
 *   - effect() runs side effects on changes
 *
 * 🤔 WHY Signals over BehaviorSubject?
 *   - Simpler API (no need for .value, .next())
 *   - Synchronous reads
 *   - Better change detection
 *   - Works without zone.js
 *
 * BEFORE (RxJS):
 *   private userSubject = new BehaviorSubject<User | null>(null);
 *   user$ = this.userSubject.asObservable();
 *   // Set: this.userSubject.next(user)
 *   // Get: subscribe to user$
 *
 * AFTER (Signals):
 *   user = signal<User | null>(null);
 *   // Set: this.user.set(user)
 *   // Get: this.user() - it's a function call!
 *
 * 💡 INTERVIEW TIP: "What are Angular Signals?"
 *   → Reactive primitives for state management
 *   → Sync read, notify on change
 *   → Enables zoneless change detection
 *   → signal() for writable, computed() for derived
 * ============================================
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * ============================================
 * CONCEPT: TypeScript Interfaces for API Types
 * ============================================
 */
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        tokens: Tokens;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

/**
 * ============================================
 * AUTH SERVICE
 * ============================================
 *
 * providedIn: 'root' means:
 *   - Single instance for entire app (singleton)
 *   - Automatically provided (no need to add to providers)
 *   - Tree-shakeable (removed if not used)
 */
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = `${environment.apiUrl}/auth`;

    /**
     * ============================================
     * CONCEPT: Angular Signals for State
     * ============================================
     *
     * 📚 WHAT: signal() creates reactive state container
     *
     * ⚙️ HOW:
     *   - signal<Type>(initialValue) creates the signal
     *   - .set(value) replaces the value
     *   - .update(fn) updates based on current value
     *   - () invokes to read (it's a function!)
     *
     * ⚠️ COMMON MISTAKE: Forgetting to call as function
     *   ❌ this.user
     *   ✅ this.user()
     */
    private currentUser = signal<User | null>(null);
    private tokens = signal<Tokens | null>(null);

    /**
     * ============================================
     * CONCEPT: Computed Signals
     * ============================================
     *
     * 📚 WHAT: computed() creates derived state
     *
     * ⚙️ HOW: Re-computes when dependencies change
     *   - Tracks which signals are read inside
     *   - Only re-runs when those signals change
     *   - Read-only (can't .set() on computed)
     */
    readonly user = computed(() => this.currentUser());
    readonly isAuthenticated = computed(() => !!this.currentUser());
    readonly userName = computed(() => this.currentUser()?.name ?? 'Guest');

    constructor() {
        // Load user from storage on init
        this.loadFromStorage();
    }

    /**
     * Load saved auth data from localStorage
     */
    private loadFromStorage(): void {
        try {
            const savedUser = localStorage.getItem('user');
            const savedTokens = localStorage.getItem('tokens');

            if (savedUser && savedTokens) {
                this.currentUser.set(JSON.parse(savedUser));
                this.tokens.set(JSON.parse(savedTokens));
            }
        } catch (e) {
            // Invalid data in storage
            this.clearStorage();
        }
    }

    /**
     * Save auth data to localStorage
     */
    private saveToStorage(user: User, tokens: Tokens): void {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('tokens', JSON.stringify(tokens));
    }

    /**
     * Clear storage
     */
    private clearStorage(): void {
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
    }

    /**
     * ============================================
     * CONCEPT: RxJS Operators (tap, catchError)
     * ============================================
     *
     * 📚 tap(): Side effect without modifying stream
     *   → Save to storage, update signal
     *   → Does NOT change the emitted value
     *
     * 📚 catchError(): Handle errors in stream
     *   → Transform error or rethrow
     *   → Returns an Observable (throwError or of())
     */
    login(credentials: LoginCredentials): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap((response) => {
                // Side effect: save user and tokens
                this.currentUser.set(response.data.user);
                this.tokens.set(response.data.tokens);
                this.saveToStorage(response.data.user, response.data.tokens);
            }),
            catchError((error) => {
                console.error('Login error:', error);
                return throwError(() => error);
            })
        );
    }

    register(data: RegisterData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
            tap((response) => {
                this.currentUser.set(response.data.user);
                this.tokens.set(response.data.tokens);
                this.saveToStorage(response.data.user, response.data.tokens);
            }),
            catchError((error) => {
                console.error('Register error:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Refresh access token using refresh token
     */
    refreshToken(): Observable<{ success: boolean; data: { tokens: Tokens } }> {
        const currentTokens = this.tokens();
        if (!currentTokens?.refreshToken) {
            return throwError(() => new Error('No refresh token'));
        }

        return this.http
            .post<{ success: boolean; data: { tokens: Tokens } }>(
                `${this.apiUrl}/refresh`,
                { refreshToken: currentTokens.refreshToken }
            )
            .pipe(
                tap((response) => {
                    this.tokens.set(response.data.tokens);
                    const user = this.currentUser();
                    if (user) {
                        this.saveToStorage(user, response.data.tokens);
                    }
                })
            );
    }

    /**
     * Logout - clear all auth data
     */
    logout(): void {
        // Call API to invalidate refresh token (fire and forget)
        if (this.tokens()) {
            this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
                error: () => { }, // Ignore errors
            });
        }

        // Clear local data
        this.currentUser.set(null);
        this.tokens.set(null);
        this.clearStorage();

        // Navigate to login
        this.router.navigate(['/login']);
    }

    /**
     * Get current access token (for interceptor)
     */
    getAccessToken(): string | null {
        return this.tokens()?.accessToken ?? null;
    }

    /**
     * Check if we have a valid token (might be expired though)
     */
    hasToken(): boolean {
        return !!this.tokens()?.accessToken;
    }
}

/**
 * ============================================
 * 🎯 KEY TAKEAWAYS
 * ============================================
 *
 * 1. signal() for reactive state, computed() for derived
 * 2. Signal is a function - call it to read: user()
 * 3. .set() replaces, .update() modifies
 * 4. providedIn: 'root' = singleton service
 * 5. tap() for side effects, catchError() for errors
 * 6. Store tokens securely (consider httpOnly cookies)
 *
 * ============================================
 * 📚 NEXT: Check out ./interceptors/auth.interceptor.ts
 * ============================================
 */
