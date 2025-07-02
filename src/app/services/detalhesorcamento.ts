import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

export interface ItemOrcamento {
  id: string;
  nivel: number;
  codigo: string;
  base: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  valorComBdi?: number;
  total?: number;
  tipo?: string;
}

export interface OrcamentoDetalhes {
  id: string;
  nome: string;
  bdi: number;
  itens: ItemOrcamento[];
  bancos?: { nome: string; periodo: string }[];
}


@Injectable({
  providedIn: 'root'
})
export class DetalhesorcamentoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOrcamento(id: string): Observable<OrcamentoDetalhes> {
    return this.http.get<OrcamentoDetalhes>(`${this.apiUrl}/orcamentos/${id}`);
  }

  adicionarItem(orcamentoId: string, item: Partial<ItemOrcamento>): Observable<OrcamentoDetalhes> {
    return this.http.post<OrcamentoDetalhes>(`${this.apiUrl}/orcamentos/${orcamentoId}/itens`, item);
  }

  editarItem(orcamentoId: string, itemId: string, item: Partial<ItemOrcamento>): Observable<OrcamentoDetalhes> {
    return this.http.put<OrcamentoDetalhes>(`${this.apiUrl}/orcamentos/${orcamentoId}/itens/${itemId}`, item);
  }

  excluirItem(orcamentoId: string, itemId: string): Observable<OrcamentoDetalhes> {
    return this.http.delete<OrcamentoDetalhes>(`${this.apiUrl}/orcamentos/${orcamentoId}/itens/${itemId}`);
  }
}
