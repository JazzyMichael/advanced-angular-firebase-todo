import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';

export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
}

export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

export class FireStoreTodo {
  item: string;
  completed: boolean;
  children?: FireStoreTodo[];
}

@Injectable()
export class TreeService {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] { return this.dataChange.value; }

  treeData: TodoItemNode[] = [];
  selectedData: TodoItemFlatNode[] = [];
  firestoreDataSub: Subscription;
  docRef: any;

  constructor(private afStore: AngularFirestore) { }

  initialize(todoDocRef) {
    if (!todoDocRef) return;
    if (this.firestoreDataSub) this.firestoreDataSub.unsubscribe();

    this.docRef = this.afStore.doc(todoDocRef);

    this.firestoreDataSub = this.docRef.valueChanges().subscribe((data: any) => {
      if (!data || !data.children) return;
      this.treeData = [];
      this.selectedData = [];

      data.children.forEach(todo => {
        this.treeData.push({ item: todo.item, children: todo.children });

        if (todo.completed) {
          this.selectedData.push({
            item: todo.item,
            level: 0,
            expandable: todo.children && todo.children.length ? true : false
          });
        }

        if (todo.children && todo.children.length) {
          this.checkChildren(todo.children, 1);
        }
      });

      this.dataChange.next(this.treeData);
    });
  }

  unSub() {
    if (this.firestoreDataSub) this.firestoreDataSub.unsubscribe();
  }

  checkChildren(children: FireStoreTodo[], level: number) {
    children.forEach((child: FireStoreTodo) => {
      if (child.completed) {
        this.selectedData.push({
          item: child.item,
          level,
          expandable: child.children && child.children.length ? true : false
        });
      }

      if (child.children && child.children.length) {
        this.checkChildren(child.children, level + 1);
      }
    });
  }

  insertRootLevel(name: string) {
    this.docRef.update({ children: [...this.treeData, { item: name, completed: false, children: []}] });
  }

  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({ item: name } as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name?: string, children?: any[]) {
    if (name) node.item = name;
    if (children) node.children = children;
    this.dataChange.next(this.data);
  }

  removeEmptyChildren(node: TodoItemNode) {
    if (node && node.children) {
      const newChildren = node.children.filter(child => child.item);
      node.children = newChildren;
    }

    this.dataChange.next(this.data);
  }
}
