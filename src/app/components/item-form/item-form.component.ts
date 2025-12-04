import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators';
import { of, EMPTY, Observable, forkJoin } from 'rxjs';

import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { Sistema } from '../../models/sistema.model';
import { SistemaService } from '../../services/sistema.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.css'
})
export class ItemFormComponent implements OnInit {
  itemForm!: FormGroup;
  isEditMode = false;
  todosSistemas: Sistema[] = [];
  sistemasOriginaisIds = new Set<number>(); // Para guardar os IDs originais em modo de edição
  isSaving = false; // Para controlar o estado de "salvando"
  private itemId: string | null = null;
  errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private itemService = inject(ItemService);
  private sistemaService = inject(SistemaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  ngOnInit(): void {
    this.inicializarFormulario();
    this.loadDataBasedOnRoute();
  }

  private inicializarFormulario(): void {
    this.itemForm = this.fb.group({
      nome: ['', [Validators.required]],
      descricao: ['', [Validators.required, Validators.maxLength(512)]],
      sistemas: this.fb.array([])
    });
  }

  private loadDataBasedOnRoute(): void {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        this.itemId = params.get('id');
        this.isEditMode = !!this.itemId;

        const todosSistemas$ = this.sistemaService.getSistemas();

        if (!this.isEditMode) {
          return forkJoin({ sistemas: todosSistemas$, item: of(null) });
        }

        // Em modo de edição, busca o item e os sistemas associados a ele
        const item$ = this.itemService.getItem(Number(this.itemId!));

        return forkJoin({
          sistemas: todosSistemas$,
          item: item$
        });
      }),
      tap(({ sistemas, item }) => {
        this.todosSistemas = sistemas || []; // Garante que seja sempre um array
        this.buildSistemasCheckboxes(item);
      }),
      catchError(error => {
        this.errorMessage = 'Não foi possível carregar os dados do formulário. Tente novamente mais tarde.';
        return EMPTY; // Retorna um observable vazio para finalizar o fluxo em caso de erro
      })
    ).subscribe();
  }

  private buildSistemasCheckboxes(item: Item | null): void {
    this.sistemasFormArray.clear();
    const sistemasAssociadosIds = new Set(item?.sistemas?.map(s => s.id) || []);

    this.todosSistemas.forEach(sistema => {
      this.sistemasFormArray.push(new FormControl(sistemasAssociadosIds.has(sistema.id)));
    });
    if (this.isEditMode && item) {
      this.itemForm.patchValue({ nome: item.nome, descricao: item.descricao });
      this.sistemasOriginaisIds = sistemasAssociadosIds;
    }
  }

  get sistemasFormArray() {
    return this.itemForm.get('sistemas') as FormArray;
  }

  onSubmit(): void {
    if (this.itemForm.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    const { dadosItem, sistemasSelecionadosIds } = this.prepareSaveData();

    if (this.isEditMode && this.itemId) {
      // Lógica de Atualização
      const idItem = parseInt(this.itemId, 10);

      const paraAdicionar = sistemasSelecionadosIds.filter(id => !this.sistemasOriginaisIds.has(id));
      const paraRemover = Array.from(this.sistemasOriginaisIds).filter(id => !sistemasSelecionadosIds.includes(id));

      const operacoesAdicionar$ = paraAdicionar.map(idSistema => this.sistemaService.associarItem(idSistema, idItem));
      const operacoesRemover$ = paraRemover.map(idSistema => this.sistemaService.desassociarItem(idSistema, idItem));

      this.itemService.updateItem(idItem, dadosItem).pipe(
        switchMap(() => {
          const todasOperacoes$ = [...operacoesAdicionar$, ...operacoesRemover$];
          if (todasOperacoes$.length === 0) {
            return of(null);
          }
          return forkJoin(todasOperacoes$);
        }),
        tap(() => this.router.navigate(['/admin/itens'])),
        catchError(error => {
          console.error('Erro no processo de atualização do item:', error);
          this.errorMessage = 'Falha ao atualizar o item.';
          return EMPTY;
        }),
        finalize(() => this.isSaving = false)
      ).subscribe();
    } else {
      // Lógica de Criação
      this.itemService.createItem(dadosItem).pipe(
        switchMap((novoItem: Item) => {
          if (novoItem.id && sistemasSelecionadosIds.length > 0) {
            const associacoes$ = sistemasSelecionadosIds.map(idSistema => {
              return this.sistemaService.associarItem(idSistema, novoItem.id!);
            });
            return forkJoin(associacoes$);
          }
          return of(novoItem);
        }),
        tap(() => this.router.navigate(['/admin/itens'])),
        catchError(error => {
          console.error('Erro no processo de criação do item:', error);
          this.errorMessage = 'Falha ao criar o item.';
          return EMPTY;
        }),
        finalize(() => this.isSaving = false)
      ).subscribe();
    }
  }

  private prepareSaveData(): { dadosItem: Item, sistemasSelecionadosIds: number[] } {
    const formValue = this.itemForm.value;
    const sistemasSelecionados = this.todosSistemas.filter((_, index) => formValue.sistemas[index]);
    const sistemasSelecionadosIds = sistemasSelecionados.map(sistema => sistema.id);

    const dadosItem: Partial<Item> = {
      nome: formValue.nome,
      descricao: formValue.descricao,
      sistemas: sistemasSelecionados,
    };

    if (this.isEditMode && this.itemId) {
      dadosItem.id = parseInt(this.itemId, 10);
    }

    return { dadosItem: dadosItem as Item, sistemasSelecionadosIds };
  }

  cancelar(): void {
    this.router.navigate(['/admin/itens']);
  }
}
