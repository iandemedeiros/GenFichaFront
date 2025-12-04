import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Ficha } from '../models/ficha.model';
import { CreateFichaPayload, UpdateFichaPayload } from '../models/ficha.model';

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

  getFichas(): Observable<Ficha[]> {
    return this.http.get<Ficha[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erro ao buscar as fichas do usuário:', error);
        // Retorna um array vazio em caso de erro para não quebrar a UI
        return of([]);
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

  updateFicha(id: number, payload: UpdateFichaPayload): Observable<Ficha> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Ficha>(url, payload).pipe(
      catchError(error => {
        console.error(`Erro ao atualizar a ficha com ID ${id}:`, error);
        return throwError(() => new Error('Não foi possível salvar as alterações da ficha.'));
      })
    );
  }

  deleteFicha(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error(`Erro ao deletar a ficha com ID ${id}:`, error);
        return throwError(() => new Error('Não foi possível deletar a ficha.'));
      })
    );
  }
}

