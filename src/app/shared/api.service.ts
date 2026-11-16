import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

const HOST = 'https://route-posts.routemisr.com';
// The service probes these prefixes once and uses the first one that answers with JSON.
const CANDIDATES = [`${HOST}/api/v1`, `${HOST}/api`, HOST];

export const uid = (o: any) => o?._id || o?.id;
export function items(d: any): any[] {
  const x = d?.data;
  if (Array.isArray(x)) return x;
  if (x && typeof x === 'object') for (const k of Object.keys(x)) if (Array.isArray(x[k])) return x[k];
  return [];
}
export const authGuard: CanActivateFn = () => inject(ApiService).token() ? true : inject(Router).createUrlTree(['/login']);
export const guestGuard: CanActivateFn = () => inject(ApiService).token() ? inject(Router).createUrlTree(['/']) : true;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private router = inject(Router);
  token = signal<string | null>(localStorage.getItem('token'));
  me = signal<any>(null);
  toastMsg = signal('');
  private base?: Promise<string>;

  constructor() { if (this.token()) this.loadMe().catch(() => {}); }

  toast(m: string, ms = 3000) { this.toastMsg.set(m); setTimeout(() => this.toastMsg.set(''), ms); }
  private getBase() { return this.base ??= this.detect(); }
  private async detect(): Promise<string> {
    for (const c of CANDIDATES) {
      try {
        const r = await fetch(`${c}/users/profile-data`);
        if (r.status !== 404 && (r.headers.get('content-type') || '').includes('json')) return c;
      } catch { /* try next */ }
    }
    return CANDIDATES[0];
  }

  async call(method: string, path: string, body?: any): Promise<any> {
    const base = await this.getBase();
    const headers: any = {};
    if (this.token()) headers['Authorization'] = 'Bearer ' + this.token();
    let payload: any;
    if (body instanceof FormData) payload = body;
    else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
    let res: Response;
    try { res = await fetch(base + path, { method, headers, body: payload }); }
    catch { throw new Error('Cannot reach the server (network error). Check your internet / VPN.'); }
    let data: any = null;
    try { data = await res.json(); } catch { /* no body */ }
    if (!res.ok || data?.success === false) {
      const errs = Array.isArray(data?.errors) ? data.errors.map((e: any) => typeof e === 'string' ? e : (e.message || JSON.stringify(e))).join(' • ') : '';
      throw new Error(errs || data?.message || `Request failed (${res.status})`);
    }
    return data;
  }

  async loadMe() { const d = await this.call('GET', '/users/profile-data'); this.me.set(d.data?.user ?? d.data); }
  async login(email: string, password: string) {
    const d = await this.call('POST', '/users/signin', { email, password });
    this.setToken(d.data?.token); await this.loadMe().catch(() => {});
  }
  setToken(t: string) { localStorage.setItem('token', t); this.token.set(t); }
  logout() { localStorage.removeItem('token'); this.token.set(null); this.me.set(null); this.router.navigate(['/login']); }
}
