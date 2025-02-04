import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  login(email: string, password: string ): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  register(name: string, email: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, { email, name, password, confirmPassword });
  }

  forgot(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot`, { email });
  }

  reset(token: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, { token, password, confirmPassword });
  }
}
