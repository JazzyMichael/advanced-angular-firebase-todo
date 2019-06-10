import { Component, OnChanges, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { TreeService } from '../tree.service';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';

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

@Component({
  selector: 'app-todo-tree',
  templateUrl: './todo-tree.component.html',
  styleUrls: ['./todo-tree.component.scss'],
  providers: [TreeService]
})
export class TodoTreeComponent implements OnInit, OnDestroy {
  @Input() addingRootLevel: boolean;
  @Output() addingRootEnded: EventEmitter<any> = new EventEmitter<any>();
  @Input() todoCard: any;
  @Input() userId: string;
  @Output() updateTodos: EventEmitter<any> = new EventEmitter<any>();

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
        ? existingNode
        : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  constructor(private treeService: TreeService) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren);

    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.treeService.dataChange.subscribe(data => {
      console.log({ data });
      this.dataSource.data = data;
      if (this.treeService.selectedData) {
        this.treeService.selectedData.forEach(data => {
          this.checklistSelection.select(data);
        });
      }
    });
  }

  ngOnInit() {
    const docRef = `users/${this.userId}/todos/${this.todoCard.id}`;
    this.treeService.initialize(docRef);
  }

  ngOnDestroy() {
    this.treeService.unSub();
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descendants.length && descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);

    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    const success = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );

    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  addRootLevel(name: string = 'default') {
    this.treeService.insertRootLevel(name);
    this.addingRootLevel = false;
    this.addingRootEnded.emit(true);
  }

  cancelAddingRoot() {
    this.addingRootLevel = false;
    this.addingRootEnded.emit(false);
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.treeService.insertItem(parentNode, '');
    this.treeControl.expand(node);
  }

  addFirstChild(node: TodoItemFlatNode) {
    const nestedNode = this.flatNodeMap.get(node);
    this.treeService.updateItem(nestedNode, null, [{ item: '', children: [], completed: false } as TodoItemNode]);
    this.treeControl.expand({ ...node, expandable: true });
  }

  hasEmptyChild(node: TodoItemFlatNode) {
    const nestedNode = this.flatNodeMap.get(node);
    if (!nestedNode.children || !nestedNode.children.length) return false;
    return nestedNode.children.some(x => !x.item);
  }

  cancelAdd(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    const filteredChildren = parentNode.children.filter(x => x.item);
    this.treeService.updateItem(parentNode, null, filteredChildren);
  }

  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.treeService.updateItem(nestedNode, itemValue, []);
  }

  hasAnyChildren(node: TodoItemFlatNode): boolean {
    const nestedNode = this.flatNodeMap.get(node);
    return nestedNode.children && nestedNode.children.length ? true : false;
  }

  logTree() {
    console.log('----- LOG TREE -----');
    console.log('Tree Data:', this.treeService.data);
    console.log('Selected', this.checklistSelection.selected);
    console.log('- - - - - - - - - -');
  }
}
