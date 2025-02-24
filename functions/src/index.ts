import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import cors from 'cors'; // Importa cors

// Inicializa Firebase Admin
admin.initializeApp();

// Inicializa Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  apiVersion: '2025-01-27.acacia',
});

// Configura CORS para permitir localhost:4200 y otros orígenes (ajústalo para producción)
const corsOptions = {
  origin: ['http://localhost:4200', 'https://tu-dominio.web.app'], // Añade tu dominio en producción
  methods: ['POST'], // Métodos permitidos (ajusta según necesidades)
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  credentials: true, // Permite cookies, autorización, etc., si es necesario
};

// Función para crear una sesión de checkout (mantén como callable para AngularFireFunctions)
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
            price: 'price_xxxxxxxxxxxx', // Reemplaza con tu ID de precio
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
        'Error al crear la sesión: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  }
);

// Webhook (mantén sin cambios, pero verifica si necesita CORS)
export const stripeWebhook = onRequest(
  { region: 'us-central1' },
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = 'whsec_xxxxxxxxxxxx'; // Reemplaza con tu secreto

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

// Función HTTPS para pruebas CORS (opcional, si necesitas una función genérica)
export const testCORS = onRequest({ region: 'us-central1' }, (req, res) => {
  cors(corsOptions)(req, res, () => {
    res.status(200).send('CORS configurado correctamente');
  });
});
