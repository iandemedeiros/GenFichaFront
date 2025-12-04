import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CreateSheetModalComponent } from "../create-sheet-modal/create-sheet-modal.component";
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { FichaService } from '../../services/ficha.service'; // Descomente quando o serviço for criado
import { Ficha } from '../../models/ficha.model';
 
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
  fichas: Ficha[] = []; // Array para armazenar as fichas do usuário.

  private authService = inject(AuthService);
  // private fichaService = inject(FichaService); // Descomente quando o serviço for criado

  ngOnInit(): void {
    this.carregarFichas();
  }

  carregarFichas(): void {
    // Lógica para buscar as fichas do usuário via FichaService
    // this.fichaService.getFichas().subscribe(data => {
    //   this.fichas = data;
    //   console.log('Fichas do usuário carregadas.');
    // });
    console.log('ngOnInit: Carregando fichas do usuário...');
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
    console.log('Ficha criada:', novaFicha);
    this.fichas.push(novaFicha); // Adiciona a nova ficha à lista local para atualização da UI.
    this.closeModal();
    console.log('Modal fechado após criação da ficha.');
  }
}
