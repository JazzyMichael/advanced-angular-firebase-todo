import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoTreeComponent } from './todo-tree.component';

describe('TodoTreeComponent', () => {
  let component: TodoTreeComponent;
  let fixture: ComponentFixture<TodoTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodoTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
