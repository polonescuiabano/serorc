import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ItemOrcamento } from './detalhesorcamento';
import { environment } from '../../environments/environment';

export interface Evento {
  _id: string;
  numero: string;
  nome: string;
  itemOrcamentoId?: string;
}

export interface FrenteDeObra {
  _id: string;
  nome: string;
  itemOrcamentoId?: string;
  valor?: number;
  quantidade?: number;
}

@Injectable({
  providedIn: 'root'
})
export class Eventograma {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ============================
  // GET
  // ============================

  getEventos(orcamentoId: string): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.baseUrl}/orcamentos/${orcamentoId}/eventos`);
  }

  getFrentes(orcamentoId: string): Observable<FrenteDeObra[]> {
    return this.http.get<FrenteDeObra[]>(`${this.baseUrl}/orcamentos/${orcamentoId}/frentes-de-obra`);
  }

  getItens(orcamentoId: string): Observable<ItemOrcamento[]> {
    return this.http.get<ItemOrcamento[]>(`${this.baseUrl}/orcamentos/${orcamentoId}/itens`);
  }

  // ============================
  // POST
  // ============================

  adicionarEvento(orcamentoId: string, evento: { _id: string; nome: string; numero?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/orcamentos/${orcamentoId}/eventos`, evento);
  }

  adicionarFrente(orcamentoId: string, frente: { _id: string; nome: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/orcamentos/${orcamentoId}/frentes-de-obra`, frente);
  }

  atualizarEventoDoItem(orcamentoId: string, itemId: string, evento: { _id: string }): Observable<any> {
    if (!evento._id) {
      return throwError(() => new Error('ID do evento é obrigatório'));
    }
    return this.http.post(`${this.baseUrl}/orcamentos/${orcamentoId}/itens/${itemId}/evento`, evento).pipe(
      catchError(this.handleHttpError)
    );
  }

  adicionarFrenteAoItem(orcamentoId: string, itemId: string, data: { frenteDeObraId: string; quantidade: number }): Observable<any> {
    if (!data.frenteDeObraId) {
      return throwError(() => new Error('ID da frente de obra é obrigatório'));
    }
    return this.http.post(`${this.baseUrl}/orcamentos/${orcamentoId}/itens/${itemId}/adicionarFrente`, data).pipe(
      catchError(this.handleHttpError)
    );
  }

  // ============================
  // PUT
  // ============================

  editarEvento(orcamentoId: string, eventoId: string, evento: { _id?: string; nome: string; numero?: string }): Observable<any> {
    console.log('Evento enviado para edição:', evento);
    return this.http.put(`${this.baseUrl}/orcamentos/${orcamentoId}/eventos/${eventoId}`, evento);
  }

  editarFrente(orcamentoId: string, frenteId: string, frente: { id?: string; nome: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/orcamentos/${orcamentoId}/frentes-de-obra/${frenteId}`, frente);
  }

  // ============================
  // DELETE
  // ============================

  excluirEvento(orcamentoId: string, eventoId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/orcamentos/${orcamentoId}/eventos/${eventoId}`);
  }

  excluirFrente(orcamentoId: string, frenteId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/orcamentos/${orcamentoId}/frentes-de-obra/${frenteId}`);
  }

  removerEventoDoItem(orcamentoId: string, itemId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/orcamentos/${orcamentoId}/itens/${itemId}/evento`);
  }

  removerFrenteDoItem(orcamentoId: string, itemId: string, frenteId: string): Observable<any> {
    if (!frenteId) {
      return throwError(() => new Error('ID da frente de obra é obrigatório'));
    }
    return this.http.delete(`${this.baseUrl}/orcamentos/${orcamentoId}/itens/${itemId}/frente/${frenteId}`).pipe(
      catchError(this.handleHttpError)
    );
  }

  // ============================
  // ERRO PADRÃO
  // ============================
  private handleHttpError(error: HttpErrorResponse): Observable<any> {
    if (error.status === 200 && typeof error.error === 'string') {
      return of({ message: error.error });
    }

    console.error('Erro HTTP:', error);
    return throwError(() => error);
  }

}
