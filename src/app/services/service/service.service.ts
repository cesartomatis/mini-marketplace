import { AuthService } from '../auth/auth.service';
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
import { switchMap, take } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private servicesCollection: CollectionReference<Service>;

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.servicesCollection = collection(
      this.firestore,
      'services'
    ) as CollectionReference<Service>;
  }

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
                id: doc.id,
                ...(doc.data() as Service),
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

  async addService(service: Service) {
    const user = await firstValueFrom(this.authService.user$.pipe(take(1)));
    if (!user) throw new Error('No user authenticated');
    return addDoc(this.servicesCollection, { ...service, userId: user.uid });
  }

  async updateService(id: string, service: Partial<Service>) {
    const serviceDoc = doc(this.firestore, 'services', id);
    return updateDoc(serviceDoc, service);
  }

  async deleteService(id: string) {
    const serviceDoc = doc(this.firestore, 'services', id);
    return deleteDoc(serviceDoc);
  }
}
