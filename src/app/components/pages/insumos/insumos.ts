import { Component } from '@angular/core';
import {TopbarListacomp} from '../../topbar-listacomp/topbar-listacomp';
import {Sidebar} from '../../sidebar/sidebar';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InsumosService} from '../../../services/insumos';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-insumos',
    imports: [
        TopbarListacomp,
        Sidebar,
        ReactiveFormsModule,
        FormsModule,
        CommonModule
    ],
  templateUrl: './insumos.html',
  styleUrl: './insumos.css'
})
export class Insumos {
  query = '';
  searchBy = 'codigo';
  tipo = 'SINAPI';
  periodo = '';
  resultados: any[] = [];

  constructor(private insumosService: InsumosService) {}

  buscar() {
    if (!this.query) {
      this.resultados = [];
      return;
    }

    const periodoFormatado = this.periodo
      ? this.periodo.split('-').reverse().join('/')
      : '';

    if (this.searchBy === 'codigo') {
      this.insumosService.buscarPorCodigo(this.query, this.tipo, periodoFormatado).subscribe(data => {
        this.processarResultado(data);
      }, err => {
        this.resultados = [];
      });
    } else if (this.searchBy === 'descricao') {
      this.insumosService.buscarPorNome(this.query, this.tipo, periodoFormatado).subscribe(data => {
        this.processarResultado(data);
      }, err => {
        this.resultados = [];
      });
    }
  }

  private processarResultado(data: any[]) {
    const resultadoFinal: any[] = [];

    const periodoSelecionado = this.periodo
      ? this.periodo.split('-').join('-')
      : '';

    data.forEach(insumo => {
      if (!insumo.precosCotacao || insumo.precosCotacao.length === 0) return;

      const precosFiltrados = periodoSelecionado
        ? insumo.precosCotacao.filter((cotacao: any) =>
          cotacao.dataCotacao.startsWith(periodoSelecionado)
        )
        : insumo.precosCotacao;

      precosFiltrados.forEach((cotacao: any) => {
        resultadoFinal.push({
          base: this.tipo,
          data: this.formatarData(cotacao.dataCotacao),
          codigo: insumo.codigo,
          descricao: insumo.nome,
          tipo: insumo.tipo,
          unidade: insumo.unidadeMedida,
          valorOnerado: cotacao.precoNaoDesonerado,
          valorDesonerado: cotacao.precoDesonerado
        });
      });
    });

    this.resultados = resultadoFinal;
  }

  formatarData(data: any): string {
    let dt: Date;

    if (!data) return '';

    if (data instanceof Date) {
      dt = data;
    } else if (typeof data === 'string') {
      dt = new Date(data);
    } else if (data.$date) {
      dt = new Date(data.$date);
    } else {
      dt = new Date(String(data));
    }

    if (isNaN(dt.getTime())) return 'Data Inválida';

    const ano = dt.getUTCFullYear();
    const mes = (dt.getUTCMonth() + 1).toString().padStart(2, '0');

    return `${ano}/${mes}`;
  }
}
