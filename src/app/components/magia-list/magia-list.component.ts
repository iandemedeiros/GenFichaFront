import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { EMPTY, startWith, map, combineLatest, of, debounceTime } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

// Models e Services
import { Magia } from '../../models/magia.model';
import { MagiaService } from '../../services/magia.service';

@Component({
  selector: 'app-magia-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './magia-list.component.html',
  styleUrl: './magia-list.component.css'
})
export class MagiaListComponent implements OnInit {
  private todasMagias: Magia[] = [];
  magiasFiltradas: Magia[] = [];
  isLoading = true; // Para controlar o estado de carregamento
  errorMessage: string | null = null; // Para exibir mensagens de erro
  
  searchControl = new FormControl('');

  private magiaService = inject(MagiaService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadMagias();
  }
  
  loadMagias(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const magias$ = this.magiaService.getMagias().pipe(
      // O loading termina assim que os dados chegam ou ocorre um erro.
      finalize(() => this.isLoading = false),
      catchError(error => {
        console.error('Erro ao carregar a lista de magias:', error);
        this.errorMessage = 'Não foi possível carregar as magias. Tente novamente mais tarde.';
        return of([]); // Retorna um array vazio para o combineLatest não quebrar
      })
    );

    const filtro$ = this.searchControl.valueChanges.pipe(
      startWith(''), // Emite um valor inicial para carregar a lista completa
      debounceTime(300) // Espera 300ms após o usuário parar de digitar
    );

    // Combina os dados da API com as mudanças do filtro
    combineLatest([magias$, filtro$]).pipe(
      map(([magias, termo]) => {
        this.todasMagias = magias; // Atualiza a lista principal
        const termoBusca = termo?.toLowerCase() || '';
        if (!termoBusca) {
          return this.todasMagias;
        }
        return this.todasMagias.filter(magia =>
          magia.nome.toLowerCase().includes(termoBusca) ||
          magia.id.toString().includes(termoBusca) ||
          (magia.sistemas && magia.sistemas.some(s => s.nome.toLowerCase().includes(termoBusca)))
        );
      })
    ).subscribe(magiasFiltradas => {
      this.magiasFiltradas = magiasFiltradas;
    });
  }

  criarMagia(): void {
    this.router.navigate(['/admin/magias/nova']);
  }

  editarMagia(id: number): void {
    this.router.navigate(['/admin/magias/editar', id]);
  }

  excluirMagia(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta magia?')) {
      this.isLoading = true; // Ativa o loading durante a exclusão
      this.magiaService.deleteMagia(id).pipe(
        tap(() => {
          // Recarrega a lista para garantir consistência com o banco de dados.
          this.loadMagias();
        }),
        catchError(error => {
          console.error(`Erro ao excluir magia com id: ${id}`, error);
          this.errorMessage = `Falha ao excluir a magia. Tente novamente.`;
          this.isLoading = false; // Desativa o loading em caso de erro na exclusão
          return EMPTY;
        })
      ).subscribe();
    }
  }
}