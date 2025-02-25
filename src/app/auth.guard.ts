import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { User } from '@angular/fire/auth';
import { map, take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard for protecting routes by restricting access to authenticated users only.
 * Implements Angular's CanActivate interface to control route navigation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  /**
   * Initializes the guard with dependencies for authentication and routing.
   * @param authService - Service for accessing the current user's authentication state.
   * @param router - Router for navigating to other routes when access is denied.
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Determines if a route can be activated based on authentication status.
   * Redirects to the login page if the user is not authenticated.
   * @returns {Observable<boolean>} - Observable emitting true if access is allowed, false otherwise.
   */
  canActivate() {
    return this.authService.user$.pipe(
      take(1),
      map((user: User | null) => {
        if (user) return true;
        this.router.navigate(['/login']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
