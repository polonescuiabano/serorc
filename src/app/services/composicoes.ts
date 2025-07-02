import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';


export interface Composicao {
  id: number;
  codigo: string;
  nome: string;
  unidadeMedida: string;
  precoDesonerado: number;
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

  getDetalhesComposicao(codigo: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/composicoes/detalhes/${codigo}`);
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
