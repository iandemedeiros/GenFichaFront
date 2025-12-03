import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError as rxjsThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Sistema } from '../models/sistema.model';

@Injectable({
  providedIn: 'root'
})
export class RpgSystemService {
  private http = inject(HttpClient);
  // A URL relativa 'api/sistemas' faz com que o servidor de desenvolvimento do Angular
  // retorne a página principal (index.html) em vez de dados JSON.
  // É necessário apontar para o endereço completo do seu servidor de backend.
  // Exemplo: 'http://localhost:3000/api/sistemas' se seu backend estiver rodando na porta 3000.
  private apiUrl = 'http://localhost:3001/api/sistemas';

  getSistemas(): Observable<Sistema[]> {
    return this.http.get<Sistema[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erro ao buscar sistemas no serviço:', error);
        return of([]); // Retorna um array vazio em caso de erro
      })
    );
  }

  getSistemaById(id: number): Observable<Sistema> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Sistema>(url).pipe(
      catchError(error => {
        console.error(`Erro ao buscar sistema com ID ${id}:`, error);
        return rxjsThrowError(() => new Error('Não foi possível carregar o sistema.'));
      })
    );
  }
}
