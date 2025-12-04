import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Injeta o serviço de autenticação.
  const authService = inject(AuthService);
  
  // Obtém o token de autenticação.
  const authToken = authService.getToken();

  // Se um token existir, clona a requisição e adiciona o cabeçalho de autorização.
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    // Passa a requisição modificada para o próximo manipulador.
    return next(authReq);
  }

  // Se não houver token, a requisição original continua sem modificação.
  return next(req);
};