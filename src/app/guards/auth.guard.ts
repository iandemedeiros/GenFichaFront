import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const token = this.auth.getToken();
    const user = this.auth.getUser();

    // EXCEÇÕES: login e registro NÃO precisam de token
    const openRoutes = ['login', 'registro'];
    const currentRoute = route.routeConfig?.path;

    if (currentRoute && openRoutes.includes(currentRoute)) {
      return true;
    }

    // Se não tiver token ou user → BLOQUEIA
    if (!token || !user) {
      this.router.navigate(['/login']);
      return false;
    }

    if (this.auth.isTokenExpired(token)) {
      this.auth.logout();
      this.router.navigate(['/login']);
      return false;
    }


    return true;
  }
}
