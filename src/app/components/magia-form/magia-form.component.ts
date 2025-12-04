import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, ParamMap } from '@angular/router';
import { Observable, of, forkJoin, switchMap, tap, catchError, EMPTY } from 'rxjs';

// Models e Services (caminhos de exemplo, ajuste se necessário)
import { Magia } from '../../models/magia.model';
import { Sistema } from '../../models/sistema.model';
import { MagiaService } from '../../services/magia.service';
import { SistemaService } from '../../services/sistema.service'; // Certifique-se que este serviço tem os métodos associar/desassociar

@Component({
  selector: 'app-magia-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './magia-form.component.html',
  styleUrl: './magia-form.component.css'
})
export class MagiaFormComponent implements OnInit {
  magiaForm!: FormGroup;
  isEditMode = false;
  todosSistemas: Sistema[] = [];
  sistemasOriginaisIds = new Set<number>(); // Para guardar os IDs originais em modo de edição
  isSaving = false; // Para controlar o estado de "salvando"
  private magiaId: string | null = null;

  private fb = inject(FormBuilder);
  private magiaService = inject(MagiaService);
  private sistemaService = inject(SistemaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  ngOnInit(): void {
    this.inicializarFormulario();
    this.loadDataBasedOnRoute();
  }

  private inicializarFormulario(): void {
    this.magiaForm = this.fb.group({
      nome: ['', [Validators.required]],
      descricao: ['', [Validators.required, Validators.maxLength(512)]],
      sistemas: this.fb.array([])
    });
  }

  private loadDataBasedOnRoute(): void {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.magiaId = params.get('id');
        this.isEditMode = !!this.magiaId;

        const todosSistemas$ = this.sistemaService.getSistemas();

        if (!this.isEditMode) {
          return forkJoin({ sistemas: todosSistemas$, magia: of(null) });
        }

        // Em modo de edição, busca a magia e os sistemas associados a ela
        const magia$ = this.magiaService.getMagia(this.magiaId!);

        return forkJoin({
          sistemas: todosSistemas$,
          magia: magia$
        });
      }),
      tap(({ sistemas, magia }) => {
        this.todosSistemas = sistemas;
        this.buildSistemasCheckboxes(magia);
      }),
      catchError(error => {
        console.error('Erro ao carregar dados para o formulário:', error);
        // Opcional: exibir uma mensagem de erro para o usuário na UI
        return EMPTY; // Retorna um observable vazio para finalizar o fluxo em caso de erro
      })
    ).subscribe();
  }

  private buildSistemasCheckboxes(magia: Magia | null): void {
    this.sistemasFormArray.clear();
    const sistemasAssociadosIds = new Set(magia?.sistemas?.map(s => s.id) || []);
    
    this.todosSistemas.forEach(sistema => {
      this.sistemasFormArray.push(new FormControl(sistemasAssociadosIds.has(sistema.id)));
    });
    if (this.isEditMode && magia) {
      this.magiaForm.patchValue({ nome: magia.nome, descricao: magia.descricao });
      this.sistemasOriginaisIds = sistemasAssociadosIds;
    }
  }

  get sistemasFormArray() {
    return this.magiaForm.get('sistemas') as FormArray;
  }

  onSubmit(): void {
    if (this.magiaForm.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    const { dadosMagia, sistemasSelecionadosIds } = this.prepareSaveData();

    if (this.isEditMode && this.magiaId) {
      // Lógica de Atualização
      const idMagia = parseInt(this.magiaId, 10);

      const paraAdicionar = sistemasSelecionadosIds.filter(id => !this.sistemasOriginaisIds.has(id));
      const paraRemover = Array.from(this.sistemasOriginaisIds).filter(id => !sistemasSelecionadosIds.includes(id));

      const operacoesAdicionar$ = paraAdicionar.map(idSistema => this.sistemaService.associarMagia(idSistema, idMagia));
      const operacoesRemover$ = paraRemover.map(idSistema => this.sistemaService.desassociarMagia(idSistema, idMagia)); // Assumindo que desassociar não precisa de body

      this.magiaService.updateMagia(this.magiaId, dadosMagia).pipe(
        switchMap(() => {
          const todasOperacoes$ = [...operacoesAdicionar$, ...operacoesRemover$];
          if (todasOperacoes$.length === 0) {
            return of(null); // Nenhuma associação para mudar
          }
          return forkJoin(todasOperacoes$);
        }),
        catchError(error => {
          console.error('Erro no processo de atualização da magia:', error);
          this.isSaving = false;
          return EMPTY;
        })
      ).subscribe(() => {
        this.router.navigate(['/admin/magias']);
        this.isSaving = false;
      });
    } else {
      // Lógica de Criação
      this.magiaService.createMagia(dadosMagia).pipe(
        switchMap((novaMagia: Magia) => {
          if (sistemasSelecionadosIds.length > 0) {
            // Se houver sistemas para associar, cria as chamadas para a API
            const associacoes$ = sistemasSelecionadosIds.map(idSistema =>
              this.sistemaService.associarMagia(idSistema, novaMagia.id)
            );
            return forkJoin(associacoes$);
          }
          return of(novaMagia); // Se não, apenas continua
        }),
        catchError(error => {
          console.error('Erro no processo de criação da magia:', error);
          this.isSaving = false;
          return EMPTY;
        })
      ).subscribe(() => {
        this.router.navigate(['/admin/magias']);
        this.isSaving = false;
      });
    }
  }

  private prepareSaveData(): { dadosMagia: { nome: string, descricao: string }, sistemasSelecionadosIds: number[] } {
    const formValue = this.magiaForm.value;

    const sistemasSelecionadosIds = this.todosSistemas
      .filter((_, index) => formValue.sistemas[index])
      .map(sistema => sistema.id);

    const dadosMagia = {
      nome: formValue.nome,
      descricao: formValue.descricao,
    };

    return { dadosMagia, sistemasSelecionadosIds };
  }
}
