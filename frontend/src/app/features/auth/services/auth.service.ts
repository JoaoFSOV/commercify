import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { User } from '../../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private isAdminSubject: BehaviorSubject<boolean>;
  private userSubject: BehaviorSubject<User | null>;

  constructor(private http: HttpClient) {
    // Retrieve the isAdmin value from localStorage (if available)
    const savedIsAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');

    // Initialize BehaviorSubjects with the stored values (or defaults)
    this.isAdminSubject = new BehaviorSubject<boolean>(savedIsAdmin);
    this.userSubject = new BehaviorSubject<User | null>(savedUser);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, { withCredentials: true }).pipe(
      tap(() => {
        this.fetchUserInfo();
      })
    );
  }

  fetchUserInfo() {
    this.http.get<{ user: User }>(`${this.apiUrl}/me`, { withCredentials: true }).subscribe({
      next: (response) => {
        localStorage.setItem('isAdmin', JSON.stringify(response.user.isAdmin));
        localStorage.setItem('user', JSON.stringify(response.user));
        this.isAdminSubject.next(response.user.isAdmin);
        this.userSubject.next(response.user);
      },
      error: (error) => {
        this.isAdminSubject.next(false);
        this.userSubject.next(null);
      }
    });
  }

  register(name: String, email: String, password: String, confirmPassword: String): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, { email, name, password, confirmPassword });
  }

  forgot(email: String): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot`, { email });
  }

  reset(token: String, password: String, confirmPassword: String): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, { token, password, confirmPassword });
  }

  getIsAdmin() {
    return this.isAdminSubject.asObservable();
  }

  getUser() {
    return this.userSubject.asObservable();
  }
}
