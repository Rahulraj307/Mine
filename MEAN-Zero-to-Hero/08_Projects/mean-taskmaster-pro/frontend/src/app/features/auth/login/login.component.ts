/**
 * ============================================
 * CONCEPT: Reactive Forms
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: Login component with reactive form validation
 *
 * ⚙️ Reactive Forms vs Template Forms:
 *
 *   TEMPLATE FORMS:
 *   - Form logic in template
 *   - Two-way binding [(ngModel)]
 *   - Good for simple forms
 *
 *   REACTIVE FORMS:
 *   - Form logic in component
 *   - FormGroup, FormControl
 *   - Better for complex validation
 *   - Easier to test
 *
 * 💡 INTERVIEW TIP: "When to use Reactive vs Template forms?"
 *   → Template: Simple forms (login, contact)
 *   → Reactive: Complex forms (multi-step, dynamic)
 * ============================================
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="auth-container animate-fade-in">
      <div class="auth-card card">
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle text-muted">Sign in to your account</p>

        <!-- Error message -->
        @if (errorMessage()) {
          <div class="error-alert">
            {{ errorMessage() }}
          </div>
        }

        <!--
          ============================================
          CONCEPT: Reactive Form Template Binding
          ============================================
          
          [formGroup]="loginForm" → Connect template to FormGroup
          formControlName="email" → Connect input to FormControl
          (ngSubmit)="onSubmit()" → Handle form submission
        -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="you@example.com"
              [class.invalid]="isFieldInvalid('email')"
            />
            <!--
              Show validation errors
              
              touched: User has visited the field
              isFieldInvalid: Has errors AND touched
            -->
            @if (isFieldInvalid('email')) {
              <span class="error-text">
                @if (loginForm.get('email')?.errors?.['required']) {
                  Email is required
                } @else if (loginForm.get('email')?.errors?.['email']) {
                  Please enter a valid email
                }
              </span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="••••••••"
              [class.invalid]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <span class="error-text">Password is required</span>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <p class="auth-footer">
          Don't have an account?
          <a routerLink="/register">Sign up</a>
        </p>
      </div>
    </div>
  `,
    styles: [`
    .auth-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
    }

    .auth-title {
      text-align: center;
      margin-bottom: var(--spacing-xs);
    }

    .auth-subtitle {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }

    .form-group {
      margin-bottom: var(--spacing-md);
    }

    .form-group label {
      display: block;
      margin-bottom: var(--spacing-xs);
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .form-group input.invalid {
      border-color: var(--color-danger);
    }

    .error-text {
      color: var(--color-danger);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
      display: block;
    }

    .error-alert {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--color-danger);
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
      color: var(--color-danger);
      margin-bottom: var(--spacing-lg);
    }

    .btn-full {
      width: 100%;
      margin-top: var(--spacing-md);
    }

    .auth-footer {
      text-align: center;
      margin-top: var(--spacing-lg);
      color: var(--color-text-muted);
    }
  `],
})
export class LoginComponent {
    /**
     * ============================================
     * CONCEPT: Inject Dependencies
     * ============================================
     */
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    /**
     * ============================================
     * CONCEPT: Signals for Component State
     * ============================================
     */
    isLoading = signal(false);
    errorMessage = signal('');

    /**
     * ============================================
     * CONCEPT: FormBuilder & FormGroup
     * ============================================
     *
     * 📚 WHAT: FormBuilder is a helper to create forms
     *
     * ⚙️ HOW:
     *   - fb.group() creates FormGroup
     *   - Each key is a FormControl
     *   - Array syntax: [initialValue, validators]
     *
     * Validators:
     *   - Validators.required → Field must have value
     *   - Validators.email → Must be valid email
     *   - Validators.minLength(n) → Min characters
     *   - Custom validators possible
     */
    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
    });

    /**
     * Check if field should show error
     */
    isFieldInvalid(fieldName: string): boolean {
        const field = this.loginForm.get(fieldName);
        return !!(field?.invalid && field?.touched);
    }

    /**
     * ============================================
     * CONCEPT: Form Submission
     * ============================================
     */
    onSubmit(): void {
        // Mark all fields as touched to show errors
        this.loginForm.markAllAsTouched();

        // Check if form is valid
        if (this.loginForm.invalid) {
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set('');

        /**
         * ============================================
         * CONCEPT: Subscribing to Observables
         * ============================================
         *
         * 📚 WHAT: Subscribe to get values from Observable
         *
         * ⚙️ HOW: subscribe({ next, error, complete })
         *
         * ⚠️ Memory leaks? In components:
         *   - HTTP observables complete automatically
         *   - No need to unsubscribe
         */
        this.authService.login(this.loginForm.value).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigate(['/tasks']);
            },
            error: (error) => {
                this.isLoading.set(false);
                this.errorMessage.set(
                    error.error?.error || 'Login failed. Please try again.'
                );
            },
        });
    }
}
