/**
 * ============================================
 * CONCEPT: Task List with Signal-Based State
 * LEVEL: Intermediate → Advanced
 * ============================================
 *
 * 📚 WHAT: Main task list component showing all tasks
 *
 * ⚙️ CONCEPTS DEMONSTRATED:
 *   - Signal-based state management
 *   - OnInit lifecycle hook
 *   - Component communication
 *   - Filtering and sorting
 *   - @for new control flow
 * ============================================
 */

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService, Task, TaskFilters } from '../../../core/services/task.service';

@Component({
    selector: 'app-task-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    template: `
    <div class="container animate-fade-in">
      <header class="page-header">
        <div>
          <h1>My Tasks</h1>
          <p class="text-muted">{{ taskCount() }} tasks total</p>
        </div>
        <a routerLink="/tasks/new" class="btn btn-primary">
          <span>+</span> New Task
        </a>
      </header>

      <!-- Stats Cards -->
      <div class="stats-grid">
        @for (stat of statsCards(); track stat.label) {
          <div class="stat-card card" [class]="'stat-' + stat.type">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label text-muted">{{ stat.label }}</span>
          </div>
        }
      </div>

      <!-- Filters -->
      <div class="filters card">
        <div class="filter-group">
          <label>Status</label>
          <select [(ngModel)]="filters.status" (change)="loadTasks()">
            <option value="">All</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Priority</label>
          <select [(ngModel)]="filters.priority" (change)="loadTasks()">
            <option value="">All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Sort By</label>
          <select [(ngModel)]="filters.sort" (change)="loadTasks()">
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="dueDate">Due Date</option>
            <option value="-priority">Priority</option>
          </select>
        </div>

        <div class="filter-group search">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search tasks..."
            [(ngModel)]="filters.search"
            (keyup.enter)="loadTasks()"
          />
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      }

      <!-- Task List -->
      @if (!isLoading()) {
        <div class="tasks-grid">
          <!--
            ============================================
            CONCEPT: @for Control Flow
            ============================================
            
            @for replaces *ngFor:
            - Cleaner syntax
            - track is REQUIRED (for performance)
            - @empty block for empty state
          -->
          @for (task of tasks(); track task._id) {
            <div class="task-card card" [class]="'priority-' + task.priority">
              <div class="task-header">
                <span class="task-status" [class]="'status-' + task.status">
                  {{ getStatusLabel(task.status) }}
                </span>
                <span class="task-priority" [class]="'priority-badge-' + task.priority">
                  {{ task.priority }}
                </span>
              </div>

              <h3 class="task-title">{{ task.title }}</h3>
              
              @if (task.description) {
                <p class="task-description text-muted">
                  {{ task.description | slice:0:100 }}{{ task.description.length > 100 ? '...' : '' }}
                </p>
              }

              <div class="task-meta">
                @if (task.dueDate) {
                  <span [class.overdue]="task.isOverdue">
                    📅 {{ task.dueDate | date:'mediumDate' }}
                  </span>
                }
                @if (task.subtasks.length > 0) {
                  <span>
                    ✓ {{ getCompletedSubtasks(task) }}/{{ task.subtasks.length }}
                  </span>
                }
              </div>

              @if (task.tags.length > 0) {
                <div class="task-tags">
                  @for (tag of task.tags.slice(0, 3); track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </div>
              }

              <div class="task-actions">
                <a [routerLink]="['/tasks', task._id]" class="btn btn-secondary">
                  Edit
                </a>
                @if (task.status !== 'completed') {
                  <button class="btn btn-primary" (click)="markComplete(task._id)">
                    Complete
                  </button>
                }
                <button class="btn btn-danger" (click)="deleteTask(task._id)">
                  Delete
                </button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <p class="text-muted">No tasks found</p>
              <a routerLink="/tasks/new" class="btn btn-primary">
                Create your first task
              </a>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (pagination()) {
          <div class="pagination">
            <button
              class="btn btn-secondary"
              [disabled]="!pagination()?.hasPrev"
              (click)="goToPage(pagination()!.page - 1)"
            >
              Previous
            </button>
            <span class="page-info">
              Page {{ pagination()?.page }} of {{ pagination()?.pages }}
            </span>
            <button
              class="btn btn-secondary"
              [disabled]="!pagination()?.hasNext"
              (click)="goToPage(pagination()!.page + 1)"
            >
              Next
            </button>
          </div>
        }
      }
    </div>
  `,
    styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .stat-card {
      text-align: center;
      padding: var(--spacing-lg);
    }

    .stat-value {
      display: block;
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--color-text);
    }

    .stat-label {
      font-size: var(--font-size-sm);
    }

    .stat-todo .stat-value { color: var(--color-info); }
    .stat-progress .stat-value { color: var(--color-warning); }
    .stat-completed .stat-value { color: var(--color-success); }
    .stat-overdue .stat-value { color: var(--color-danger); }

    .filters {
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-md);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .filter-group label {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .filter-group.search {
      flex: 1;
      min-width: 200px;
    }

    .loading-container {
      text-align: center;
      padding: var(--spacing-2xl);
    }

    .tasks-grid {
      display: grid;
      gap: var(--spacing-md);
    }

    .task-card {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .task-status {
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-todo { background: var(--color-info); color: white; }
    .status-in-progress { background: var(--color-warning); color: black; }
    .status-completed { background: var(--color-success); color: white; }

    .priority-badge-urgent { color: var(--color-danger); font-weight: 700; }
    .priority-badge-high { color: var(--color-warning); font-weight: 600; }
    .priority-badge-medium { color: var(--color-info); }
    .priority-badge-low { color: var(--color-text-muted); }

    .task-title {
      font-size: var(--font-size-lg);
    }

    .task-description {
      font-size: var(--font-size-sm);
    }

    .task-meta {
      display: flex;
      gap: var(--spacing-md);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .overdue {
      color: var(--color-danger);
      font-weight: 600;
    }

    .task-tags {
      display: flex;
      gap: var(--spacing-xs);
    }

    .tag {
      background: var(--color-bg-tertiary);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
    }

    .task-actions {
      display: flex;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
      padding-top: var(--spacing-sm);
      border-top: 1px solid var(--color-border);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-2xl);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--spacing-md);
      margin-top: var(--spacing-xl);
    }

    .page-info {
      color: var(--color-text-muted);
    }
  `],
})
export class TaskListComponent implements OnInit {
    private taskService = inject(TaskService);

