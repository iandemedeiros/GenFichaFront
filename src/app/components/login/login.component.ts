import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // 1. Importar o AuthService

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  
  goToRegister() {
    this.router.navigate(['/register']);
  }
  email = "";
  senha = "";

  constructor(
    private authService: AuthService, // 2. Injetar o AuthService
    private router: Router,
  ) {}

  login() {
    // 3. Usar o método login do AuthService
    this.authService.login({
      email: this.email,
      senha: this.senha
    }).subscribe({
      next: () => {
        this.router.navigate(["/home"]);
      },
      error: () => {
        alert("Email ou senha incorretos.");
      }
    });
  }
}
