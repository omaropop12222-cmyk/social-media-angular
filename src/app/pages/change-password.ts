import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/api.service';

@Component({
  standalone: true, imports: [FormsModule],
  template: `
  <form class="card form" (ngSubmit)="submit()">
    <h1>Change password</h1>
    @if (error) { <div class="alert">{{ error }}</div> }
    <label>Current password</label><input name="p" type="password" [(ngModel)]="password" required>
    <label>New password</label><input name="n" type="password" [(ngModel)]="newPassword" required>
    <button class="btn" [disabled]="busy || !password || !newPassword">{{ busy ? 'Updating...' : 'Update password' }}</button>
  </form>`,
})
export class ChangePasswordComponent {
  api = inject(ApiService); password = ''; newPassword = ''; error = ''; busy = false;
  async submit() {
    this.busy = true; this.error = '';
    try {
      const d = await this.api.call('PATCH', '/users/change-password', { password: this.password, newPassword: this.newPassword });
      if (d.data?.token) this.api.setToken(d.data.token);
      this.password = this.newPassword = ''; this.api.toast('Password changed successfully');
    } catch (e: any) { this.error = e.message; }
    this.busy = false;
  }
}
