import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Ficha } from '../models/ficha.model';

// Definindo um tipo para o payload de criação para maior clareza
export interface CreateFichaPayload {
  idSistema: number;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class FichaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/fichas'; // URL base para a API de fichas

  createFicha(payload: CreateFichaPayload): Observable<Ficha> {
    return this.http.post<Ficha>(this.apiUrl, payload).pipe(
      catchError(error => {
        console.error('Erro ao criar a ficha:', error);
        return throwError(() => new Error('Não foi possível criar a ficha.'));
      })
    );
  }

  getFichaById(id: string): Observable<Ficha> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Ficha>(url).pipe(
      catchError(error => {
        console.error(`Erro ao buscar a ficha com ID ${id}:`, error);
        return throwError(() => new Error('Não foi possível carregar os detalhes da ficha.'));
      })
    );
  }
}