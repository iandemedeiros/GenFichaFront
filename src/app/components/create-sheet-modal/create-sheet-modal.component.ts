import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Sistema } from '../../models/sistema.model';
import { RpgSystemService } from '../../services/rpg-system.service';
import { FichaService, CreateFichaPayload } from '../../services/ficha.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-sheet-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,],
  templateUrl: './create-sheet-modal.component.html',
  styleUrls: ['./create-sheet-modal.component.css'],
  // Adicionando os novos serviços ao componente
  providers: [FichaService]
})
export class CreateSheetModalComponent implements OnInit {
  private rpgSystemService = inject(RpgSystemService);

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  private fichaService = inject(FichaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  sheetForm: FormGroup;

  sistemasRPG: Sistema[] = [];
  tiposDeFicha: { [key: string]: string[] } = {
    'D&D 5e': ['Ficha de Personagem', 'Ficha de Monstro', 'Ficha de NPC'],
    'Daggerheart': ['Ficha de Personagem', 'Ficha de Adversário'],
    'ForbiddenLands': ['Ficha de Personagem', 'Ficha de Monstro'],
    'SDL': ['Ficha de Personagem'] // Adicionado conforme solicitado
  };
  tiposDisponiveis: string[] = [];

  constructor() {
    this.sheetForm = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      imagem: new FormControl<File | null>(null),
      sistema: new FormControl('', [Validators.required]),
      tipoFicha: new FormControl({ value: '', disabled: true }, [Validators.required])
    });
  }

  ngOnInit(): void {
    this.rpgSystemService.getSistemas().subscribe(data => {
      console.log('Sistemas recebidos da API:', data);
      this.sistemasRPG = data;
    });

    // Observa mudanças no dropdown 'sistema'
    this.sheetForm.get('sistema')?.valueChanges.subscribe(sistemaId => {
      const tipoFichaControl = this.sheetForm.get('tipoFicha');
      // Encontra o objeto do sistema completo pelo ID para obter o nome
      const sistemaSelecionado = this.sistemasRPG.find(s => s.id === +sistemaId);

      if (sistemaSelecionado && this.tiposDeFicha[sistemaSelecionado.nome]) {
        this.tiposDisponiveis = this.tiposDeFicha[sistemaSelecionado.nome];
        tipoFichaControl?.enable(); // Habilita o dropdown de tipo
      } else {
        this.tiposDisponiveis = [];
        tipoFichaControl?.disable(); // Desabilita se nenhum sistema for selecionado
      }
      tipoFichaControl?.setValue(''); // Reseta o valor ao mudar o sistema
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.sheetForm.patchValue({
        imagem: file
      });
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  createSheet(): void {
    // O botão de submit já está desabilitado se o formulário for inválido,
    // mas é uma boa prática verificar novamente.
    if (!this.sheetForm.valid) {
      return;
    }

    const currentUser = this.authService.getUser();
    if (!currentUser) {
      console.error('Nenhum usuário logado para criar a ficha.');
      // Idealmente, mostre uma mensagem de erro para o usuário
      return;
    }

    const formValue = this.sheetForm.getRawValue();

    const payload: CreateFichaPayload = {
      idSistema: formValue.sistema,
      nome: formValue.nome
    };

    this.fichaService.createFicha(payload).subscribe(novaFicha => {
      console.log('Ficha criada com sucesso:', novaFicha);
      this.closeModal(); // Fecha o modal
      this.router.navigate(['/fichas', novaFicha.id]); // Navega para a página de detalhes
    });
  }
}