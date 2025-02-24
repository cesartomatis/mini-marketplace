import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { map, take, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          this.router.navigate(['/login']);
          return [false];
        }

        if (state.url === '/dashboard') {
          return [true];
        }
        return this.authService.isPremium$().pipe(
          take(1),
          map((isPremium) => {
            if (isPremium || state.url !== '/dashboard') {
              return true;
            }
            this.router.navigate(['/subscribe']);
            return false;
          })
        );
      })
    );
  }
}
