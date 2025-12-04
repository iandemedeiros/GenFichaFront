import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Habilidade } from '../models/habilidade.model';

@Injectable({
  providedIn: 'root'
})
export class HabilidadeService {

  private apiUrl = 'http://localhost:3001/api/habilidades'; // URL base da sua API de habilidades

  constructor(private http: HttpClient) { }

  // GET /api/habilidades
  getHabilidades(): Observable<Habilidade[]> {
    return this.http.get<Habilidade[]>(this.apiUrl).pipe(
      catchError(() => of([])) // Em caso de erro, retorna um array vazio para não quebrar a UI
    );
  }

  // GET /api/habilidades/:id
  getHabilidade(id: number): Observable<Habilidade> {
    return this.http.get<Habilidade>(`${this.apiUrl}/${id}`);
  }

  // POST /api/habilidades
  createHabilidade(habilidade: Habilidade): Observable<Habilidade> {
    return this.http.post<Habilidade>(this.apiUrl, habilidade).pipe(
      catchError(error => {
        console.error('A chamada HTTP para criar a habilidade falhou:', error);
        throw error; // Relança o erro para que o componente possa tratá-lo
      })
    );
  }

  // PUT /api/habilidades/:id
  updateHabilidade(id: number, habilidade: Habilidade): Observable<Habilidade> {
    return this.http.put<Habilidade>(`${this.apiUrl}/${id}`, habilidade);
  }

  // DELETE /api/habilidades/:id
  deleteHabilidade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erro ao deletar habilidade com id ${id}:`, error);
        if (error.status === 500) {
          return throwError(() => new Error('Não foi possível excluir a habilidade. Verifique se ela não está associada a nenhum sistema.'));
        }
        return throwError(() => error);
      })
    );
  }
}
