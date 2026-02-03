/**
 * ============================================
 * CONCEPT: Registration with Password Validation
 * LEVEL: Intermediate
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
    AbstractControl,
    ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="auth-container animate-fade-in">
      <div class="auth-card card">
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle text-muted">Start managing your tasks today</p>

        @if (errorMessage()) {
          <div class="error-alert">{{ errorMessage() }}</div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              placeholder="John Doe"
              [class.invalid]="isFieldInvalid('name')"
            />
            @if (isFieldInvalid('name')) {
              <span class="error-text">Name is required (2-50 chars)</span>
            }
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="you@example.com"
              [class.invalid]="isFieldInvalid('email')"
            />
            @if (isFieldInvalid('email')) {
              <span class="error-text">Please enter a valid email</span>
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
              <span class="error-text">
                Password must be 8+ chars with uppercase, lowercase, number, and special char
              </span>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              placeholder="••••••••"
              [class.invalid]="isFieldInvalid('confirmPassword')"
            />
            @if (registerForm.get('confirmPassword')?.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched) {
              <span class="error-text">Passwords do not match</span>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Creating account...
            } @else {
              Create Account
            }
          </button>
        </form>

        <p class="auth-footer">
          Already have an account?
          <a routerLink="/login">Sign in</a>
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
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    isLoading = signal(false);
    errorMessage = signal('');

    /**
     * ============================================
     * CONCEPT: Custom Validators
     * ============================================
     *
     * 📚 WHAT: Create your own validation rules
     *
     * ⚙️ HOW: Function that returns ValidationErrors or null
     */
    registerForm: FormGroup = this.fb.group(
        {
            name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
            confirmPassword: ['', [Validators.required]],
        },
        {
            validators: this.passwordMatchValidator,
        }
    );

    /**
     * Custom password strength validator
     */
    passwordValidator(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        if (!value) return null;

        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[@$!%*?&]/.test(value);

        if (hasUpper && hasLower && hasNumber && hasSpecial) {
            return null;
        }

        return { passwordStrength: true };
    }

    /**
     * Cross-field validator: compare passwords
     */
    passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
        const password = form.get('password')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;

        if (password !== confirmPassword) {
            form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        return null;
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.registerForm.get(fieldName);
        return !!(field?.invalid && field?.touched);
    }

    onSubmit(): void {
        this.registerForm.markAllAsTouched();

        if (this.registerForm.invalid) {
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set('');

        this.authService.register(this.registerForm.value).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigate(['/tasks']);
            },
            error: (error) => {
                this.isLoading.set(false);
                this.errorMessage.set(
                    error.error?.error || 'Registration failed. Please try again.'
                );
            },
        });
    }
}
