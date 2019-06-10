import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  todo$: Observable<any>;
  todoCollectionRef: any;

  constructor(private auth: AuthService, private afStore: AngularFirestore) {
    this.todo$ = this.auth.user$.pipe(
      switchMap(user => {
        if (user) {
          this.todoCollectionRef = this.afStore.collection(`users/${user.uid}/todos`);
          return this.todoCollectionRef.snapshotChanges();
        } else {
          this.todoCollectionRef = null;
          return of(null);
        }
      }),
      map((snapshot: any | null) => {
        return snapshot ? snapshot.map(x => {
          const data = x.payload.doc.data();
          const id = x.payload.doc.id;
          return { id, ...data };
        }) : null;
      })
    );
  }

  addTodo(todo: any) {
    this.todoCollectionRef.add(todo);
  }
}
