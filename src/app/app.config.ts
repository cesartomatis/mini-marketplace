import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { environment } from '../environments/environment';

/**
 * Configuration object for the Angular application.
 * Sets up providers for routing, Firebase services, animations, and change detection.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Enables zone change detection with event coalescing for performance optimization.
     */
    provideZoneChangeDetection({ eventCoalescing: true }),

    /**
     * Provides the application's routing configuration using the defined routes.
     */
    provideRouter(routes),

    /**
     * Enables asynchronous animations for Angular Material components.
     */
    provideAnimationsAsync(),

    /**
     * Initializes the Firebase app with configuration from the environment.
     */
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    /**
     * Provides Firebase Authentication service for user management.
     */
    provideAuth(() => getAuth()),

    /**
     * Provides Firestore service for database operations.
     */
    provideFirestore(() => getFirestore()),
  ],
};
