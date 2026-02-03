/**
 * Simple 404 Not Found component
 */

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterLink],
    template: `
    <div class="not-found animate-fade-in">
      <h1>404</h1>
      <p class="text-muted">Page not found</p>
      <a routerLink="/" class="btn btn-primary">Go Home</a>
    </div>
  `,
    styles: [`
    .not-found {
      text-align: center;
      padding: var(--spacing-2xl);
    }

    h1 {
      font-size: 5rem;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `],
})
export class NotFoundComponent { }
