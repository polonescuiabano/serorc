import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';


export interface Composicao {
  id: string;
  codigo: string;
  nome: string;
  unidadeMedida: string;
  precoDesonerado: number;
  precoNaoDesonerado: number;
  dataCotacao: string;
  empresa: string;
  tipo: string;
}

@Injectable({ providedIn: 'root' })
export class ComposicoesService {
  constructor(private http: HttpClient) {}

  private baseUrl = environment.apiUrl;

  buscarPorNome(nome: string, tipo: string, periodo: string): Observable<Composicao[]> {
    const nomeEncoded = encodeURIComponent(nome.trim());
    const tipoEncoded = encodeURIComponent(tipo.trim());
    const periodoEncoded = encodeURIComponent(periodo.trim());

    return this.http.get<Composicao[]>(
      `${this.baseUrl}/composicoes/buscar-por-nome/${nomeEncoded}/${tipoEncoded}?periodo=${periodoEncoded}`
    );
  }

  salvarComposicao(dto: Composicao): Observable<any> {
    return this.http.post(`${this.baseUrl}/composicoes/salvar`, dto);
  }

  adicionarInsumo(idComposicao: string, payload: { insumoId: string, coeficiente: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/composicoes/${idComposicao}/adicionar-insumo`, payload);
  }

  adicionarComposicaoAuxiliar(idComposicao: string, payload: { codigoAuxiliar: string, coeficiente: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/composicoes/${idComposicao}/adicionar-composicao`, payload);
  }

  getDetalhesComposicao(idComposicao: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/composicoes/detalhes/${idComposicao}`);
  }

  buscarPorCodigo(codigo: string, tipo: string, periodo?: string): Observable<Composicao[]> {
    const codigoEncoded = encodeURIComponent(codigo.trim());
    const tipoEncoded = encodeURIComponent(tipo.trim());

    let url = `${this.baseUrl}/composicoes/buscar-por-codigo/${codigoEncoded}/${tipoEncoded}`;

    if (periodo && periodo.trim() !== '') {
      const periodoEncoded = encodeURIComponent(periodo.trim());
      url += `?periodo=${periodoEncoded}`;
    }

    return this.http.get<Composicao[]>(url);
  }



  buscarTodos(): Observable<Composicao[]> {
    return this.http.get<Composicao[]>(`${this.baseUrl}/composicoes/todos`);
  }

  pesquisar(query: string, tipo: string = '', searchBy: string = '', periodo: string = ''): Observable<Composicao[]> {
    let params = new HttpParams().set('query', query);
    if (tipo) params = params.set('tipo', tipo);
    if (searchBy) params = params.set('searchBy', searchBy);
    if (periodo) params = params.set('periodo', periodo);
    return this.http.get<Composicao[]>(`${this.baseUrl}/composicoes`, { params });
  }
}
