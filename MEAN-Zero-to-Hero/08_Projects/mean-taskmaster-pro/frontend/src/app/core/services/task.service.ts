/**
 * ============================================
 * CONCEPT: Angular Service with RxJS
 * LEVEL: Intermediate
 * ============================================
 *
 * 📚 WHAT: TaskService handles all task-related API calls
 *
 * ⚙️ RxJS operators demonstrated:
 *   - map: Transform response data
 *   - catchError: Handle errors
 *   - tap: Side effects
 *   - shareReplay: Cache and share subscription
 *
 * 💡 INTERVIEW TIP: "What is Observable vs Promise?"
 *   → Observable: Multiple values over time, lazy, cancellable
 *   → Promise: Single value, eager, not cancellable
 * ============================================
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * ============================================
 * INTERFACES
 * ============================================
 */
export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'completed' | 'archived';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    tags: string[];
    subtasks: Subtask[];
    completionPercentage: number;
    isOverdue: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Subtask {
    _id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
}

export interface TaskListResponse {
    success: boolean;
    data: {
        tasks: Task[];
        pagination: Pagination;
    };
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface TaskFilters {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
}

export interface TaskStats {
    todo: number;
    'in-progress': number;
    completed: number;
    archived: number;
    overdue: number;
}

@Injectable({
    providedIn: 'root',
})
export class TaskService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/tasks`;

    /**
     * ============================================
     * CONCEPT: Signals for Local State Cache
     * ============================================
     *
     * Keep a local cache of tasks for quick access
     * Update when CRUD operations succeed
     */
    private tasksCache = signal<Task[]>([]);
    private statsCache = signal<TaskStats | null>(null);

    readonly tasks = computed(() => this.tasksCache());
    readonly stats = computed(() => this.statsCache());
    readonly taskCount = computed(() => this.tasksCache().length);

    /**
     * ============================================
     * GET ALL TASKS
     * ============================================
     */
    getTasks(filters: TaskFilters = {}): Observable<TaskListResponse> {
        /**
         * ============================================
         * CONCEPT: HttpParams for Query String
         * ============================================
         *
         * 📚 WHAT: Build URL query parameters safely
         *
         * ⚙️ HOW: Chain .set() calls (immutable)
         *
         * Result: GET /tasks?page=1&limit=10&status=todo
         */
        let params = new HttpParams();

        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());
        if (filters.status) params = params.set('status', filters.status);
        if (filters.priority) params = params.set('priority', filters.priority);
        if (filters.search) params = params.set('search', filters.search);
        if (filters.sort) params = params.set('sort', filters.sort);

        return this.http.get<TaskListResponse>(this.apiUrl, { params }).pipe(
            tap((response) => {
                // Update local cache
                this.tasksCache.set(response.data.tasks);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * ============================================
     * GET SINGLE TASK
     * ============================================
     */
    getTask(id: string): Observable<Task> {
        return this.http
            .get<{ success: boolean; data: { task: Task } }>(`${this.apiUrl}/${id}`)
            .pipe(
                map((response) => response.data.task),
                catchError(this.handleError)
            );
    }

    /**
     * ============================================
     * CREATE TASK
     * ============================================
     */
    createTask(taskData: Partial<Task>): Observable<Task> {
        return this.http
            .post<{ success: boolean; data: { task: Task } }>(this.apiUrl, taskData)
            .pipe(
                map((response) => response.data.task),
                tap((newTask) => {
                    // Add to local cache
                    this.tasksCache.update((tasks) => [newTask, ...tasks]);
                }),
                catchError(this.handleError)
            );
    }

    /**
     * ============================================
     * UPDATE TASK
     * ============================================
     */
    updateTask(id: string, taskData: Partial<Task>): Observable<Task> {
        return this.http
            .put<{ success: boolean; data: { task: Task } }>(
                `${this.apiUrl}/${id}`,
                taskData
            )
            .pipe(
                map((response) => response.data.task),
                tap((updatedTask) => {
                    // Update in local cache
                    this.tasksCache.update((tasks) =>
                        tasks.map((t) => (t._id === id ? updatedTask : t))
                    );
                }),
                catchError(this.handleError)
            );
    }

    /**
     * ============================================
     * DELETE TASK
     * ============================================
     */
    deleteTask(id: string): Observable<void> {
        return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
            map(() => void 0),
            tap(() => {
                // Remove from local cache
                this.tasksCache.update((tasks) => tasks.filter((t) => t._id !== id));
            }),
            catchError(this.handleError)
        );
    }

    /**
     * ============================================
     * MARK TASK COMPLETE
     * ============================================
     */
    markComplete(id: string): Observable<Task> {
        return this.http
            .patch<{ success: boolean; data: { task: Task } }>(
                `${this.apiUrl}/${id}/complete`,
                {}
            )
            .pipe(
                map((response) => response.data.task),
                tap((updatedTask) => {
                    this.tasksCache.update((tasks) =>
                        tasks.map((t) => (t._id === id ? updatedTask : t))
                    );
                }),
                catchError(this.handleError)
            );
    }

    /**
     * ============================================
     * GET STATS
     * ============================================
     */
    getStats(): Observable<TaskStats> {
        return this.http
            .get<{ success: boolean; data: { stats: TaskStats } }>(
                `${this.apiUrl}/stats`
            )
            .pipe(
                map((response) => response.data.stats),
                tap((stats) => this.statsCache.set(stats)),
                catchError(this.handleError)
            );
    }

    /**
     * ============================================
     * ERROR HANDLER
     * ============================================
     */
    private handleError(error: any): Observable<never> {
        console.error('TaskService Error:', error);
        const message = error.error?.error || error.message || 'Unknown error';
        return throwError(() => new Error(message));
    }
}
