import { Component, ViewEncapsulation } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ServiceService } from '../../services/service/service.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { Service } from '../../models/service.model';
import { Observable } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { AddServiceDialogComponent } from '../add-service-dialog/add-service-dialog.component';
import { UpdatePriceDialogComponent } from '../update-price-dialog/update-price-dialog.component';

/**
 * Dashboard component for managing services, displaying a list of services, and handling CRUD operations.
 * Uses Angular Material for UI, Firebase for data management, and dialogs for add/update actions.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatIconModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class DashboardComponent {
  /**
   * Observable stream of services for the current user, fetched from Firestore in real-time.
   */
  services$: Observable<Service[]>;

  /**
   * Indicates whether an operation (e.g., delete, logout) is in progress, used for loading states.
   */
  loading = false;

  /**
   * Stores any general error message for display in the UI, cleared after operations.
   */
  error: string | null = null;

  /**
   * The ID of the service currently being updated, used to conditionally show the update price dialog.
   */
  updatingPriceServiceId: string | null = null;

  /**
   * Constructs the DashboardComponent with necessary services for Firebase, authentication, routing, and UI.
   * Initializes the services$ Observable with real-time data from ServiceService.
   * @param serviceService Service for managing Firestore service operations.
   * @param authService Service for handling user authentication state and actions.
   * @param router Angular router for navigation between routes.
   * @param fb FormBuilder for creating reactive forms (not used in this component currently).
   * @param snackBar Material snackbar for displaying notifications.
   * @param dialog Material dialog for opening add/update service dialogs.
   */
  constructor(
    private serviceService: ServiceService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    this.services$ = this.serviceService.getServices();
  }

  /**
   * Opens the dialog to add a new service.
   */
  openAddServiceDialog(): void {
    const dialogRef = this.dialog.open(AddServiceDialogComponent, {
      width: '400px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.services$ = this.serviceService.getServices();
      }
    });
  }

  /**
   * Opens the dialog to update a service's price.
   * @param service The service to update
   */
  openUpdatePriceDialog(service: Service): void {
    const dialogRef = this.dialog.open(UpdatePriceDialogComponent, {
      width: '400px',
      disableClose: false,
      data: { service },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.services$ = this.serviceService.getServices();
      }
    });
  }

  /**
   * Handles service deletion.
   * @param id The ID of the service to delete
   */
  async deleteService(id: string | undefined) {
    if (!id) {
      this.setError('Service ID is missing.');
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      await this.serviceService.deleteService(id);
      this.snackBar.open('Service deleted successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'An error occurred.';
      this.setError(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Handles the logout action.
   */
  async logout() {
    this.loading = true;
    this.error = null;
    try {
      await this.authService.logout();
      this.snackBar.open('Logged out successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
      this.router.navigate(['/login']);
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'An error occurred.';
      this.setError(errorMessage);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Gets the name of the service being updated.
   * @param services Array of services to search from (or null)
   * @returns The service name or 'Service' if not found or services is null
   */
  getServiceName(services: Service[] | null): string {
    if (!services) {
      return 'Service';
    }
    const service = services.find((s) => s.id === this.updatingPriceServiceId);
    return service?.name || 'Service';
  }

  /**
   * Sets a general error message and displays a snackbar notification.
   * @param message The error message to set
   */
  private setError(message: string) {
    this.error = message;
    this.snackBar.open(`Error: ${message}`, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
