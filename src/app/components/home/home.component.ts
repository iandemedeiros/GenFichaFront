import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CreateSheetModalComponent } from "../create-sheet-modal/create-sheet-modal.component";
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FichaService } from '../../services/ficha.service';
import { Ficha } from '../../models/ficha.model';
import { BehaviorSubject, Observable, switchMap, map, forkJoin, of } from 'rxjs';
import { SistemaService } from '../../services/sistema.service';
import { Sistema } from '../../models/sistema.model'; 
import { FichaComSistema } from '../../models/ficha.model';  


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CreateSheetModalComponent,
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  isModalVisible = false;
  fichas$: Observable<FichaComSistema[]>;
  private refreshFichas$ = new BehaviorSubject<void>(undefined);

  private authService = inject(AuthService);
  private fichaService = inject(FichaService);
  private sistemaService = inject(SistemaService);
  private router = inject(Router);

  constructor() {
    this.fichas$ = this.refreshFichas$.pipe(
      switchMap(() => this.fichaService.getFichas()),
      // Transforma a lista de fichas para incluir os dados do sistema
      switchMap(fichas => {
        if (fichas.length === 0) {
          return of([]); // Retorna um array vazio se não houver fichas
        }
        // Cria um array de observables, um para cada sistema a ser buscado
        const sistemaObservables = fichas.map(ficha =>
          this.sistemaService.getSistemaById(ficha.idSistema).pipe(
            map(sistema => ({ ...ficha, sistema })) // Combina a ficha com seu sistema
          )
        );
        // forkJoin executa todos os observables em paralelo e emite quando todos estiverem completos
        return forkJoin(sistemaObservables);
      })
    );
  }

  ngOnInit(): void {
    // A subscrição é feita pelo async pipe no template
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  openModal(): void {
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  onSheetCreated(novaFicha: Ficha): void {
    this.closeModal();
    // Navega para a nova ficha, a home será atualizada quando o usuário voltar
    this.router.navigate(['/fichas', novaFicha.id]);
  }
}
