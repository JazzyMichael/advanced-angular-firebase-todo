import { Component, OnInit, OnDestroy } from '@angular/core';
import { TodoService } from '../services/todo.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss']
})
export class TodosComponent implements OnInit, OnDestroy {
  newProjectName: string;
  todoCards: any[];
  addingRootLevel: string;
  userSub: Subscription;
  user: any;

  constructor(public todoService: TodoService, public auth: AuthService) {
    this.userSub = this.auth.user$.subscribe(user => {
      this.user = user ? user : null;
    });
  }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }

  addNewTodo() {
    if (!this.newProjectName || this.newProjectName.length < 2) return;

    this.todoService.addTodo({
      item: `${this.newProjectName}`,
      completed: false,
      children: []
    });

    this.newProjectName = null;
  }

  onProjectSelect(selection: any) {
    this.todoCards = selection.map(x => x.value);
  }
}
