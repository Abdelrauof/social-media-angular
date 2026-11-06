import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Post, PostsResponse, SinglePostResponse } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getFeed(only: string = '', page: number = 1, limit: number = 20): Observable<PostsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (only) {
      params = params.set('only', only);
      return this.http.get<PostsResponse>(`${this.baseUrl}/posts/feed`, { params });
    }

    return this.http.get<PostsResponse>(`${this.baseUrl}/posts`, { params });
  }

  getPostById(postId: string): Observable<SinglePostResponse> {
    return this.http.get<SinglePostResponse>(`${this.baseUrl}/posts/${postId}`);
  }

  createPost(body: string, image?: File | null): Observable<any> {
    if (image) {
      const formData = new FormData();
      if (body) formData.append('body', body);
      formData.append('image', image);
      return this.http.post<any>(`${this.baseUrl}/posts`, formData);
    }
    return this.http.post<any>(`${this.baseUrl}/posts`, { body });
  }

  updatePost(postId: string, body: string, image?: File | null): Observable<any> {
    if (image) {
      const formData = new FormData();
      formData.append('body', body);
      formData.append('image', image);
      return this.http.put<any>(`${this.baseUrl}/posts/${postId}`, formData);
    }
    return this.http.put<any>(`${this.baseUrl}/posts/${postId}`, { body });
  }

  deletePost(postId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/posts/${postId}`);
  }

  likePost(postId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/posts/${postId}/like`, {});
  }

  bookmarkPost(postId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/posts/${postId}/bookmark`, {});
  }

  sharePost(postId: string, body?: string): Observable<any> {
    const payload = body ? { body } : {};
    return this.http.post<any>(`${this.baseUrl}/posts/${postId}/share`, payload);
  }

  getPostLikes(postId: string, page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/posts/${postId}/likes?page=${page}&limit=${limit}`);
  }
}

