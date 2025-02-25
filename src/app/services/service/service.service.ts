import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  CollectionReference,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { Service } from '../../models/service.model';
import { AuthService } from '../auth/auth.service';
import { switchMap, take } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

/**
 * Service for managing services in Firestore, handling CRUD operations and real-time updates.
 * Provides methods to interact with the 'services' collection, scoped to the authenticated user.
 */
@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  /** Reference to the 'services' collection in Firestore, typed for Service model. */
  private servicesCollection: CollectionReference<Service>;

  /**
   * Constructs the ServiceService with Firestore and AuthService dependencies.
   * @param firestore - The Firestore instance for database operations.
   * @param authService - The AuthService for accessing the current user's authentication state.
   */
  constructor(private firestore: Firestore, private authService: AuthService) {
    this.servicesCollection = collection(
      this.firestore,
      'services'
    ) as CollectionReference<Service>;
  }

  /**
   * Retrieves services for the currently authenticated user in real-time.
   * Uses Firestore's onSnapshot for real-time updates, filtered by the user's ID.
   * @returns {Observable<Service[]>} - Observable emitting an array of services or an empty array if no user is authenticated.
   */
  getServices(): Observable<Service[]> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) return of([]);
        const q = query(
          this.servicesCollection,
          where('userId', '==', user.uid)
        );
        return new Observable<Service[]>((observer) => {
          const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              const services: Service[] = snapshot.docs.map((doc) => ({
                ...(doc.data() as Service),
                id: doc.id,
              }));
              observer.next(services);
            },
            (error) => observer.error(error)
          );
          return () => unsubscribe();
        });
      })
    );
  }

  /**
   * Adds a new service to Firestore, associating it with the current user's ID.
   * @param service - The service object to add (without id, as it's generated by Firestore).
   * @returns {Promise<any>} - Promise resolving to the created document reference.
   * @throws {Error} - If no user is authenticated or if the Firestore operation fails.
   */
  async addService(service: Service): Promise<any> {
    const user = await firstValueFrom(this.authService.user$.pipe(take(1)));
    if (!user || !user.uid)
      throw new Error('No user authenticated or UID missing');
    const dataToSend = { ...service, userId: user.uid };
    try {
      const docRef = await addDoc(this.servicesCollection, dataToSend);
      return docRef;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Updates an existing service in Firestore with partial data.
   * @param id - The ID of the service to update.
   * @param service - Partial service data to update (e.g., price).
   * @returns {Promise<void>} - Promise resolving when the update is complete.
   * @throws {Error} - If the Firestore operation fails.
   */
  async updateService(id: string, service: Partial<Service>): Promise<void> {
    const serviceDoc = doc(this.firestore, 'services', id);
    try {
      return await updateDoc(serviceDoc, service);
    } catch (error: any) {
      throw new Error(`Failed to update service: ${error.message}`);
    }
  }

  /**
   * Deletes a service from Firestore by its ID.
   * @param id - The ID of the service to delete.
   * @returns {Promise<void>} - Promise resolving when the deletion is complete.
   * @throws {Error} - If the Firestore operation fails.
   */
  async deleteService(id: string): Promise<void> {
    const serviceDoc = doc(this.firestore, 'services', id);
    try {
      return await deleteDoc(serviceDoc);
    } catch (error: any) {
      throw new Error(`Failed to delete service: ${error.message}`);
    }
  }
}
