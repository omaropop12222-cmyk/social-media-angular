import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './shared/api.service';

@Component({
  selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <header class="nav"><div class="wrap row">
    <a routerLink="/" class="logo">Route <span>Posts</span></a>
    <nav>
      @if (api.token()) {
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
        <a routerLink="/profile" routerLinkActive="active">Profile</a>
        <a routerLink="/change-password" routerLinkActive="active">Password</a>
        <a class="lnk" (click)="api.logout()">Logout</a>
      } @else { <a routerLink="/login">Login</a><a routerLink="/register">Sign up</a> }
    </nav>
  </div></header>
  <main class="wrap"><router-outlet /></main>
  @if (api.toastMsg()) { <div class="toast">{{ api.toastMsg() }}</div> }`,
})
export class AppComponent { api = inject(ApiService); }
