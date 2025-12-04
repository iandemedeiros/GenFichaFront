import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { Sistema } from '../models/sistema.model';

@Injectable({
  providedIn: 'root'
})
export class SistemaService {
  private apiUrl = 'http://localhost:3001/api/sistemas'; // Ajuste a URL base da sua API

  constructor(private http: HttpClient) { }

  // GET /api/sistemas
  getSistemas(): Observable<Sistema[]> {
    return this.http.get<Sistema[]>(this.apiUrl).pipe(
      catchError(() => of([])) // Em caso de erro, retorna um array vazio para não quebrar a UI
    );
  }

  getSistemaById(id: number): Observable<Sistema> {
    return this.http.get<Sistema>(`${this.apiUrl}/${id}`);
  }
  
  // POST /api/sistemas/:idSistema/magias
  associarMagia(idSistema: number, idMagia: number): Observable<any> {
    const url = `${this.apiUrl}/${idSistema}/magias`;
    return this.http.post(url, { idMagia });
  }

  // DELETE /api/sistemas/:idSistema/magias/:idMagia
  desassociarMagia(idSistema: number, idMagia: number): Observable<void> {
    const url = `${this.apiUrl}/${idSistema}/magias/${idMagia}`;
    return this.http.delete<void>(url);
  }

  // POST /api/sistemas/:idSistema/habilidades
  associarHabilidade(idSistema: number, idHabilidade: number): Observable<any> {
    const url = `${this.apiUrl}/${idSistema}/habilidades`;
    return this.http.post(url, { idHabilidade });
  }

  // DELETE /api/sistemas/:idSistema/habilidades/:idHabilidade
  desassociarHabilidade(idSistema: number, idHabilidade: number): Observable<void> {
    const url = `${this.apiUrl}/${idSistema}/habilidades/${idHabilidade}`;
    return this.http.delete<void>(url);
  }

  // POST /api/sistemas/:idSistema/itens
  associarItem(idSistema: number, idItem: number): Observable<any> {
    const url = `${this.apiUrl}/${idSistema}/itens`;
    return this.http.post(url, { idItem });
  }

  // DELETE /api/sistemas/:idSistema/itens/:idItem
  desassociarItem(idSistema: number, idItem: number): Observable<void> {
    const url = `${this.apiUrl}/${idSistema}/itens/${idItem}`;
    return this.http.delete<void>(url);
  }
}