import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, items } from '../shared/api.service';
import { PostCardComponent } from '../shared/post-card';

@Component({
  standalone: true, imports: [FormsModule, PostCardComponent],
  template: `
  <div class="card">
    <textarea [(ngModel)]="body" rows="3" placeholder="What's on your mind, {{ api.me()?.name }}?"></textarea>
    <div class="row" style="margin-top:8px"><input type="file" accept="image/*" (change)="file = $any($event.target).files[0]" style="width:auto;border:0;padding:0">
      <button class="btn sm" (click)="create()" [disabled]="busy || (!body.trim() && !file)">{{ busy ? 'Posting...' : 'Post' }}</button></div>
  </div>
  @if (error) { <div class="alert">{{ error }}</div> }
  @if (loading && !posts.length) { <div class="center">Loading posts...</div> }
  @else if (!loading && !posts.length && !error) { <div class="center">No posts yet</div> }
  @for (p of posts; track $index) { <app-post-card [p]="p" (deleted)="reload()" /> }
  @if (more) { <div class="center"><button class="btn out" (click)="load()" [disabled]="loading">{{ loading ? 'Loading...' : 'Load more' }}</button></div> }`,
})
export class HomeComponent implements OnInit {
  api = inject(ApiService);
  posts: any[] = []; page = 1; more = false; loading = false; busy = false; error = ''; body = ''; file: File | null = null;
  ngOnInit() { this.load(); }
  reload() { this.posts = []; this.page = 1; this.load(); }
  async load() {
    this.loading = true; this.error = '';
    try {
      const d = await this.api.call('GET', `/posts/feed?only=all&page=${this.page}&limit=10`);
      const list = items(d); this.posts = [...this.posts, ...list]; this.more = list.length >= 10; this.page++;
    } catch (e: any) { this.error = e.message; }
    this.loading = false;
  }
  async create() {
    const f = new FormData(); if (this.body.trim()) f.append('body', this.body); if (this.file) f.append('image', this.file);
    this.busy = true;
    try { await this.api.call('POST', '/posts', f); this.body = ''; this.file = null; this.api.toast('Post created'); this.reload(); }
    catch (e: any) { this.api.toast(e.message, 5000); }
    this.busy = false;
  }
}
