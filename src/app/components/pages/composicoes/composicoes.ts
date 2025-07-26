import { Component } from '@angular/core';
import {TopbarListacomp} from '../../topbar-listacomp/topbar-listacomp';
import {Sidebar} from '../../sidebar/sidebar';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ComposicoesService} from '../../../services/composicoes';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-composicoes',
    imports: [
        TopbarListacomp,
        Sidebar,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
    ],
  templateUrl: './composicoes.html',
  styleUrl: './composicoes.css'
})
export class Composicoes {
  mesSelecionado = '01';
  anoSelecionado = '2025';
  query = '';
  searchBy = 'codigo';
  tipo = 'SINAPI';
  periodo = '';
  resultados: any[] = [];

  constructor(private composicoesService: ComposicoesService, private router: Router) {}

  buscar() {
    if (!this.query) {
      this.resultados = [];
      return;
    }

    const periodoFormatado = `${this.mesSelecionado}-${this.anoSelecionado}`;


    if (this.searchBy === 'codigo') {
      this.composicoesService.buscarPorCodigo(this.query, this.tipo, periodoFormatado).subscribe(data => {
        this.processarResultado(data);
      }, err => {
        this.resultados = [];
      });
    } else if (this.searchBy === 'descricao') {
      this.composicoesService.buscarPorNome(this.query, this.tipo, periodoFormatado).subscribe(data => {
        this.processarResultado(data);
      }, err => {
        this.resultados = [];
      });
    }
  }

  private processarResultado(data: any[]) {
    const resultadoFinal: any[] = [];

    const periodoSelecionado = this.periodo
      ? this.periodo.split('-').join('-') // yyyy-MM
      : '';

    data.forEach(composicao => {
      if (!composicao.precosCotacao || composicao.precosCotacao.length === 0) return;

      const precosFiltrados = periodoSelecionado
        ? composicao.precosCotacao.filter((cotacao: any) =>
          cotacao.dataCotacao.startsWith(periodoSelecionado)
        )
        : composicao.precosCotacao;

      precosFiltrados.forEach((cotacao: any) => {
        resultadoFinal.push({
          id: composicao.id,
          base: this.tipo,
          data: this.formatarData(cotacao.dataCotacao),
          codigo: composicao.codigo,
          descricao: composicao.descricao,
          tipo: composicao.tipo,
          unidade: composicao.unidadeMedida,
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

  abrirDetalhes(id: string) {
    console.log(id);
    this.router.navigate(['/detalhes-composicao', id]);
  }
}
