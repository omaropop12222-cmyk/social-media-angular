import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './shared/api.service';
export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [authGuard], loadComponent: () => import('./pages/home').then(m => m.HomeComponent) },
  { path: 'post/:id', canActivate: [authGuard], loadComponent: () => import('./pages/post-details').then(m => m.PostDetailsComponent) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./pages/profile').then(m => m.ProfileComponent) },
  { path: 'change-password', canActivate: [authGuard], loadComponent: () => import('./pages/change-password').then(m => m.ChangePasswordComponent) },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./pages/register').then(m => m.RegisterComponent) },
  { path: '**', redirectTo: '' },
];
