import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FichaService } from '../../services/ficha.service';
import { SistemaService } from '../../services/sistema.service';
import { Sistema } from '../../models/sistema.model';
import { Ficha } from '../../models/ficha.model';
import { CreateFichaPayload } from '../../models/ficha.model';

@Component({
  selector: 'app-create-sheet-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-sheet-modal.component.html',
  styleUrls: ['./create-sheet-modal.component.css']
})
export class CreateSheetModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() sheetCreated = new EventEmitter<Ficha>();

  sheetForm: FormGroup;
  sistemasRPG: Sistema[] = [];
  tiposDisponiveis: string[] = ['Personagem', 'NPC', 'Monstro']; // Exemplo

  private fb = inject(FormBuilder);
  private sistemaService = inject(SistemaService);
  private fichaService = inject(FichaService);
  private router = inject(Router);

  constructor() {
    this.sheetForm = this.fb.group({
      nome: ['', Validators.required],
      imagem: [null],
      sistema: ['', Validators.required],
      tipoFicha: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.sistemaService.getSistemas().subscribe(sistemas => {
      this.sistemasRPG = sistemas;
    });
  }

  onFileChange(event: any): void {
    // Lógica para lidar com o arquivo de imagem (será implementada depois)
  }

  createSheet(): void {
    if (this.sheetForm.invalid) return;

    const payload: CreateFichaPayload = {
      nome: this.sheetForm.value.nome,
      idSistema: this.sheetForm.value.sistema
    };

    this.fichaService.createFicha(payload).subscribe(novaFicha => {
      this.sheetCreated.emit(novaFicha); // Emite o evento com a ficha criada
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}