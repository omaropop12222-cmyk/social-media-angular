import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/api.service';

@Component({
  standalone: true, imports: [FormsModule, RouterLink],
  template: `
  <form class="card form" (ngSubmit)="submit()">
    <h1>Welcome back</h1><p class="muted">Login to see your feed</p>
    @if (error) { <div class="alert">{{ error }}</div> }
    <label>Email</label><input name="email" type="email" [(ngModel)]="email" required>
    <label>Password</label><input name="password" type="password" [(ngModel)]="password" required>
    <button class="btn" [disabled]="busy || !email || !password">{{ busy ? 'Logging in...' : 'Login' }}</button>
    <p class="muted" style="text-align:center">No account? <a routerLink="/register" style="color:var(--b)">Sign up</a></p>
  </form>`,
})
export class LoginComponent {
  api = inject(ApiService); router = inject(Router);
  email = ''; password = ''; error = ''; busy = false;
  async submit() {
    this.busy = true; this.error = '';
    try { await this.api.login(this.email, this.password); this.router.navigate(['/']); }
    catch (e: any) { this.error = e.message; }
    this.busy = false;
  }
}
