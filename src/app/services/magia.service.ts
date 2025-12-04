import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Magia } from '../models/magia.model';

@Injectable({
  providedIn: 'root'
})
export class MagiaService {
  private apiUrl = 'http://localhost:3001/api/magias'; // Ajuste a URL base da sua API

  constructor(private http: HttpClient) { }

  // GET /api/magias
  getMagias(): Observable<Magia[]> {
    return this.http.get<Magia[]>(this.apiUrl).pipe(
      catchError(() => of([])) // Em caso de erro, retorna um array vazio para não quebrar a UI
    );
  }

  // GET /api/magias/:id
  getMagia(id: string | number): Observable<Magia> {
    return this.http.get<Magia>(`${this.apiUrl}/${id}`);
  }

  // POST /api/magias
  createMagia(magia: any): Observable<Magia> {
    return this.http.post<Magia>(this.apiUrl, magia).pipe(
      catchError(error => {
        console.error('A chamada HTTP para criar a magia falhou:', error);
        throw error; // Relança o erro para que o componente possa tratá-lo
      })
    );
  }

  // PUT /api/magias/:id
  updateMagia(id: string | number, magia: any): Observable<Magia> {
    return this.http.put<Magia>(`${this.apiUrl}/${id}`, magia);
  }

  // DELETE /api/magias/:id
  deleteMagia(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erro ao deletar magia com id ${id}:`, error);
        // Se o erro for um 500, é provável que seja uma falha de constraint no DB.
        // Lançamos um novo erro com uma mensagem mais amigável.
        if (error.status === 500) {
          return throwError(() => new Error('Não foi possível excluir a magia. Verifique se ela não está associada a nenhum sistema.'));
        }
        // Para outros erros, relançamos o erro original.
        return throwError(() => error);
      })
    );
  }
}
