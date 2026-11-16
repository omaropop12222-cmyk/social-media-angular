import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, uid } from './api.service';

@Component({
  selector: 'app-post-card', standalone: true, imports: [RouterLink, DatePipe, FormsModule],
  template: `
  <article class="post">
    <div class="head">
      @if (u?.photo) { <img class="av" [src]="u.photo" alt=""> } @else { <div class="av">{{ (u?.name || '?').charAt(0) }}</div> }
      <div><b>{{ u?.name }}</b><div class="muted small">{{ p.createdAt | date:'medium' }}</div></div>
      @if (mine) { <span class="spacer"></span><button class="lnk" (click)="editing = true; text = p.body">Edit</button><button class="lnk red" (click)="del()">Delete</button> }
    </div>
    @if (editing) {
      <textarea [(ngModel)]="text" rows="3"></textarea>
      <div class="actions"><button class="btn sm" (click)="save()">Save</button><button class="btn sm out" (click)="editing = false">Cancel</button></div>
    } @else { <a [routerLink]="['/post', id]" class="body">{{ p.body }}</a> }
    @if (p.image) { <img class="pimg" [src]="p.image" alt=""> }
    <div class="foot"><button class="lnk" [class.on]="liked" (click)="like()">👍 {{ likes }}</button><a class="lnk" [routerLink]="['/post', id]">💬 {{ comments }} Comments</a></div>
  </article>`,
})
export class PostCardComponent implements OnInit {
  api = inject(ApiService);
  @Input() p: any;
  @Output() deleted = new EventEmitter<void>();
  editing = false; text = ''; likes = 0; comments = 0; liked = false;
  get u() { return this.p.user || this.p.createdBy || this.p.author; }
  get id() { return uid(this.p); }
  get mine() { return uid(this.u) && uid(this.u) === uid(this.api.me()); }
  ngOnInit() {
    this.likes = this.p.likesCount ?? this.p.likes?.length ?? 0;
    this.comments = this.p.commentsCount ?? this.p.comments?.length ?? 0;
    this.liked = !!this.p.isLiked || !!this.p.likedByMe;
  }
  async like() {
    try { await this.api.call('PUT', `/posts/${this.id}/like`); this.liked = !this.liked; this.likes += this.liked ? 1 : -1; }
    catch (e: any) { this.api.toast(e.message); }
  }
  async save() {
    const f = new FormData(); f.append('body', this.text);
    try { await this.api.call('PUT', `/posts/${this.id}`, f); this.p.body = this.text; this.editing = false; this.api.toast('Post updated'); }
    catch (e: any) { this.api.toast(e.message); }
  }
  async del() {
    if (!confirm('Delete this post?')) return;
    try { await this.api.call('DELETE', `/posts/${this.id}`); this.api.toast('Post deleted'); this.deleted.emit(); }
    catch (e: any) { this.api.toast(e.message); }
  }
}
