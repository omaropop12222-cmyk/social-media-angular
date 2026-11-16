import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/api.service';

@Component({
  standalone: true, imports: [FormsModule, RouterLink],
  template: `
  <form class="card form" (ngSubmit)="submit()">
    <h1>Create account</h1><p class="muted">Join Route Posts</p>
    @if (error) { <div class="alert">{{ error }}</div> }
    <label>Name</label><input name="name" [(ngModel)]="f.name" required>
    <label>Username</label><input name="username" [(ngModel)]="f.username" required>
    <label>Email</label><input name="email" type="email" [(ngModel)]="f.email" required>
    <label>Password</label><input name="password" type="password" [(ngModel)]="f.password" required>
    <label>Confirm password</label><input name="rePassword" type="password" [(ngModel)]="f.rePassword" required>
    <label>Date of birth</label><input name="dob" type="date" [(ngModel)]="f.dateOfBirth" required>
    <label>Gender</label>
    <select name="gender" [(ngModel)]="f.gender"><option value="male">Male</option><option value="female">Female</option></select>
    <button class="btn" [disabled]="busy">{{ busy ? 'Creating...' : 'Sign up' }}</button>
    <p class="muted" style="text-align:center">Have an account? <a routerLink="/login" style="color:var(--b)">Login</a></p>
  </form>`,
})
export class RegisterComponent {
  api = inject(ApiService); router = inject(Router);
  f: any = { name: '', username: '', email: '', password: '', rePassword: '', dateOfBirth: '', gender: 'male' };
  error = ''; busy = false;
  async submit() {
    this.busy = true; this.error = '';
    try { await this.api.call('POST', '/users/signup', this.f); this.api.toast('Account created, please login'); this.router.navigate(['/login']); }
    catch (e: any) { this.error = e.message; }
    this.busy = false;
  }
}
