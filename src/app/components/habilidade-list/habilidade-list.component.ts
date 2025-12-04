import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { EMPTY, startWith, map, combineLatest, of, debounceTime } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

// Models e Services
import { Habilidade } from '../../models/habilidade.model';
import { HabilidadeService } from '../../services/habilidade.service';

@Component({
  selector: 'app-habilidade-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './habilidade-list.component.html',
  styleUrl: './habilidade-list.component.css'
})
export class HabilidadeListComponent implements OnInit {
  private todasHabilidades: Habilidade[] = [];
  habilidadesFiltradas: Habilidade[] = [];
  isLoading = true; // Para controlar o estado de carregamento
  errorMessage: string | null = null; // Para exibir mensagens de erro

  searchControl = new FormControl('');

  private habilidadeService = inject(HabilidadeService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadHabilidades();
  }

  loadHabilidades(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const habilidades$ = this.habilidadeService.getHabilidades().pipe(
      // O loading termina assim que os dados chegam ou ocorre um erro.
      finalize(() => this.isLoading = false),
      catchError(error => {
        console.error('Erro ao carregar a lista de habilidades:', error);
        this.errorMessage = 'Não foi possível carregar as habilidades. Tente novamente mais tarde.';
        return of([]); // Retorna um array vazio para o combineLatest não quebrar
      })
    );

    const filtro$ = this.searchControl.valueChanges.pipe(
      startWith(''), // Emite um valor inicial para carregar a lista completa
      debounceTime(300) // Espera 300ms após o usuário parar de digitar
    );

    // Combina os dados da API com as mudanças do filtro
    combineLatest([habilidades$, filtro$]).pipe(
      map(([habilidades, termo]) => {
        this.todasHabilidades = habilidades; // Atualiza a lista principal
        const termoBusca = termo?.toLowerCase() || '';
        if (!termoBusca) {
          return this.todasHabilidades;
        }
        return this.todasHabilidades.filter(habilidade =>
          habilidade.nome.toLowerCase().includes(termoBusca) ||
          habilidade.id.toString().includes(termoBusca) ||
          (habilidade.sistemas && habilidade.sistemas.some(s => s.nome.toLowerCase().includes(termoBusca)))
        );
      })
    ).subscribe(habilidadesFiltradas => {
      this.habilidadesFiltradas = habilidadesFiltradas;
    });
  }

  criarHabilidade(): void {
    this.router.navigate(['/admin/habilidades/nova']);
  }

  editarHabilidade(id: number): void {
    this.router.navigate(['/admin/habilidades/editar', id]);
  }

  excluirHabilidade(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta habilidade?')) {
      this.isLoading = true; // Ativa o loading durante a exclusão
      this.habilidadeService.deleteHabilidade(id).pipe(
        tap(() => {
          // Recarrega a lista para garantir consistência com o banco de dados.
          this.loadHabilidades();
        }),
        catchError(error => {
          console.error(`Erro ao excluir habilidade com id: ${id}`, error);
          this.errorMessage = `Falha ao excluir a habilidade. Tente novamente.`;
          this.isLoading = false; // Desativa o loading em caso de erro na exclusão
          return EMPTY;
        })
      ).subscribe();
    }
  }
}
