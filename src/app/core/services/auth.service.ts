import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginPayload, SignupPayload, ChangePasswordPayload } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private baseUrl = environment.apiUrl;

  private isBrowser = isPlatformBrowser(this.platformId);
  private tokenKey = 'route_posts_token';
  private userKey = 'route_posts_user';

  token = signal<string | null>(this.getInitialToken());
  currentUser = signal<User | null>(this.getInitialUser());
  isLoggedIn = computed(() => !!this.token());

  private getInitialToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.tokenKey);
  }

  private getInitialUser(): User | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  saveSession(token: string, user: User): void {
    this.token.set(token);
    this.currentUser.set(user);
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  updateCurrentUser(user: User): void {
    this.currentUser.set(user);
    if (this.isBrowser) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    const body: Record<string, any> = { password: payload.password };
    if (payload.login) {
      if (payload.login.includes('@')) {
        body['email'] = payload.login;
      } else {
        body['username'] = payload.login;
        body['email'] = payload.login;
      }
    } else if (payload.email) {
      body['email'] = payload.email;
    }

    return this.http.post<AuthResponse>(`${this.baseUrl}/users/signin`, body).pipe(
      tap(res => {
        if (res.data?.token && res.data?.user) {
          this.saveSession(res.data.token, res.data.user);
        }
      })
    );
  }

  signup(payload: SignupPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/users/signup`, payload).pipe(
      tap(res => {
        if (res.data?.token && res.data?.user) {
          this.saveSession(res.data.token, res.data.user);
        }
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.router.navigate(['/auth']);
  }

  changePassword(payload: ChangePasswordPayload): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/users/change-password`, payload).pipe(
      tap(res => {
        if (res.data?.token) {
          this.token.set(res.data.token);
          if (this.isBrowser) {
            localStorage.setItem(this.tokenKey, res.data.token);
          }
        }
      })
    );
  }

  uploadProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.put<any>(`${this.baseUrl}/users/upload-photo`, formData).pipe(
      tap(res => {
        if (res.data?.user) {
          this.updateCurrentUser(res.data.user);
        }
      })
    );
  }

  getProfileData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/profile-data`).pipe(
      tap(res => {
        if (res.data?.user) {
          this.updateCurrentUser(res.data.user);
        }
      })
    );
  }

  getUserProfile(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/${userId}/profile`);
  }

  getUserPosts(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/${userId}/posts`);
  }

  toggleFollowUser(userId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/${userId}/follow`, {});
  }

  getBookmarks(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/bookmarks?limit=30`);
  }

  getSuggestions(limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/suggestions?limit=${limit}`);
  }
}

