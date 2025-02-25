import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { User } from '@angular/fire/auth';
import { map, take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Protects routes by ensuring only authenticated users can access them.
   * Redirects to /login if there is no authenticated user.
   * @returns Observable<boolean> indicating whether access is allowed
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
