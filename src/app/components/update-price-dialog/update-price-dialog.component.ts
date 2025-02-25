import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceService } from '../../services/service/service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Service } from '../../models/service.model';

/**
 * Component that provides a dialog for updating the price of an existing service.
 * Uses Angular Material for the dialog UI and a reactive form to handle price updates.
 */
@Component({
  selector: 'app-update-price-dialog',
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
  templateUrl: './update-price-dialog.component.html',
  styleUrls: ['./update-price-dialog.component.scss'],
})
export class UpdatePriceDialogComponent {
  /** Form group for collecting and validating the updated price. */
  priceUpdateForm: FormGroup;

  /** Indicates whether a price update operation is in progress. */
  loading = false;

  /** The ID of the service being updated. */
  serviceId: string;

  /**
   * Initializes the dialog with a form pre-filled with the current service price.
   * @param dialogRef - Reference to the dialog for closing it programmatically.
   * @param data - Data injected into the dialog containing the service details.
   * @param fb - FormBuilder instance for creating the reactive form.
   * @param serviceService - Service for handling service-related operations.
   * @param snackBar - SnackBar for displaying success or error messages.
   */
  constructor(
    public dialogRef: MatDialogRef<UpdatePriceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { service: Service },
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private snackBar: MatSnackBar
  ) {
    this.serviceId = data.service.id || '';
    this.priceUpdateForm = this.fb.group({
      price: [data.service.price, [Validators.required, Validators.min(0)]],
    });
  }

  /**
   * Handles the form submission to update the service price.
   * Validates the form, updates the service price via the service, and provides feedback via snackbar.
   * @returns {Promise<void>} - A promise that resolves when the operation completes.
   * @throws {Error} - If the price update fails due to Firestore errors or other issues.
   */
  async onSubmit(): Promise<void> {
    if (this.priceUpdateForm.invalid) {
      return;
    }
    this.loading = true;
    try {
      const updatedPrice = this.priceUpdateForm.value.price;
      await this.serviceService.updateService(this.serviceId, {
        price: updatedPrice,
      });
      this.snackBar.open('Price updated successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
      this.dialogRef.close(true);
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'An error occurred.';
      this.snackBar.open(`Error updating price: ${errorMessage}`, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading = false;
    }
  }
}
