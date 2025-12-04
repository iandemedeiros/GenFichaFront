import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

  /**
   * Busca magias associadas a um sistema específico.
   * @param idSistema O ID do sistema para filtrar as magias.
   * @returns Um Observable com um array de Magias.
   */
  getMagiasBySistema(idSistema: number): Observable<Magia[]> {
    // Este endpoint precisa existir no seu backend! Ex: http://localhost:3001/api/sistemas/1/magias
    const url = `http://localhost:3001/api/sistemas/${idSistema}/magias`;
    return this.http.get<Magia[]>(url).pipe(
      catchError(() => of([])) // Retorna array vazio em caso de erro.
    );
  }

  // GET /api/magias/:id
  getMagia(id: string | number): Observable<Magia> {
    return this.http.get<Magia>(`${this.apiUrl}/${id}`);
  }

  // POST /api/magias
  createMagia(magia: Partial<Magia>): Observable<Magia> {
    return this.http.post<Magia>(this.apiUrl, magia).pipe(
      catchError(error => {
        console.error('A chamada HTTP para criar a magia falhou:', error);
        return throwError(() => new Error('Falha ao criar a magia.'));
      })
    );
  }

  // PUT /api/magias/:id
  updateMagia(id: string | number, magia: Partial<Magia>): Observable<Magia> {
    return this.http.put<Magia>(`${this.apiUrl}/${id}`, magia).pipe(
      catchError(error => {
        console.error(`Erro ao atualizar magia com id ${id}:`, error);
        return throwError(() => new Error('Falha ao atualizar a magia.'));
      })
    );
  }

  // DELETE /api/magias/:id
  deleteMagia(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erro ao deletar magia com id ${id}:`, error);
        if (error.status === 500) {
          return throwError(() => new Error('Não foi possível excluir a magia. Verifique se ela não está associada a nenhum sistema.'));
        }
        return throwError(() => error);
      })
    );
  }
}
