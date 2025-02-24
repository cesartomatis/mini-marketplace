import { Injectable } from '@angular/core';
import {
  Auth,
  user,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { Observable, of, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.user$ = user(auth);
  }

  async login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  async register(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      await setDoc(doc(this.firestore, 'users', result.user.uid), {
        email: result.user.email,
        isPremium: false,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    return await signOut(this.auth);
  }

  isPremium$(): Observable<boolean> {
    return this.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return of(false);
        }
        return from(getDoc(doc(this.firestore, 'users', user.uid))).pipe(
          map((snapshot: DocumentSnapshot) =>
            snapshot.exists() ? snapshot.data()?.['isPremium'] ?? false : false
          )
        );
      })
    );
  }

  getUserData$(): Observable<any> {
    return this.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return of(null);
        }
        return from(getDoc(doc(this.firestore, 'users', user.uid))).pipe(
          map((snapshot: DocumentSnapshot) =>
            snapshot.exists() ? snapshot.data() : null
          )
        );
      })
    );
  }
}
