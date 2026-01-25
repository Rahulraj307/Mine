# Beginner Project: Todo Application

> Build a complete Angular Todo app with local storage.

---

## 🎯 What You'll Learn

- Angular component structure
- Two-way data binding
- Services for data management
- Local storage persistence
- Basic styling

---

## 📋 Features

- [ ] Add new todos
- [ ] Mark todos as complete
- [ ] Delete todos
- [ ] Filter by status (all/active/completed)
- [ ] Persist data in localStorage
- [ ] Clear completed

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── components/
│   │   ├── todo-list/
│   │   ├── todo-item/
│   │   └── todo-input/
│   ├── services/
│   │   └── todo.service.ts
│   ├── models/
│   │   └── todo.model.ts
│   └── app.component.ts
└── styles.css
```

---

## 📝 Step-by-Step Implementation

### Step 1: Create the Model

```typescript
// src/app/models/todo.model.ts
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}
```

### Step 2: Create the Service

```typescript
// src/app/services/todo.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly STORAGE_KEY = 'todos';
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  
  todos$: Observable<Todo[]> = this.todosSubject.asObservable();
  
  constructor() {
    this.loadFromStorage();
  }
  
  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const todos = JSON.parse(stored);
      this.todosSubject.next(todos);
    }
  }
  
  private saveToStorage(): void {
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this.todosSubject.value)
    );
  }
  
  addTodo(title: string): void {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: new Date()
    };
    
    const updated = [...this.todosSubject.value, newTodo];
    this.todosSubject.next(updated);
    this.saveToStorage();
  }
  
  toggleTodo(id: string): void {
    const updated = this.todosSubject.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.todosSubject.next(updated);
    this.saveToStorage();
  }
  
  deleteTodo(id: string): void {
    const updated = this.todosSubject.value.filter(todo => todo.id !== id);
    this.todosSubject.next(updated);
    this.saveToStorage();
  }
  
  clearCompleted(): void {
    const updated = this.todosSubject.value.filter(todo => !todo.completed);
    this.todosSubject.next(updated);
    this.saveToStorage();
  }
}
```

### Step 3: Create Todo Input Component

```typescript
// src/app/components/todo-input/todo-input.component.ts
import { Component } from '@angular/core';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-input',
  template: `
    <div class="todo-input">
      <input 
        type="text"
        [(ngModel)]="newTodoTitle"
        (keyup.enter)="addTodo()"
        placeholder="What needs to be done?"
        class="input-field"
      >
      <button (click)="addTodo()" class="add-btn">Add</button>
    </div>
  `,
  styles: [`
    .todo-input {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .input-field {
      flex: 1;
      padding: 12px;
      font-size: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
    }
    .add-btn {
      padding: 12px 24px;
      background: #4a90d9;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .add-btn:hover {
      background: #357abd;
    }
  `]
})
export class TodoInputComponent {
  newTodoTitle = '';
  
  constructor(private todoService: TodoService) {}
  
  addTodo(): void {
    if (this.newTodoTitle.trim()) {
      this.todoService.addTodo(this.newTodoTitle);
      this.newTodoTitle = '';
    }
  }
}
```

### Step 4: Create Todo Item Component

```typescript
// src/app/components/todo-item/todo-item.component.ts
import { Component, Input } from '@angular/core';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-item',
  template: `
    <div class="todo-item" [class.completed]="todo.completed">
      <input 
        type="checkbox" 
        [checked]="todo.completed"
        (change)="toggle()"
        class="checkbox"
      >
      <span class="title">{{ todo.title }}</span>
      <button (click)="delete()" class="delete-btn">×</button>
    </div>
  `,
  styles: [`
    .todo-item {
      display: flex;
      align-items: center;
      padding: 15px;
      background: white;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .completed .title {
      text-decoration: line-through;
      color: #999;
    }
    .checkbox {
      width: 20px;
      height: 20px;
      margin-right: 15px;
    }
    .title {
      flex: 1;
      font-size: 16px;
    }
    .delete-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #ff6b6b;
      cursor: pointer;
    }
  `]
})
export class TodoItemComponent {
  @Input() todo!: Todo;
  
  constructor(private todoService: TodoService) {}
  
  toggle(): void {
    this.todoService.toggleTodo(this.todo.id);
  }
  
  delete(): void {
    this.todoService.deleteTodo(this.todo.id);
  }
}
```

### Step 5: Create Todo List Component

```typescript
// src/app/components/todo-list/todo-list.component.ts
import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

type FilterType = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-todo-list',
  template: `
    <div class="container">
      <h1>Todo App</h1>
      
      <app-todo-input></app-todo-input>
      
      <div class="filters">
        <button 
          *ngFor="let f of filters"
          [class.active]="filter === f"
          (click)="filter = f"
        >
          {{ f | titlecase }}
        </button>
      </div>
      
      <div class="todo-list">
        <app-todo-item 
          *ngFor="let todo of filteredTodos$ | async"
          [todo]="todo"
        ></app-todo-item>
      </div>
      
      <div class="footer">
        <span>{{ (activeCount$ | async) }} items left</span>
        <button (click)="clearCompleted()">Clear completed</button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 500px;
      margin: 50px auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      color: #333;
    }
    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .filters button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    }
    .filters button.active {
      background: #4a90d9;
      color: white;
      border-color: #4a90d9;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      color: #666;
    }
    .footer button {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
    }
    .footer button:hover {
      text-decoration: underline;
    }
  `]
})
export class TodoListComponent {
  filters: FilterType[] = ['all', 'active', 'completed'];
  filter: FilterType = 'all';
  
  constructor(private todoService: TodoService) {}
  
  get filteredTodos$(): Observable<Todo[]> {
    return this.todoService.todos$.pipe(
      map(todos => {
        switch (this.filter) {
          case 'active':
            return todos.filter(t => !t.completed);
          case 'completed':
            return todos.filter(t => t.completed);
          default:
            return todos;
        }
      })
    );
  }
  
  get activeCount$(): Observable<number> {
    return this.todoService.todos$.pipe(
      map(todos => todos.filter(t => !t.completed).length)
    );
  }
  
  clearCompleted(): void {
    this.todoService.clearCompleted();
  }
}
```

---

## 🧪 Testing

```typescript
// src/app/services/todo.service.spec.ts
describe('TodoService', () => {
  let service: TodoService;
  
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });
  
  it('should add a todo', () => {
    service.addTodo('Test todo');
    
    service.todos$.subscribe(todos => {
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('Test todo');
      expect(todos[0].completed).toBeFalse();
    });
  });
  
  it('should toggle a todo', () => {
    service.addTodo('Test todo');
    
    service.todos$.subscribe(todos => {
      service.toggleTodo(todos[0].id);
    });
    
    service.todos$.subscribe(todos => {
      expect(todos[0].completed).toBeTrue();
    });
  });
  
  it('should persist to localStorage', () => {
    service.addTodo('Test todo');
    
    const stored = localStorage.getItem('todos');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).length).toBe(1);
  });
});
```

---

## 🎯 Challenges to Extend

1. **Edit in place:** Double-click to edit todo title
2. **Due dates:** Add optional due date with datepicker
3. **Categories:** Tag todos with categories
4. **Drag & drop:** Reorder todos
5. **Sync with backend:** Replace localStorage with API

---

**Next**: [Intermediate Projects](../intermediate/)
