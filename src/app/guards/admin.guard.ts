import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();

  // A lógica aqui assume que o objeto 'user' salvo pelo AuthService
  // após o login contém uma propriedade booleana `isAdmin`.
  // Se a sua API retornar o papel de outra forma (ex: user.role === 'ADMIN'),
  // ajuste a condição abaixo.
  if (user && user.isAdmin) {
    return true; // Permite o acesso à rota
  }

  // Se o usuário não for admin, redireciona para a página home.
  // Redirecionar para /login é mais seguro para evitar loops de guarda.
  router.navigate(['/login']);
  return false; // Bloqueia o acesso à rota
};