    tasks = this.taskService.tasks;
    isLoading = signal(true);
    pagination = signal<any>(null);

    filters: TaskFilters = {
        status: '',
        priority: '',
        sort: '-createdAt',
        search: '',
        page: 1,
        limit: 10,
    };

    statsCards = computed(() => [
        { label: 'To Do', value: this.taskService.stats()?.todo ?? 0, type: 'todo' },
        { label: 'In Progress', value: this.taskService.stats()?.['in-progress'] ?? 0, type: 'progress' },
        { label: 'Completed', value: this.taskService.stats()?.completed ?? 0, type: 'completed' },
        { label: 'Overdue', value: this.taskService.stats()?.overdue ?? 0, type: 'overdue' },
    ]);

    taskCount = this.taskService.taskCount;

    ngOnInit(): void {
        this.loadTasks();
        this.loadStats();
    }

    loadTasks(): void {
        this.isLoading.set(true);
        this.taskService.getTasks(this.filters).subscribe({
            next: (response) => {
                this.pagination.set(response.data.pagination);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            },
        });
    }

    loadStats(): void {
        this.taskService.getStats().subscribe();
    }

    markComplete(id: string): void {
        this.taskService.markComplete(id).subscribe({
            next: () => this.loadStats(),
        });
    }

    deleteTask(id: string): void {
        if (confirm('Are you sure you want to delete this task?')) {
            this.taskService.deleteTask(id).subscribe({
                next: () => this.loadStats(),
            });
        }
    }

    goToPage(page: number): void {
        this.filters.page = page;
        this.loadTasks();
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            todo: 'To Do',
            'in-progress': 'In Progress',
            completed: 'Done',
            archived: 'Archived',
        };
        return labels[status] || status;
    }

    getCompletedSubtasks(task: Task): number {
        return task.subtasks.filter((s) => s.completed).length;
    }
}
