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
 * Register component for handling user registration.
 */
@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Handles the registration form submission.
   * Validates the form, attempts registration, and navigates on success.
   */
  async onRegister() {
    if (this.registerForm.invalid) {
      this.setError('Please fill all fields correctly.');
      return;
    }
    await this.handleRegisterAttempt();
    if (!this.error) {
      this.registerForm.reset();
    }
  }

  private async handleRegisterAttempt() {
    this.loading = true;
    this.error = null;
    try {
      await this.authService.register(
        this.registerForm.value.email,
        this.registerForm.value.password
      );
      this.showSuccessNotification();
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.setError(error.message || 'Registration failed. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  private setError(message: string) {
    this.error = message;
    this.snackBar.open(`Registration error: ${message}`, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  private showSuccessNotification() {
    this.snackBar.open('Registered successfully! Please log in.', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  /**
   * Navigates to the login page.
   */
  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  /**
   * Toggles the visibility of the password input field.
   * @param event The click event to prevent default behavior
   */
  togglePasswordVisibility(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.showPassword = !this.showPassword;
  }
}
