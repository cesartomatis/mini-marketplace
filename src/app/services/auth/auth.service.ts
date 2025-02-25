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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = authState(this.auth);
  }

  /**
   * Logs in with email and password.
   * @param email User's email
   * @param password User's password
   * @returns Promise with the authentication result
   * @throws Error if the credentials are invalid
   */
  async login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Registers a new user with email and password.
   * @param email User's email
   * @param password User's password
   * @returns Promise with the registration result
   * @throws Error if the registration fails
   */
  async register(email: string, password: string) {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Logs out the current user.
   * @returns Promise with the logout result
   */
  async logout() {
    return await signOut(this.auth);
  }

  /**
   * Handles the error messages from Firebase Auth.
   * @param error Error object from Firebase Auth
   * @returns Error message
   */
  private handleError(error: any): string {
    if (error.code === 'auth/email-already-in-use')
      return 'This email is already registered';
    return 'An error occurred during authentication. Please try again.';
  }
}
