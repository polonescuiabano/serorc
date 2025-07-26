import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import {AuthService} from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class OrcamentosService {

  constructor(private http: HttpClient, private auth: AuthService) {}

  private apiUrl = environment.apiUrl;
  private apiTestUrl = environment.apiTestUrl;

  criarNovaPasta(nome: string, pastaPaiId?: string): Observable<any> {
    const usuarioId = this.auth.getUsuarioId();
    const empresa = this.auth.getEmpresa();

    if (!usuarioId || !empresa) {
      throw new Error('Usuário ou empresa não encontrado.');
    }

    const params = new HttpParams()
      .set('usuarioId', usuarioId)
      .set('company', empresa);

    const payload: any = { nome, empresa };

    if (pastaPaiId) {
      payload.pastaPaiId = pastaPaiId;
    } else {
      console.warn('⚠️ pastaPaiId está undefined');
    }

    console.log('📦 Payload enviado:', payload);

    return this.http.post(`${this.apiUrl}/pastas/criar`, payload, {
      params,
      observe: 'response'
    }).pipe(
      tap(res => console.log('🧾 Resposta completa:', res))
    );
  }


  criarOrcamento(dados: {
    nome: string,
    bdi: number,
    encargosSociais: string,
    bancos: { tipo: string, periodo: string }[],
    itens?: any[],
    pastaId: string
  }): Observable<any> {
    const empresa = this.auth.getEmpresa();
    if (!empresa) throw new Error('Empresa não encontrada.');

    const payload = {
      nome: dados.nome,
      bdi: dados.bdi,
      encargosSociais: dados.encargosSociais,
      bancos: dados.bancos,
      empresa,
      itens: dados.itens ?? [],
      pastaId: dados.pastaId,
    };

    return this.http.post(`${this.apiUrl}/orcamentos`, payload);
  }


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
    return this.http.delete(`${this.apiUrl}/orcamentos?id=${orcamentoId}`);
  }


  deletarPasta(pastaId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pastas/${pastaId}`);
  }
}
