import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FichaService } from '../../services/ficha.service';
import { Ficha } from '../../models/ficha.model';
import { Observable, switchMap, map } from 'rxjs';
import { Sistema } from '../../models/sistema.model';
import { SistemaService } from '../../services/sistema.service';

// Interface para o nosso modelo de dados combinado
interface SheetViewModel {
  ficha: Ficha;
  sistema: Sistema; // Assuming Sistema model has a 'nome' property
}

@Component({
  selector: 'app-sheet-detail',
  standalone: true,
  imports: [CommonModule],
  providers: [FichaService, SistemaService], // Fornece os serviços necessários
  template: `
    <div class="container mt-4">
      <!-- Usando o pipe async para lidar com o Observable -->
      <div *ngIf="viewModel$ | async as vm; else loadingOrError">
        <h2>{{ vm.ficha.nome || 'Detalhes da Ficha' }}</h2>
        <p>ID da Ficha: <strong>{{ vm.ficha.id }}</strong></p>
        <p>Sistema: <strong>{{ vm.sistema.nome }}</strong></p>
        <p>Criada em: <strong>{{ vm.ficha.dataCriacao | date: 'dd/MM/yyyy' }}</strong></p>
        <hr>
        <!-- O restante do conteúdo detalhado da ficha virá aqui -->
      </div>

      <ng-template #loadingOrError>
        <!-- Você pode adicionar uma variável de erro para diferenciar o loading do erro -->
        <p class="text-center">Carregando detalhes da ficha...</p>
      </ng-template>
    </div>
  `
})
export class SheetDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fichaService = inject(FichaService);
  private readonly sistemaService = inject(SistemaService);

  // Este Observable emitirá um objeto combinado com os dados da ficha e do sistema
  viewModel$!: Observable<SheetViewModel>;

  ngOnInit(): void {
    const sheetId = this.route.snapshot.paramMap.get('id');

    if (sheetId) {
      this.viewModel$ = this.fichaService.getFichaById(sheetId).pipe(
        switchMap(ficha => {
          // Assim que a ficha for recebida, usamos o idSistema para buscar o sistema
          return this.sistemaService.getSistemaById(ficha.idSistema).pipe(
            // Combinamos os resultados de ambas as chamadas em um único objeto
            map(sistema => ({ ficha, sistema }))
          );
        })
      );
    } else {
      // Lidar com o caso em que não há ID na URL
      console.error('Nenhum ID de ficha encontrado na URL.');
    }
  }
}