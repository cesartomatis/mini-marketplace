import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();

const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: '2025-01-27.acacia',
});

export const createCheckoutSession = onCall(
  { region: 'us-central1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Debes estar autenticado para realizar esta acción.'
      );
    }

    const userId = request.auth.uid;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_xxxxxxxxxxxx',
            quantity: 1,
          },
        ],
        success_url: 'http://localhost:4200/success',
        cancel_url: 'http://localhost:4200/cancel',
        metadata: { userId },
      });

      return { sessionId: session.id };
    } catch (error) {
      throw new HttpsError(
        'internal',
        'Error al crear la sesión: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }
);

export const stripeWebhook = onRequest(
  { region: 'us-central1' },
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = 'whsec_xxxxxxxxxxxx';

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

    res.status(200).send('Webhook recibido');
  }
);
