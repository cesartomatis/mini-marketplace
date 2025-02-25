import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';

/**
 * Defines the application routes for navigation.
 * Configures paths for login, registration, dashboard, and a default redirect.
 */
export const routes: Routes = [
  /**
   * Route for the login page.
   */
  { path: 'login', component: LoginComponent },

  /**
   * Route for the registration page.
   */
  { path: 'register', component: RegisterComponent },

  /**
   * Route for the dashboard page, protected by an authentication guard.
   * Requires the user to be authenticated to access.
   */
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },

  /**
   * Default route that redirects to the login page.
   * Matches the empty path fully to ensure proper redirection.
   */
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
