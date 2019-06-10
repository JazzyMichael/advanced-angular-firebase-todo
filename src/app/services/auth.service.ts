import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, tap, startWith } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { auth } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<any>;
  user: any;

  constructor(
    private afAuth: AngularFireAuth,
    private afStore: AngularFirestore,
    private router: Router) {
      this.user$ = this.afAuth.authState.pipe(
        switchMap(user => user
          ? this.afStore.doc(`users/${user.uid}`).valueChanges()
          : of(null)
        ),
        tap(user => this.user = user)
      );
    }

    async googleSignIn() {
      const provider = new auth.GoogleAuthProvider();
      const authData = await this.afAuth.auth.signInWithPopup(provider);
      if (authData && authData.additionalUserInfo && authData.additionalUserInfo.isNewUser) {
        return this.createUserDoc(authData.user);
      }
      return;
    }

    async signOut() {
      await this.afAuth.auth.signOut();
      return this.router.navigate(['/']);
    }

    createUserDoc({ uid, displayName, email, phoneNumber, photoURL }) {
      const userDoc = this.afStore.doc(`users/${uid}`);

      const data = {
        uid,
        displayName,
        email,
        phoneNumber,
        photoURL
      };

      return userDoc.set(data);
    }
}
