import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class OrcamentosService {

  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl;


  listarPastas(usuarioId: string, empresa: string, pastaPaiId?: string): Observable<any[]> {
    let params = new HttpParams()
      .set('usuarioId', usuarioId)
      .set('company', empresa);

    if (pastaPaiId) {
      params = params.set('pastaPaiId', pastaPaiId);
    }

    return this.http.get<any[]>(`${this.apiUrl}/pastas/listar`, { params })
      .pipe(tap(res => console.log('📁 listarPastas resposta:', res)));
  }

  listarOrcamentosPorPasta(pastaId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orcamentos/por-pasta/${pastaId}`)
      .pipe(tap(res => console.log('📄 listarOrcamentosPorPasta resposta:', res)));
  }

  deletarOrcamento(orcamentoId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/orcamentos/${orcamentoId}`);
  }

  deletarPasta(pastaId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pastas/${pastaId}`);
  }
}
