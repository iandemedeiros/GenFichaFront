import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Importe o seu serviço de autenticação
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isLogged = false;
  isAdmin = false;

  private authSubscription!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Assina as mudanças no estado de autenticação
    this.authSubscription = this.authService.authStatus$.subscribe(() => {
      this.updateAuthStatus();
    });

    // Define o estado inicial
    this.updateAuthStatus();
  }

  private updateAuthStatus(): void {
    const user = this.authService.getUser();
    this.isLogged = !!user;
    this.isAdmin = user?.isAdmin || false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    // Evita vazamentos de memória
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}