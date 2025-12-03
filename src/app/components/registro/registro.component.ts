import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-registro',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  passwordValid = {
    length: false,
    number: false,
    lowercase: false,
    uppercase: false,
    special: false
  };

  form: FormGroup;

  constructor(private http: HttpClient, private router: Router) {
    this.form = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      senha: new FormControl('', [Validators.required, this.passwordStrengthValidator()]),
      confirmaSenha: new FormControl('', [Validators.required])
    }, { validators: this.matchPasswordValidator });
  }

  /**
   * Validador customizado para verificar a força da senha.
   * Ele também atualiza o objeto 'passwordValid' para o feedback visual no template.
   */
  private passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value || '';

      // Atualiza o estado para o template
      this.passwordValid.length = password.length >= 8 && password.length <= 16;
      this.passwordValid.number = /[0-9]/.test(password);
      this.passwordValid.lowercase = /[a-z]/.test(password);
      this.passwordValid.uppercase = /[A-Z]/.test(password);
      this.passwordValid.special = /[^a-zA-Z0-9]/.test(password);

      const isValid = Object.values(this.passwordValid).every(Boolean);

      // Retorna um objeto de erro se a senha for inválida, ou nulo se for válida.
      return isValid ? null : { passwordStrength: 'A senha não atende a todos os critérios.' };
    };
  }

  /**
   * Validador customizado para o FormGroup, que verifica se os campos 'senha' e 'confirmaSenha' são iguais.
   */
  private matchPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const senha = formGroup.get('senha');
    const confirmaSenha = formGroup.get('confirmaSenha');

    // Se os campos não existem, não faz nada.
    if (!senha || !confirmaSenha) {
      return null;
    }

    // O validador agora é "puro". Ele apenas retorna o estado de erro.
    // O template irá ler este erro diretamente do FormGroup (`form.hasError('mismatch')`).
    return senha.value === confirmaSenha.value ? null : { mismatch: true };
  };

  get canSubmit() {
    // A única fonte da verdade agora é a validade do formulário.
    return this.form.valid;
  }

  registrar() {
    if (!this.canSubmit) return;

    // Enviando o valor do formulário diretamente, pois os nomes dos campos agora correspondem à API.
    this.http.post('http://localhost:3001/api/usuarios', this.form.value).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        console.error('Erro completo da API:', err); // Loga o erro completo no console
        const errorMessage = err.error?.message || err.message || 'Ocorreu um erro desconhecido ao registrar.';
        alert(`Erro ao registrar: ${errorMessage}`);
      }
    });
  }
}
