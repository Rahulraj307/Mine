/**
 * ============================================
 * CONCEPT: Form Component with Route Params
 * LEVEL: Intermediate
 * ============================================
 */

import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
    FormArray,
} from '@angular/forms';
import { TaskService, Task } from '../../../core/services/task.service';

@Component({
    selector: 'app-task-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="container animate-fade-in">
      <div class="form-container card">
        <h1>{{ isEditMode() ? 'Edit Task' : 'Create Task' }}</h1>

        @if (errorMessage()) {
          <div class="error-alert">{{ errorMessage() }}</div>
        }

        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="title">Title *</label>
            <input
              type="text"
              id="title"
              formControlName="title"
              placeholder="What needs to be done?"
              [class.invalid]="isFieldInvalid('title')"
            />
            @if (isFieldInvalid('title')) {
              <span class="error-text">Title is required (3-100 chars)</span>
            }
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              formControlName="description"
              placeholder="Add more details..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="status">Status</label>
              <select id="status" formControlName="status">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div class="form-group">
              <label for="priority">Priority</label>
              <select id="priority" formControlName="priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div class="form-group">
              <label for="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                formControlName="dueDate"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              formControlName="tagsInput"
              placeholder="work, urgent, meeting"
            />
          </div>

          <!-- Subtasks -->
          <div class="form-group">
            <label>Subtasks</label>
            <div class="subtasks-list">
              @for (subtask of subtasks.controls; track $index) {
                <div class="subtask-item">
                  <input
                    type="text"
                    [formControl]="$any(subtask).controls.title"
                    placeholder="Subtask title"
                  />
                  <button type="button" class="btn btn-danger" (click)="removeSubtask($index)">
                    ✕
                  </button>
                </div>
              }
            </div>
            <button type="button" class="btn btn-secondary" (click)="addSubtask()">
              + Add Subtask
            </button>
          </div>

          <div class="form-actions">
            <a routerLink="/tasks" class="btn btn-secondary">Cancel</a>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isLoading()"
            >
              @if (isLoading()) {
                <span class="spinner"></span>
                {{ isEditMode() ? 'Updating...' : 'Creating...' }}
              } @else {
                {{ isEditMode() ? 'Update Task' : 'Create Task' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .form-container {
      max-width: 600px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: var(--spacing-xl);
    }

    .form-group {
      margin-bottom: var(--spacing-md);
    }

    .form-group label {
      display: block;
      margin-bottom: var(--spacing-xs);
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-md);
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-group input.invalid {
      border-color: var(--color-danger);
    }

    .error-text {
      color: var(--color-danger);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
      display: block;
    }

    .error-alert {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--color-danger);
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
      color: var(--color-danger);
      margin-bottom: var(--spacing-lg);
    }

    .subtasks-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
    }

    .subtask-item {
      display: flex;
      gap: var(--spacing-sm);
    }

    .subtask-item input {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--color-border);
    }
  `],
})
export class TaskFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private taskService = inject(TaskService);
    private router = inject(Router);

    /**
     * ============================================
     * CONCEPT: Input from Route Params
     * ============================================
     *
     * With withComponentInputBinding() in routes,
     * route params are automatically bound to inputs!
     *
     * :id in route → id input property
     */
    id = input<string>();

    isLoading = signal(false);
    errorMessage = signal('');
    isEditMode = signal(false);
    existingTask = signal<Task | null>(null);

    taskForm: FormGroup = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        description: [''],
        status: ['todo'],
        priority: ['medium'],
        dueDate: [''],
        tagsInput: [''],
        subtasks: this.fb.array([]),
    });

    get subtasks(): FormArray {
        return this.taskForm.get('subtasks') as FormArray;
    }

    ngOnInit(): void {
        const taskId = this.id();
        if (taskId) {
            this.isEditMode.set(true);
            this.loadTask(taskId);
        }
    }

    loadTask(id: string): void {
        this.isLoading.set(true);
        this.taskService.getTask(id).subscribe({
            next: (task) => {
                this.existingTask.set(task);
                this.taskForm.patchValue({
                    title: task.title,
                    description: task.description || '',
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                    tagsInput: task.tags.join(', '),
                });

                // Load subtasks
                task.subtasks.forEach((st) => {
                    this.subtasks.push(
                        this.fb.group({
                            title: [st.title],
                            completed: [st.completed],
                        })
                    );
                });

                this.isLoading.set(false);
            },
            error: (error) => {
                this.errorMessage.set(error.message || 'Failed to load task');
                this.isLoading.set(false);
            },
        });
    }

    addSubtask(): void {
        this.subtasks.push(
            this.fb.group({
                title: [''],
                completed: [false],
            })
        );
    }

    removeSubtask(index: number): void {
        this.subtasks.removeAt(index);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.taskForm.get(fieldName);
        return !!(field?.invalid && field?.touched);
    }

    onSubmit(): void {
        this.taskForm.markAllAsTouched();

        if (this.taskForm.invalid) {
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set('');

        const formValue = this.taskForm.value;
        const taskData = {
            title: formValue.title,
            description: formValue.description,
            status: formValue.status,
            priority: formValue.priority,
            dueDate: formValue.dueDate || undefined,
            tags: formValue.tagsInput
                ? formValue.tagsInput.split(',').map((t: string) => t.trim()).filter(Boolean)
                : [],
            subtasks: formValue.subtasks.filter((st: any) => st.title.trim()),
        };

        const request$ = this.isEditMode()
            ? this.taskService.updateTask(this.id()!, taskData)
            : this.taskService.createTask(taskData);

        request$.subscribe({
            next: () => {
                this.router.navigate(['/tasks']);
            },
            error: (error) => {
                this.errorMessage.set(error.message || 'Failed to save task');
                this.isLoading.set(false);
            },
        });
    }
}
