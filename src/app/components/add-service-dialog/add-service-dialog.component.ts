import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceService } from '../../services/service/service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service } from '../../models/service.model';

/**
 * Component that provides a dialog for adding a new service to the marketplace.
 * Uses Angular Material for the UI and a reactive form to collect service details.
 * Integrates with ServiceService to persist the new service in Firestore.
 */
@Component({
  selector: 'app-add-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './add-service-dialog.component.html',
  styleUrls: ['./add-service-dialog.component.scss'],
})
export class AddServiceDialogComponent {
  /** Form group for collecting and validating service details. */
  createServiceForm: FormGroup;

  /** Indicates whether a service creation operation is in progress. */
  loading = false;

  /**
   * Initializes the dialog with a form for creating a new service.
   * @param dialogRef - Reference to the dialog for closing it programmatically.
   * @param fb - FormBuilder instance for creating the reactive form.
   * @param serviceService - Service for handling service-related operations.
   * @param snackBar - SnackBar for displaying success or error messages.
   */
  constructor(
    public dialogRef: MatDialogRef<AddServiceDialogComponent>,
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private snackBar: MatSnackBar
  ) {
    this.createServiceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
    });
  }

  /**
   * Handles the form submission to create a new service.
   * Validates the form, calls the service to add the new service, and provides user feedback via snackbar.
   * Closes the dialog on success.
   * @returns {Promise<void>} - A promise that resolves when the operation completes.
   * @throws {Error} - If the service creation fails due to Firestore errors or other issues.
   */
  async onSubmit(): Promise<void> {
    if (this.createServiceForm.invalid) {
      return;
    }
    this.loading = true;
    try {
      const service: Service = this.createServiceForm.value;
      await this.serviceService.addService(service);
      this.snackBar.open('Service created successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
      this.dialogRef.close(true);
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'An error occurred.';
      this.snackBar.open(`Error creating service: ${errorMessage}`, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading = false;
    }
  }
}
