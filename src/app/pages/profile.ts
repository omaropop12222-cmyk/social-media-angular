import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService, items } from '../shared/api.service';
import { PostCardComponent } from '../shared/post-card';

@Component({
  standalone: true, imports: [DatePipe, PostCardComponent],
  template: `
  @if (api.me(); as m) {
    <div class="card" style="text-align:center">
      @if (m.photo) { <img class="av" style="width:90px;height:90px;margin:auto" [src]="m.photo" alt=""> } @else { <div class="av" style="width:90px;height:90px;font-size:34px;margin:auto">{{ (m.name || '?').charAt(0) }}</div> }
      <h2 style="margin:10px 0 2px">{{ m.name }}</h2>
      <div class="muted">&#64;{{ m.username }} · {{ m.email }}</div>
      @if (m.dateOfBirth) { <div class="muted small">Born {{ m.dateOfBirth | date:'mediumDate' }}</div> }
      <div style="margin-top:10px"><label class="btn sm out" style="cursor:pointer">Change photo<input type="file" accept="image/*" hidden (change)="upload($any($event.target).files[0])"></label></div>
    </div>
  } @else { <div class="center">Loading profile...</div> }
  <h3>My posts</h3>
  @if (error) { <div class="alert">{{ error }}</div> }
  @for (p of posts; track $index) { <app-post-card [p]="p" (deleted)="load()" /> }
  @if (!posts.length && !error) { <div class="center">You have no posts yet</div> }`,
})
export class ProfileComponent implements OnInit {
  api = inject(ApiService); posts: any[] = []; error = '';
  ngOnInit() { if (!this.api.me()) this.api.loadMe().catch(() => {}); this.load(); }
  async load() {
    try { this.posts = items(await this.api.call('GET', '/posts/feed?only=me&page=1&limit=20')); }
    catch (e: any) { this.error = e.message; }
  }
  async upload(file: File) {
    if (!file) return;
    const f = new FormData(); f.append('photo', file);
    try { await this.api.call('PUT', '/users/upload-photo', f); await this.api.loadMe(); this.api.toast('Photo updated'); }
    catch (e: any) { this.api.toast(e.message, 5000); }
  }
}
