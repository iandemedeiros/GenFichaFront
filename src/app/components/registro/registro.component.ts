import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-registro',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html'
})
export class RegistroComponent {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required]),
    confirmaSenha: new FormControl('', [Validators.required])
  });

  emailValid = false;
  passwordValid = {
    length: false,
    number: false,
    uppercase: false,
    special: false
  };
  confirmPasswordValid = false;

  constructor(private http: HttpClient, private router: Router) {
    // Atualiza validações a cada mudança
    this.form.valueChanges.subscribe(() => this.validateAll());
  }

  // Validações separadas
  private validateEmail(email: string) {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    this.emailValid = valid;
    return valid;
  }

  private validatePassword(password: string) {
    this.passwordValid.length = password.length >= 8 && password.length <= 16;
    this.passwordValid.number = /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
    this.passwordValid.uppercase = /[A-Z]/.test(password);
    this.passwordValid.special = /[^a-zA-Z0-9]/.test(password);

    return Object.values(this.passwordValid).every(Boolean);
  }

  private validateConfirmPassword(password: string, confirm: string) {
    this.confirmPasswordValid = password === confirm;
    return this.confirmPasswordValid;
  }

  private validateAll() {
    const email = this.form.get('email')?.value ?? '';
    const senha = this.form.get('senha')?.value ?? '';
    const confirma = this.form.get('confirmaSenha')?.value ?? '';

    this.validateEmail(email);
    this.validatePassword(senha);
    this.validateConfirmPassword(senha, confirma);
  }

  get canSubmit() {
    return this.emailValid && 
           Object.values(this.passwordValid).every(Boolean) &&
           this.confirmPasswordValid &&
           this.form.valid;
  }

  registrar() {
    if (!this.canSubmit) return;

    const { email, senha } = this.form.value;
    this.http.post('http://localhost:3000/api/usuarios', { email, senha }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => alert(err.error?.message || 'Erro ao registrar')
    });
  }
}
