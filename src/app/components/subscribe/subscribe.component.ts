import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss'],
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
})
export class SubscribeComponent implements OnInit {
  user$: Observable<any>;
  loading = false;
  error = '';
  stripePromise = loadStripe(
    'pk_test_51QvxedEHVvkxjWeE3degjZcTbX4bAbSVOTWrhtEnyxq0eRiRjmSuDpuEATptGh8gkNx2ukPHJqMPLXIKJwmIWDCH00M3cjhLdj'
  );

  constructor(
    private functions: AngularFireFunctions,
    private afAuth: AngularFireAuth
  ) {
    this.user$ = this.afAuth.authState;
  }

  ngOnInit() {}

  async subscribe() {
    if (!(await this.user$.pipe(take(1)).toPromise())) {
      this.error = 'Please log in to subscribe.';
      return;
    }

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
    } finally {
      this.loading = false;
    }
  }
}
