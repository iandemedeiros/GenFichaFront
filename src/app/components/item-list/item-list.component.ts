import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { combineLatest, of, EMPTY, startWith, map, debounceTime } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css'
})
export class ItemListComponent implements OnInit {
  private todosItens: Item[] = [];
  itensFiltrados: Item[] = [];
  isLoading = true; // Para controlar o estado de carregamento
  errorMessage: string | null = null; // Para exibir mensagens de erro

  searchControl = new FormControl('');

  private itemService = inject(ItemService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadItens();
  }

  loadItens(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const itens$ = this.itemService.getItens().pipe(
      // O loading termina assim que os dados chegam ou ocorre um erro.
      finalize(() => this.isLoading = false),
      catchError(error => {
        console.error('Erro ao carregar a lista de itens:', error);
        this.errorMessage = 'Não foi possível carregar os itens. Tente novamente mais tarde.';
        return of([]); // Retorna um array vazio para o combineLatest não quebrar.
      })
    );

    const filtro$ = this.searchControl.valueChanges.pipe(
      startWith(''), // Emite um valor inicial para carregar a lista completa
      debounceTime(300), // Espera 300ms após o usuário parar de digitar
    ); 

    // Combina os dados da API com as mudanças do filtro
    combineLatest([itens$, filtro$]).pipe(
      map(([itens, termo]) => {
        this.todosItens = itens; // Atualiza a lista principal
        const termoBusca = termo?.toLowerCase() || '';
        if (!termoBusca) {
          return this.todosItens;
        }
        // Filtra por nome, ID e sistemas associados.
        return this.todosItens.filter(item =>
          item.nome.toLowerCase().includes(termoBusca) ||
          item.id.toString().includes(termoBusca) ||
          (item.sistemas && item.sistemas.some(s => s.nome.toLowerCase().includes(termoBusca)))
        );
      })
    ).subscribe(itensFiltrados => {
      this.itensFiltrados = itensFiltrados;
    });
  }

  criarItem(): void {
    this.router.navigate(['/admin/itens/nova']);
  }

  editarItem(id: number): void {
    this.router.navigate(['/admin/itens/editar', id]);
  }

  excluirItem(id: number): void {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      this.isLoading = true; // Ativa o loading durante a exclusão
      this.itemService.deleteItem(id).pipe(
        tap(() => {
          // Recarrega a lista para garantir consistência com o banco de dados.
          this.loadItens();
        }),
        catchError(error => {
          console.error(`Erro ao excluir item com id: ${id}`, error);
          this.errorMessage = `Falha ao excluir o item. Tente novamente.`;
          this.isLoading = false; // Desativa o loading em caso de erro na exclusão
          return EMPTY;
        })
      ).subscribe();
    }
  }
}
