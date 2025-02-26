import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import cors from 'cors';

/**
 * Initializes the Firebase Admin SDK for server-side operations.
 */
admin.initializeApp();

/**
 * Stripe instance initialized with the secret key from environment variables.
 */
const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: '2025-01-27.acacia',
});

/**
 * CORS configuration options to allow specific origins and methods.
 */
const corsOptions = {
  origin: ['http://localhost:4200', 'https://tu-dominio.web.app'], // Update with your production domain
  methods: ['POST'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Enable credentials if needed
};

/**
 * Callable function to create a Stripe checkout session for subscriptions.
 * @param request - The request object containing authentication data.
 * @returns A promise resolving to an object with the session ID.
 * @throws {HttpsError} - If the user is not authenticated or if session creation fails.
 */
export const createCheckoutSession = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'You must be authenticated to perform this action.'
      );
    }

    const userId = request.auth.uid;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_xxxxxxxxxxxx', // Replace with your Stripe price ID
            quantity: 1,
          },
        ],
        success_url: 'https://tu-proyecto.web.app/success',
        cancel_url: 'https://tu-proyecto.web.app/cancel',
        metadata: { userId },
      });

      return { sessionId: session.id };
    } catch (error) {
      throw new HttpsError(
        'internal',
        'Failed to create session: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }
);

/**
 * HTTP request handler for Stripe webhook events.
 * Processes checkout session completions to update user subscription status.
 * @param req - The HTTP request object containing webhook data.
 * @param res - The HTTP response object to send status back to Stripe.
 * @returns A promise resolving when the webhook is processed.
 */
export const stripeWebhook = onRequest(
  { region: 'us-central1' },
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = 'whsec_xxxxxxxxxxxx'; // Replace with your webhook secret

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook Error: ${(err as Error).message}`);
      res.status(400).send(`Webhook Error: ${(err as Error).message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        await admin.firestore().collection('users').doc(userId).update({
          isPremium: true,
          stripeCustomerId: session.customer,
          subscriptionId: session.subscription,
        });
      }
    }

    res.status(200).send('Webhook received');
  }
);

/**
 * HTTP request handler to test CORS configuration.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 */
export const testCORS = onRequest({ region: 'us-central1' }, (req, res) => {
  cors(corsOptions)(req, res, () => {
    res.status(200).send('CORS configured successfully');
  });
});
