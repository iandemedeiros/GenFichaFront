import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
    private http: HttpClient,
    private router: Router
  ) {}

  login() {
    this.http.post("http://localhost:3001/api/login", {
      email: this.email,
      senha: this.senha
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        this.router.navigate(["/home"]);
      },
      error: () => {
        alert("Email ou senha incorretos.");
      }
    });
  }
}
