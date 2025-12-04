import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { Ficha } from '../../models/ficha.model';
import { Sistema } from '../../models/sistema.model';
import { Habilidade } from '../../models/habilidade.model';
import { Magia } from '../../models/magia.model';
import { Item } from '../../models/item.model';

import { FichaService } from '../../services/ficha.service';
import { SistemaService } from '../../services/sistema.service';
import { HabilidadeService } from '../../services/habilidade.service';
import { MagiaService } from '../../services/magia.service';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-sheet-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './sheet-detail.component.html',
  styleUrls: ['./sheet-detail.component.css']
})
export class SheetDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private fichaService = inject(FichaService);
  private sistemaService = inject(SistemaService);
  private habilidadeService = inject(HabilidadeService);
  private magiaService = inject(MagiaService);
  private itemService = inject(ItemService);

  ficha: Ficha | null = null;
  sistema: Sistema | null = null;
  sheetDetailForm: FormGroup;

  // Listas para os dropdowns
  habilidadesDoSistema$: Observable<Habilidade[]> = of([]);
  magiasDoSistema$: Observable<Magia[]> = of([]);
  itensDoSistema$: Observable<Item[]> = of([]);

  // Listas de itens adicionados à ficha
  habilidadesDaFicha: Habilidade[] = [];
  magiasDaFicha: Magia[] = [];
  itensDaFicha: Item[] = [];

  // Propriedades para ngModel dos selects
  habilidadeSelecionada: Habilidade | null = null;
  magiaSelecionada: Magia | null = null;
  itemSelecionado: Item | null = null;

  constructor() {
    this.sheetDetailForm = this.fb.group({
      nome: [''],
      sistema: [{ value: '', disabled: true }],
      tipoFicha: [{ value: 'Personagem', disabled: true }], // Exemplo
      imagemUrl: ['assets/images/personagem.jpg'], // Imagem padrão
      // Atributos (apenas UI por enquanto)
      forca: [0],
      agilidade: [0],
      intelecto: [0],
      vontade: [0],
      vida: [0],
      defesa: [0],
      percepcao: [0],
      taxaDeCura: [0],
      poder: [0]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.fichaService.getFichaById(id);
        }
        return of(null);
      })
    ).subscribe(ficha => {
      if (ficha) {
        this.ficha = ficha;
        this.sheetDetailForm.patchValue({ nome: ficha.nome });

        // Carrega o nome do sistema
        this.sistemaService.getSistemaById(ficha.idSistema).subscribe(sistema => {
          this.sistema = sistema;
          this.sheetDetailForm.patchValue({ sistema: sistema.nome });
        });

        // Carrega as listas de Habilidades, Magias e Itens do sistema
        this.habilidadesDoSistema$ = this.habilidadeService.getHabilidadesBySistema(ficha.idSistema);
        this.magiasDoSistema$ = this.magiaService.getMagiasBySistema(ficha.idSistema);
        this.itensDoSistema$ = this.itemService.getItensBySistema(ficha.idSistema);
      }
    });
  }

  onFileChange(event: any) { /* Lógica para upload de imagem */ }

  adicionarHabilidade() {
    if (this.habilidadeSelecionada && !this.habilidadesDaFicha.find(h => h.id === this.habilidadeSelecionada!.id)) {
      this.habilidadesDaFicha.push(this.habilidadeSelecionada);
    }
  }

  adicionarMagia() {
    if (this.magiaSelecionada && !this.magiasDaFicha.find(m => m.id === this.magiaSelecionada!.id)) {
      this.magiasDaFicha.push(this.magiaSelecionada);
    }
  }

  adicionarItem() {
    if (this.itemSelecionado && !this.itensDaFicha.find(i => i.id === this.itemSelecionado!.id)) {
      this.itensDaFicha.push(this.itemSelecionado);
    }
  }

  removerHabilidade(id: number) {
    this.habilidadesDaFicha = this.habilidadesDaFicha.filter(h => h.id !== id);
  }

  removerMagia(id: number) {
    this.magiasDaFicha = this.magiasDaFicha.filter(m => m.id !== id);
  }

  removerItem(id: number) {
    this.itensDaFicha = this.itensDaFicha.filter(i => i.id !== id);
  }

  salvarAlteracoes() {
    if (!this.ficha || this.sheetDetailForm.invalid) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Payload para atualizar os dados básicos da ficha
    const fichaPayload = {
      nome: this.sheetDetailForm.value.nome,
      // ...outros atributos do formulário como vida, força, etc.
    };

    // Payload para atualizar as associações (assumindo que a API aceita isso)
    const associacoesPayload = {
      habilidades: this.habilidadesDaFicha.map(h => h.id),
      magias: this.magiasDaFicha.map(m => m.id),
      itens: this.itensDaFicha.map(i => i.id)
    };

    // O ideal é que o FichaService tenha um método que atualize tudo de uma vez
    // Ex: this.fichaService.updateFichaCompleta(this.ficha.id, { ...fichaPayload, ...associacoesPayload })
    // Por enquanto, vamos atualizar apenas o nome para manter o exemplo funcional.

    this.fichaService.updateFicha(this.ficha.id, fichaPayload).subscribe({
      next: () => {
        alert('Ficha salva com sucesso!');
        // Aqui você também chamaria os serviços para salvar as associações
      },
      error: (err) => alert(err.message)
    });
  }

  deletarFicha() {
    if (this.ficha && confirm(`Tem certeza que deseja deletar a ficha "${this.ficha.nome}"? Esta ação não pode ser desfeita.`)) {
      this.fichaService.deleteFicha(this.ficha.id).subscribe(() => {
        alert('Ficha deletada com sucesso!');
        this.router.navigate(['/home']);
      });
    }
  }
}