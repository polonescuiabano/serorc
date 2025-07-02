import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

interface LoginResponse {
  token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly EXPIRATION_KEY = 'tokenExpiration';

  constructor(private http: HttpClient, private router: Router) {}

  login(user: string, password: string) {
    const payload = { user, password };
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload);
  }

  setSession(token: string, user: any) {
    const expiresAt = Date.now() + 3600 * 1000; //Token com duraçao de 1 hora
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.EXPIRATION_KEY, expiresAt.toString());
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRATION_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const expiration = localStorage.getItem(this.EXPIRATION_KEY);
    if (!expiration) return false;
    return Date.now() < parseInt(expiration, 10);
  }

  getUser(): any | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  getUsuarioId(): string | null {
    const user = this.getUser();
    return user?.id ?? null;
  }

  getEmpresa(): string | null {
    const user = this.getUser();
    return user?.company ?? null;
  }

  getToken(): string | null {
    if (this.isLoggedIn()) {
      return localStorage.getItem(this.TOKEN_KEY);
    } else {
      this.logout();
      return null;
    }
  }
}
