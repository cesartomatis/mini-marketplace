import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Login component for handling user authentication.
 * Manages the login form, authentication process, and navigation with animations.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class LoginComponent {
  /** Form group for collecting and validating login credentials. */
  loginForm: FormGroup;

  /** Indicates whether a login operation is in progress. */
  loading = false;

  /** Stores the error message to display, if any. */
  error: string | null = null;

  /** Controls the visibility of the password field. */
  showPassword = false;

  /**
   * Initializes the login form with email and password fields.
   * @param fb - FormBuilder instance for creating the reactive form.
   * @param authService - Service for handling authentication operations.
   * @param router - Router for navigating between routes.
   * @param snackBar - SnackBar for displaying success or error messages.
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Handles the login form submission.
   * Validates the form, attempts login, and navigates on success.
   * @returns {Promise<void>} - A promise that resolves when the login process completes.
   */
  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.setError('Please fill all fields correctly.');
      return;
    }
    await this.handleLoginAttempt();
    if (!this.error) {
      this.loginForm.reset();
    }
  }

  /**
   * Attempts to log in the user with provided credentials.
   * Manages loading state and error handling during authentication.
   * @returns {Promise<void>} - A promise that resolves when the login attempt completes.
   * @throws {Error} - If authentication fails due to invalid credentials or other issues.
   */
  private async handleLoginAttempt(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      await this.authService.login(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
      this.showSuccessNotification();
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      // Handle Firebase Authentication errors
      const errorMessage =
        error.message ||
        'Login failed. Please check your credentials or try again later.';
      this.setError(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Sets an error message and displays it via snackbar.
   * @param message - The error message to display.
   */
  private setError(message: string): void {
    this.error = message;
    this.snackBar.open(`Login error: ${message}`, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  /**
   * Displays a success notification via snackbar after a successful login.
   */
  private showSuccessNotification(): void {
    this.snackBar.open('Logged in successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  /**
   * Navigates to the registration page.
   */
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Toggles the visibility of the password input field.
   * @param event - The click event to prevent default behavior.
   */
  togglePasswordVisibility(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.showPassword = !this.showPassword;
  }
}
