import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

export interface PrecoCotacao {
  dataCotacao: string;
  precoDesonerado: number;
  precoNaoDesonerado: number;
}

export interface Insumo {
  id: string;
  codigo: number;
  nome: string;
  unidadeMedida: string;
  tipo: string;
  precosCotacao: PrecoCotacao[];
}

@Injectable({ providedIn: 'root' })
export class InsumosService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  buscarPorId(id: string, banco: string, periodo: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/insumos/${id}`, {
      params: { banco, periodo }
    });
  }


  buscarPorNome(nome: string, tipo: string, periodo: string = ''): Observable<Insumo[]> {
    let params = periodo ? new HttpParams().set('periodo', periodo) : undefined;
    return this.http.get<Insumo[]>(`${this.baseUrl}/insumos/buscar-por-nome/${nome}/${tipo}`, { params });
  }

  salvarInsumo(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/insumos/salvar`, data);
  }

  buscarPorCodigo(codigo: string, tipo: string, periodo: string): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(`${this.baseUrl}/insumos/buscar-por-codigo/${codigo}/${tipo}`, {
      params: { periodo }
    });
  }


  buscarTodos(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(`${this.baseUrl}/insumos/todos`);
  }

  pesquisar(query: string, tipo: string = '', searchBy: string = '', periodo: string = ''): Observable<Insumo[]> {
    let params = new HttpParams().set('query', query);
    if (tipo) params = params.set('tipo', tipo);
    if (searchBy) params = params.set('searchBy', searchBy);
    if (periodo) params = params.set('periodo', periodo);
    return this.http.get<Insumo[]>(`${this.baseUrl}/insumos`, { params });
  }
}
