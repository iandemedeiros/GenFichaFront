import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateSheetModalComponent } from "../create-sheet-modal/create-sheet-modal.component";
// O componente do modal será criado a seguir
// import { CreateSheetModalComponent } from '../create-sheet-modal/create-sheet-modal.component';

@Component({
  selector: 'app-home',
  // Adicionando standalone: true e as importações necessárias
  standalone: true,
  imports: [
    CommonModule,
    CreateSheetModalComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isModalVisible = false;

  openModal(): void {
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  onSheetCreated(event: any): void {
    console.log('Ficha criada:', event);
    // Futuramente, aqui você adicionará a lógica para exibir a nova ficha na tela.
    this.closeModal();
  }
}
