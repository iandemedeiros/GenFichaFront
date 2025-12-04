import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { of, EMPTY, forkJoin, Observable } from 'rxjs';

import { Habilidade } from '../../models/habilidade.model';
import { Sistema } from '../../models/sistema.model';
import { HabilidadeService } from '../../services/habilidade.service';
import { SistemaService } from '../../services/sistema.service';

@Component({
  selector: 'app-habilidade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './habilidade-form.component.html',
  styleUrl: './habilidade-form.component.css'
})
export class HabilidadeFormComponent implements OnInit {
  habilidadeForm!: FormGroup;
  isEditMode = false;
  todosSistemas: Sistema[] = [];
  sistemasOriginaisIds = new Set<number>(); // Para guardar os IDs originais em modo de edição
  isSaving = false; // Para controlar o estado de "salvando"
  private habilidadeId: string | null = null;
  errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private habilidadeService = inject(HabilidadeService);
  private sistemaService = inject(SistemaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  ngOnInit(): void {
    this.inicializarFormulario();
    this.loadDataBasedOnRoute();
  }

  private inicializarFormulario(): void {
    this.habilidadeForm = this.fb.group({
      nome: ['', [Validators.required]],
      descricao: ['', [Validators.required, Validators.maxLength(512)]],
      sistemas: this.fb.array([])
    });
  }

  private loadDataBasedOnRoute(): void {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.habilidadeId = params.get('id');
        this.isEditMode = !!this.habilidadeId;

        const todosSistemas$ = this.sistemaService.getSistemas();

        if (!this.isEditMode) {
          return forkJoin({ sistemas: todosSistemas$, habilidade: of(null) });
        }

        // Em modo de edição, busca a habilidade e os sistemas associados a ela
        const habilidade$ = this.habilidadeService.getHabilidade(Number(this.habilidadeId!));

        return forkJoin({
          sistemas: todosSistemas$,
          habilidade: habilidade$
        });
      }),
      tap(({ sistemas, habilidade }) => {
        this.todosSistemas = sistemas;
        this.buildSistemasCheckboxes(habilidade);
      }),
      catchError(error => {
        console.error('Erro ao carregar dados para o formulário:', error);
        this.errorMessage = 'Não foi possível carregar os dados do formulário. Tente novamente mais tarde.';
        return EMPTY; // Retorna um observable vazio para finalizar o fluxo em caso de erro
      })
    ).subscribe();
  }

  private buildSistemasCheckboxes(habilidade: Habilidade | null): void {
    this.sistemasFormArray.clear();
    const sistemasAssociadosIds = new Set(habilidade?.sistemas?.map(s => s.id) || []);

    this.todosSistemas.forEach(sistema => {
      this.sistemasFormArray.push(new FormControl(sistemasAssociadosIds.has(sistema.id)));
    });
    if (this.isEditMode && habilidade) {
      this.habilidadeForm.patchValue({ nome: habilidade.nome, descricao: habilidade.descricao });
      this.sistemasOriginaisIds = sistemasAssociadosIds;
    }
  }

  get sistemasFormArray() {
    return this.habilidadeForm.get('sistemas') as FormArray;
  }

  onSubmit(): void {
    if (this.habilidadeForm.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    const { dadosHabilidade, sistemasSelecionadosIds } = this.prepareSaveData();

    if (this.isEditMode && this.habilidadeId) {
      // Lógica de Atualização
      const idHabilidade = parseInt(this.habilidadeId, 10);

      const paraAdicionar = sistemasSelecionadosIds.filter(id => !this.sistemasOriginaisIds.has(id));
      const paraRemover = Array.from(this.sistemasOriginaisIds).filter(id => !sistemasSelecionadosIds.includes(id));

      const operacoesAdicionar$ = paraAdicionar.map(idSistema => this.sistemaService.associarHabilidade(idSistema, idHabilidade));
      const operacoesRemover$ = paraRemover.map(idSistema => this.sistemaService.desassociarHabilidade(idSistema, idHabilidade));

      this.habilidadeService.updateHabilidade(idHabilidade, dadosHabilidade).pipe(
        // O switchMap executa as operações de associação/desassociação após a atualização da habilidade
        switchMap(() => {
          const todasOperacoes$ = [...operacoesAdicionar$, ...operacoesRemover$];
          if (todasOperacoes$.length === 0) {
            return of(null); // Nenhuma associação para mudar
          }
          return forkJoin(todasOperacoes$);
        }),
        tap(() => this.router.navigate(['/admin/habilidades'])),
        catchError(error => {
          console.error('Erro no processo de atualização da habilidade:', error);
          this.errorMessage = 'Falha ao atualizar a habilidade.';
          return EMPTY;
        }),
        // O finalize garante que isSaving será false ao final do processo, com sucesso ou erro.
        finalize(() => this.isSaving = false)
      ).subscribe();
    } else {
      // Lógica de Criação
      this.habilidadeService.createHabilidade(dadosHabilidade).pipe(
        switchMap((novaHabilidade: Habilidade) => {
          // Verifica se a nova habilidade tem um ID e se há sistemas para associar
          if (novaHabilidade.id && sistemasSelecionadosIds.length > 0) {
            const associacoes$ = sistemasSelecionadosIds.map(idSistema => {
              // A asserção non-null (!) é segura aqui devido à verificação `novaHabilidade.id`
              return this.sistemaService.associarHabilidade(idSistema, novaHabilidade.id!);
            });
            return forkJoin(associacoes$);
          }
          return of(novaHabilidade); // Se não, apenas continua
        }),
        tap(() => this.router.navigate(['/admin/habilidades'])),
        catchError(error => {
          console.error('Erro no processo de criação da habilidade:', error);
          this.errorMessage = 'Falha ao criar a habilidade.';
          return EMPTY;
        }),
        finalize(() => this.isSaving = false)
      ).subscribe();
    }
  }

  private prepareSaveData(): { dadosHabilidade: Habilidade, sistemasSelecionadosIds: number[] } {
    const formValue = this.habilidadeForm.value;

    const sistemasSelecionados = this.todosSistemas.filter((_, index) => formValue.sistemas[index]);
    const sistemasSelecionadosIds = sistemasSelecionados.map(sistema => sistema.id);

    const dadosHabilidade: Partial<Habilidade> = {
      nome: formValue.nome,
      descricao: formValue.descricao,
      sistemas: sistemasSelecionados,
    };

    if (this.isEditMode && this.habilidadeId) {
      dadosHabilidade.id = parseInt(this.habilidadeId, 10);
    }

    return { dadosHabilidade: dadosHabilidade as Habilidade, sistemasSelecionadosIds };
  }

  cancelar(): void {
    this.router.navigate(['/admin/habilidades']);
  }
}
