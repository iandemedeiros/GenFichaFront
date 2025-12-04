import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'http://localhost:3001/api/itens'; // URL base da sua API de itens

  constructor(private http: HttpClient) { }

  // GET /api/itens
  getItens(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl).pipe(
      catchError(() => of([])) // Em caso de erro, retorna um array vazio para não quebrar a UI
    );
  }

  // GET /api/itens/:id
  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erro ao buscar item com id ${id}:`, error);
        // Lança um erro que pode ser capturado pelo componente, sem quebrar o fluxo de navegação.
        return throwError(() => new Error('Não foi possível carregar os dados do item.'));
      })
    );
  }

  // POST /api/itens
  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item).pipe(
      catchError(error => {
        console.error('A chamada HTTP para criar o item falhou:', error);
        throw error; // Relança o erro para que o componente possa tratá-lo
      })
    );
  }

  // PUT /api/itens/:id
  updateItem(id: number, item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, item);
  }

  // DELETE /api/itens/:id
  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erro ao deletar item com id ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}
