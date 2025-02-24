import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
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
import { MatMenuModule } from '@angular/material/menu';
import { ServiceService } from '../../services/service/service.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { Service } from '../../models/service.model';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { loadStripe } from '@stripe/stripe-js';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Firestore } from '@angular/fire/firestore';
import { doc, updateDoc } from '@angular/fire/firestore';
import { defaultIfEmpty, tap, shareReplay, take } from 'rxjs/operators';

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
    MatMenuModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit, OnDestroy {
  services$: Observable<Service[]>;
  createServiceForm: FormGroup;
  priceUpdateForm: FormGroup;
  loading = false;
  error = '';
  priceError = '';
  createError = '';
  editingServiceId: string | null = null;
  updatingPriceServiceId: string | null = null;
  isPremium$: Observable<boolean>;
  isPremium: boolean = false;
  private cdr: ChangeDetectorRef;
  private subscription: Subscription | null = null;
  stripePromise = loadStripe(
    'pk_test_51QvxedEHVvkxjWeE3degjZcTbX4bAbSVOTWrhtEnyxq0eRiRjmSuDpuEATptGh8gkNx2ukPHJqMPLXIKJwmIWDCH00M3cjhLdj'
  );

  constructor(
    private serviceService: ServiceService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private functions: AngularFireFunctions,
    private firestore: Firestore,
    cdr: ChangeDetectorRef
  ) {
    this.services$ = this.serviceService.getServices();
    this.isPremium$ = this.authService.isPremium$().pipe(
      shareReplay(1),
      tap((isPremium) =>
        console.log(
          'isPremium emitted (constructor):',
          isPremium,
          'Type:',
          typeof isPremium
        )
      )
    );
    this.cdr = cdr;
    this.createServiceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
    });
    this.priceUpdateForm = this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.subscription = this.isPremium$
      .pipe(
        defaultIfEmpty(false),
        tap((isPremium) => {
          console.log(
            'isPremium emitted (ngOnInit):',
            isPremium,
            'Type:',
            typeof isPremium
          );
          this.isPremium = isPremium;
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async onCreateService() {
    if (this.createServiceForm.invalid) {
      this.createError = 'Please fill all fields correctly.';
      return;
    }

    this.loading = true;
    this.createError = '';
    this.error = '';
    try {
      const service: Service = this.createServiceForm.value;
      await this.serviceService.addService(service);
      this.snackBar.open('Service created successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
      this.resetCreateForm();
    } catch (error: any) {
      this.createError = error.message;
      this.error = error.message;
      this.snackBar.open(`Error creating service: ${error.message}`, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading = false;
    }
  }

  async onUpdatePrice() {
    if (this.priceUpdateForm.invalid) {
      this.priceError = 'Please enter a valid price.';
      return;
    }

    if (!this.updatingPriceServiceId) {
      this.error = 'No service selected for price update.';
      return;
    }

    this.loading = true;
    this.priceError = '';
    this.error = '';

    const isPremium = await this.isPremium$.toPromise();
    if (!isPremium) {
      this.error = 'You need a premium subscription to update prices.';
      this.snackBar.open('Upgrade to premium to update prices.', 'Close', {
        duration: 5000,
        panelClass: ['warning-snackbar'],
      });
      this.loading = false;
      return;
    }

    try {
      const updatedPrice = this.priceUpdateForm.value.price;
      await this.serviceService.updateService(this.updatingPriceServiceId, {
        price: updatedPrice,
      });
      this.snackBar.open('Price updated successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
      this.resetPriceForm();
    } catch (error: any) {
      this.error = error.message;
      this.snackBar.open(`Error updating price: ${error.message}`, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading = false;
    }
  }

  editService(service: Service) {
    this.updatingPriceServiceId = service.id || null;
    this.priceUpdateForm.patchValue({
      price: service.price,
    });
    this.priceError = '';
    this.error = '';
  }

  async deleteService(id: string | undefined) {
    if (!id) {
      this.error = 'Service ID is missing.';
      return;
    }

    this.loading = true;
    this.error = '';
    try {
      await this.serviceService.deleteService(id);
      this.snackBar.open('Service deleted successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
    } catch (error: any) {
      this.error = error.message;
      this.snackBar.open(`Error deleting service: ${error.message}`, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading = false;
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
    this.snackBar.open('Logged out successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
    this.isPremium = false;
    this.cdr.detectChanges();
  }

  resetCreateForm() {
    this.createServiceForm.reset({
      name: '',
      description: '',
      price: 0,
      category: '',
    });
    this.createError = '';
    this.error = '';
  }

  resetPriceForm() {
    this.priceUpdateForm.reset({ price: 0 });
    this.updatingPriceServiceId = null;
    this.priceError = '';
    this.error = '';
  }

  getServiceName(services: Service[]): string {
    const service = services.find((s) => s.id === this.updatingPriceServiceId);
    return service?.name || 'Service';
  }

  async subscribe() {
    this.loading = true;
    try {
      const stripe = await this.stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js failed to load. Please try again.');
      }
      const callable = this.functions.httpsCallable('createCheckoutSession');
      const result: any = await callable({}).toPromise();
      await stripe.redirectToCheckout({ sessionId: result.sessionId });
    } catch (error) {
      this.error =
        'Error subscribing: ' +
        (error instanceof Error ? error.message : 'Unknown error');
      this.snackBar.open(this.error, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading = false;
    }
  }

  async unsubscribe() {
    this.loading = true;
    try {
      const callable = this.functions.httpsCallable('cancelSubscription');
      await callable({}).toPromise();
      const user = await this.authService.user$.pipe(take(1)).toPromise();
      if (user) {
        await updateDoc(doc(this.firestore, 'users', user.uid), {
          isPremium: false,
        });
      }
      this.snackBar.open('Subscription canceled successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
      this.isPremium = false;
      this.cdr.detectChanges();
    } catch (error) {
      this.error =
        'Error canceling subscription: ' +
        (error instanceof Error ? error.message : 'Unknown error');
      this.snackBar.open(this.error, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.loading = false;
    }
  }
}
