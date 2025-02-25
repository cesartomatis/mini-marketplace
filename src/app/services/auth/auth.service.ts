import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

/**
 * Service for handling user authentication operations.
 * Provides methods for login, registration, and logout using Firebase Authentication.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Observable that emits the current authenticated user or null if not authenticated. */
  user$: Observable<User | null>;

  /**
   * Initializes the authentication service with Firebase Auth.
   * @param auth - Firebase Auth instance for authentication operations.
   */
  constructor(private auth: Auth) {
    this.user$ = authState(this.auth);
  }

  /**
   * Logs in a user with email and password.
   * @param email - User's email address.
   * @param password - User's password.
   * @returns {Promise<any>} - A promise that resolves with the authentication result.
   * @throws {Error} - If the credentials are invalid or authentication fails.
   */
  async login(email: string, password: string): Promise<any> {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Registers a new user with email and password.
   * @param email - User's email address.
   * @param password - User's password.
   * @returns {Promise<any>} - A promise that resolves with the registration result.
   * @throws {Error} - If registration fails due to existing email or other issues.
   */
  async register(email: string, password: string): Promise<any> {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Logs out the current user.
   * @returns {Promise<void>} - A promise that resolves when the user is logged out.
   */
  async logout(): Promise<void> {
    return await signOut(this.auth);
  }

  /**
   * Handles error messages from Firebase Authentication.
   * @param error - Error object from Firebase Auth.
   * @returns {string} - A user-friendly error message based on the error code.
   */
  private handleError(error: any): string {
    if (error.code === 'auth/email-already-in-use')
      return 'This email is already registered';
    return 'An error occurred during authentication. Please try again.';
  }
}
