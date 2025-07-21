import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators';



export interface PrecoCotacao {
  preco_desonerado: number | null;
  preco_nao_desonerado: number | null;
  data_cotacao: string;
}


export interface ItemOrcamento {
  id: string;
  nivel: number;
  codigo: string;
  base: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  precoDesonerado?: number;
  precoNaoDesonerado?: number;
  precos_cotacao?: PrecoCotacao[];
  valorComBdi?: number;
  total?: number;
  tipo?: string;
  precoSemBDI?: number;
  eventoId?: string| null;
  frentesDeObra?: { frenteDeObraId: string; quantidade: number }[];
}

export interface OrcamentoDetalhes {
  id: string;
  nome: string;
  bdi: number;
  itens: ItemOrcamento[];
  encargosSociais: 'desonerado' | 'nao-desonerado';
  bancos?: { nome: string; periodo: string }[];
  totalSemBDI: number;
  totalComBDI: number;
  totalFinal: number;
}


@Injectable({
  providedIn: 'root'
})
export class DetalhesorcamentoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOrcamento(id: string): Observable<OrcamentoDetalhes> {
    return this.http.get<OrcamentoDetalhes>(`${this.apiUrl}/orcamentos/${id}`)
      .pipe(
        map(orcamento => {
          orcamento.itens = orcamento.itens.map(item => {
            // extrai do array precos_cotacao o preco_desonerado e preco_nao_desonerado
            const precoCotacao = item.precos_cotacao && item.precos_cotacao.length > 0 ? item.precos_cotacao[0] : null;

            return {
              ...item,
              precoDesonerado: precoCotacao?.preco_desonerado ?? item.precoDesonerado,
              precoNaoDesonerado: precoCotacao?.preco_nao_desonerado ?? item.precoNaoDesonerado,
            };
          });

          return orcamento;
        })
      );
  }

  adicionarItem(orcamentoId: string, item: Partial<ItemOrcamento>): Observable<OrcamentoDetalhes> {
    console.log('Enviando item:', item);
    return this.http.post<OrcamentoDetalhes>(`${this.apiUrl}/orcamentos/${orcamentoId}/itens`, item);
  }

  editarOrcamento(orcamentoId: string, dados: Partial<OrcamentoDetalhes>): Observable<OrcamentoDetalhes> {
    return this.http.put<OrcamentoDetalhes>(`${this.apiUrl}/orcamentos/${orcamentoId}`, dados);
  }

  editarItem(orcamentoId: string, itemId: string, item: Partial<ItemOrcamento>): Observable<OrcamentoDetalhes> {
    return this.http.put<OrcamentoDetalhes>(`${this.apiUrl}/orcamentos/${orcamentoId}/itens/${itemId}`, item);
  }

  excluirItem(orcamentoId: string, itemId: string): Observable<OrcamentoDetalhes> {
    return this.http.delete<OrcamentoDetalhes>(`${this.apiUrl}/orcamentos/${orcamentoId}/itens/${itemId}`);
  }
}
