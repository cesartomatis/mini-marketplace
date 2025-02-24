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
import { map, switchMap, catchError, tap, shareReplay } from 'rxjs/operators';

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
      await setDoc(
        doc(this.firestore, 'users', result.user.uid),
        {
          email: result.user.email,
          isPremium: false,
        },
        { merge: true }
      );
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
          console.log('No user authenticated, returning false');
          return of(false);
        }
        console.log('Fetching isPremium for user:', user.uid);
        return from(getDoc(doc(this.firestore, 'users', user.uid))).pipe(
          tap((snapshot) => console.log('Firestore snapshot:', snapshot)),
          map((snapshot: DocumentSnapshot) => {
            if (!snapshot.exists()) {
              console.log('User document does not exist, returning false');
              return false;
            }
            const data = snapshot.data();
            console.log('User data:', data);
            const isPremium =
              data && typeof data['isPremium'] === 'boolean'
                ? data['isPremium']
                : false;
            console.log(
              'isPremium value:',
              isPremium,
              'Type:',
              typeof isPremium
            );
            return isPremium;
          }),
          catchError((error) => {
            console.error('Error fetching isPremium:', error);
            return of(false);
          })
        );
      }),
      shareReplay(1)
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
          ),
          catchError((error) => {
            console.error('Error fetching user data:', error);
            return of(null);
          })
        );
      })
    );
  }
}
