import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Usuario, LoginResponse, UserData } from '../models/usuario.model';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3001/api';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // 1. BehaviorSubject para gerenciar o estado de autenticação
  private authStatus = new BehaviorSubject<boolean>(this.hasToken());
  public authStatus$ = this.authStatus.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string, senha: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Salva o token e os dados do usuário no localStorage
        localStorage.setItem(this.TOKEN_KEY, response.token);
        
        const userData: UserData = { ...response.user, isAdmin: response.isAdmin };
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));

        // 2. Notifica os assinantes que o usuário está logado
        this.authStatus.next(true);
      })
    );
  }

  
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    // 3. Notifica os assinantes que o usuário fez logout
    this.authStatus.next(false);
    this.router.navigate(['/login']);
  }

  getUser(): UserData | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }
  
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.isAdmin || false;
  }

  private hasToken(): boolean {
    
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(decodedToken.exp * 1000);
      return expirationDate < new Date();
    } catch (error) {
      // Se houver um erro ao decodificar (token inválido), consideramos expirado ou inválido
      console.error('Erro ao decodificar o token:', error);
      return true;
    }
  }
}
