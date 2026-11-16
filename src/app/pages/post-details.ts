import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, items, uid } from '../shared/api.service';
import { PostCardComponent } from '../shared/post-card';

@Component({
  standalone: true, imports: [RouterLink, DatePipe, FormsModule, PostCardComponent],
  template: `
  <a routerLink="/" class="lnk">← Back to feed</a>
  @if (error) { <div class="alert">{{ error }}</div> }
  @if (post) { <app-post-card [p]="post" (deleted)="router.navigate(['/'])" /> }
  <div class="card">
    <h3 style="margin-top:0">Comments ({{ comments.length }})</h3>
    <div class="row" style="gap:8px"><input [(ngModel)]="text" placeholder="Write a comment..." (keyup.enter)="add()"><button class="btn sm" (click)="add()" [disabled]="!text.trim()">Send</button></div>
    @for (c of comments; track $index) {
      <div class="cm">
        @if (cu(c)?.photo) { <img class="av" [src]="cu(c).photo" alt=""> } @else { <div class="av">{{ (cu(c)?.name || '?').charAt(0) }}</div> }
        <div class="bub">
          <b>{{ cu(c)?.name }}</b> <span class="muted small">{{ c.createdAt | date:'short' }}</span>
          @if (editId === cid(c)) {
            <input [(ngModel)]="editText"><div class="actions"><button class="btn sm" (click)="save(c)">Save</button><button class="btn sm out" (click)="editId = ''">Cancel</button></div>
          } @else {
            <div>{{ c.content || c.body || c.text }}</div>
            <div>
              @if (isMine(c)) { <button class="lnk" (click)="editId = cid(c); editText = c.content || c.body || c.text">Edit</button> }
              @if (isMine(c) || postMine) { <button class="lnk red" (click)="del(c)">Delete</button> }
            </div>
          }
        </div>
      </div>
    }
    @if (!comments.length) { <div class="center">No comments yet</div> }
  </div>`,
})
export class PostDetailsComponent implements OnInit {
  api = inject(ApiService); route = inject(ActivatedRoute); router = inject(Router);
  id = ''; post: any; comments: any[] = []; text = ''; editId = ''; editText = ''; error = '';
  cid = uid; cu = (c: any) => c.user || c.commentCreator || c.createdBy || c.author;
  isMine(c: any) { return uid(this.cu(c)) && uid(this.cu(c)) === uid(this.api.me()); }
  get postMine() { const u = this.post?.user || this.post?.createdBy; return uid(u) && uid(u) === uid(this.api.me()); }
  ngOnInit() { this.id = this.route.snapshot.paramMap.get('id')!; this.loadPost(); this.loadComments(); }
  async loadPost() {
    try { const d = await this.api.call('GET', `/posts/${this.id}`); this.post = d.data?.post ?? d.data; }
    catch (e: any) {
      // fallback: look for the post inside the feed
      for (let pg = 1; pg <= 5 && !this.post; pg++) {
        try { this.post = items(await this.api.call('GET', `/posts/feed?only=all&page=${pg}&limit=20`)).find(x => uid(x) === this.id); } catch { break; }
      }
      if (!this.post) this.error = e.message;
    }
  }
  async loadComments() {
    try { this.comments = items(await this.api.call('GET', `/posts/${this.id}/comments?page=1&limit=50`)); }
    catch (e: any) { this.error = e.message; }
  }
  private form(t: string) { const f = new FormData(); f.append('content', t); return f; }
  async add() {
    if (!this.text.trim()) return;
    try { await this.api.call('POST', `/posts/${this.id}/comments`, this.form(this.text)); this.text = ''; this.loadComments(); }
    catch (e: any) { this.api.toast(e.message, 5000); }
  }
  async save(c: any) {
    try { await this.api.call('PUT', `/posts/${this.id}/comments/${uid(c)}`, this.form(this.editText)); this.editId = ''; this.loadComments(); }
    catch (e: any) { this.api.toast(e.message, 5000); }
  }
  async del(c: any) {
    if (!confirm('Delete this comment?')) return;
    try { await this.api.call('DELETE', `/posts/${this.id}/comments/${uid(c)}`); this.loadComments(); }
    catch (e: any) { this.api.toast(e.message, 5000); }
  }
}
