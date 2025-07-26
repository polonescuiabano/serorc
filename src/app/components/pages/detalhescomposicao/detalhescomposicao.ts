import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComposicoesService, Composicao } from '../../../services/composicoes';
import { InsumosService, Insumo } from '../../../services/insumos';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TopbarListacomp } from '../../topbar-listacomp/topbar-listacomp';
import { Sidebar } from '../../sidebar/sidebar';

@Component({
  selector: 'app-detalhescomposicao',
  standalone: true,
  imports: [CommonModule, FormsModule, TopbarListacomp, Sidebar],
  templateUrl: './detalhescomposicao.html',
  styleUrls: ['./detalhescomposicao.css']
})
export class Detalhescomposicao implements OnInit {
  id!: string;
  codigo!: string;
  composicao!: any;
  insumos: any[] = [];
  composicoesAuxiliares: any[] = [];
  isProprio = false;
  totalComposicao = 0;

  editando?: {
    tipo: 'insumo' | 'composicao';
    buscaCodigo: string;
    buscaDescricao: string;
    resultados: any[];
    item: {
      codigo: string;
      descricao: string;
      unidadeMedida: string;
      precoDesonerado: number;
      coeficiente: number;
      id?: string;
    };
  };

  constructor(
    private route: ActivatedRoute,
    private svc: ComposicoesService,
    private insSvc: InsumosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.carregarDetalhes();
  }

  private async carregarDetalhesInsumos() {
    const data = new Date(this.composicao?.dataCotacao);
    const banco = this.composicao?.banco || 'SINAPI';
    const periodo = this.formatPeriodo(data); // Deve retornar "MM/YYYY"

    const carregados = await Promise.all(
      this.insumos.map(async (i: any) => {
        try {
          const resultado = await this.insSvc.buscarPorId(i.insumoId, banco, periodo).toPromise();

          console.log("Resultado do insumo: ", resultado);

          const precoDesonerado = resultado.valorDesonerado ?? 0;
          const precoNaoDesonerado = resultado.valorOnerado ?? 0;
          const coeficiente = i.coeficiente ?? 0;

          return {
            ...i,
            codigo: resultado.codigo,
            descricao: resultado.nome,
            unidadeMedida: resultado.unidadeMedida,
            precoDesonerado,
            precoNaoDesonerado,
            totalDesonerado: precoDesonerado * coeficiente,
            totalNaoDesonerado: precoNaoDesonerado * coeficiente
          };
        } catch (e) {
          console.warn('Erro carregando insumo:', i.insumoId, e);
          return {
            ...i,
            precoDesonerado: 0,
            precoNaoDesonerado: 0,
            totalDesonerado: 0,
            totalNaoDesonerado: 0
          };
        }
      })
    );

    this.insumos = carregados;
  }


  private async carregarDetalhesComposicoesAuxiliares() {
    const data = new Date(this.composicao?.dataCotacao);
    const banco = this.composicao?.banco || 'SINAPI';
    const periodo = this.formatPeriodoComp(data);

    const carregados = await Promise.all(
      this.composicoesAuxiliares.map(async (c: any) => {
        try {
          const resultadoLista = await this.svc.buscarPorCodigo(c.codigo, banco, periodo).toPromise();
          const resultado = resultadoLista?.[0] as any;
          console.log("Resultado da composicao: ", resultado);
          if (!resultado) throw new Error(`Composição código ${c.codigo} não encontrada`);

          const coeficiente = c.coeficiente ?? 0;

          // Aqui extrai o preço para o período correto dentro de precosCotacao
          const precoPeriodo = resultado.precosCotacao?.find((p: any) => {
            const dataCot = new Date(p.dataCotacao);
            const mesAno = `${String(dataCot.getMonth() + 1).padStart(2, '0')}-${dataCot.getFullYear()}`;
            return mesAno === periodo;
          }) || {};

          const precoDesonerado = precoPeriodo.precoDesonerado ?? 0;
          const precoNaoDesonerado = precoPeriodo.precoNaoDesonerado ?? 0;

          return {
            ...c,
            codigo: resultado.codigo,
            descricao: resultado.nome,
            unidadeMedida: resultado.unidadeMedida,
            precoDesonerado,
            precoNaoDesonerado,
            totalDesonerado: precoDesonerado * coeficiente,
            totalNaoDesonerado: precoNaoDesonerado * coeficiente
          };
        } catch (e) {
          console.warn('Erro carregando composição auxiliar:', c.codigo, e);
          return {
            ...c,
            precoDesonerado: 0,
            precoNaoDesonerado: 0,
            totalDesonerado: 0,
            totalNaoDesonerado: 0
          };
        }
      })
    );

    this.composicoesAuxiliares = carregados;
  }



  carregarDetalhes() {
    this.svc.getDetalhesComposicao(this.id).subscribe(async data => {
      this.composicao = data;
      this.composicao.dataCotacao = data.precosCotacao?.[0]?.dataCotacao;
      this.insumos = data.insumos || [];
      this.composicoesAuxiliares = data.composicoesAuxiliares || [];
      this.isProprio = data.tipo === 'PROPRIO';

      await this.carregarDetalhesInsumos();
      await this.carregarDetalhesComposicoesAuxiliares();

      this.calcularTotal();
    });
  }


  calcularTotal() {
    const somaDesonerado = this.insumos.reduce((s, i) => s + (i.totalDesonerado || 0), 0)
      + this.composicoesAuxiliares.reduce((s, c) => s + (c.totalDesonerado || 0), 0);

    const somaNaoDesonerado = this.insumos.reduce((s, i) => s + (i.totalNaoDesonerado || 0), 0)
      + this.composicoesAuxiliares.reduce((s, c) => s + (c.totalNaoDesonerado || 0), 0);

    this.composicao.precoDesonerado = somaDesonerado;
    this.composicao.precoNaoDesonerado = somaNaoDesonerado;

    this.totalComposicao = somaDesonerado;
  }


  iniciarAdicionar(tipo: 'insumo' | 'composicao') {
    this.editando = {
      tipo,
      buscaCodigo: '',
      buscaDescricao: '',
      resultados: [],
      item: {
        codigo: '',
        descricao: '',
        unidadeMedida: '',
        precoDesonerado: 0,
        coeficiente: 0,
        id: ''
      }
    };
  }

  onBuscarRealTime() {
    if (!this.editando) return;

    const codigo = this.editando.buscaCodigo?.trim();
    const descricao = this.editando.buscaDescricao?.trim();
    const data = new Date(this.composicao?.dataCotacao);
    const banco = this.composicao?.banco || 'SINAPI';
    const periodo = this.formatPeriodo(data);

    let obs$: Observable<any[]>;

    if (this.editando.tipo === 'insumo') {
      obs$ = codigo
        ? this.insSvc.buscarPorCodigo(codigo, banco, periodo)
        : this.insSvc.buscarPorNome(descricao ?? '', banco, periodo);
    } else {
      obs$ = codigo
        ? this.svc.buscarPorCodigo(codigo, banco, periodo)
        : this.svc.buscarPorNome(descricao ?? '', banco, periodo);
    }

    obs$.subscribe({
      next: res => {
        this.editando!.resultados = res;
      },
      error: err => {
        console.error('Erro ao buscar:', err);
        this.editando!.resultados = [];
      }
    });
  }

  selecionar(r: any) {
    if (!this.editando) return;

    this.editando.item = {
      ...this.editando.item,
      codigo: r.codigo,
      descricao: r.nome || r.descricao,
      unidadeMedida: r.unidadeMedida,
      precoDesonerado: r.precoDesonerado,
      id: r.id
    };

    this.editando.resultados = [];
  }

  confirmarEdicao() {
    if (!this.editando) return;

    const { tipo, item } = this.editando;

    if (tipo === 'insumo') {
      const payload = {
        insumoId: item.id!,
        coeficiente: item.coeficiente
      };
      this.svc.adicionarInsumo(this.id, payload).subscribe(() => {
        this.editando = undefined;
        this.carregarDetalhes();
      });
    } else {
      const payload = {
        codigoAuxiliar: item.codigo,
        coeficiente: item.coeficiente
      };
      this.svc.adicionarComposicaoAuxiliar(this.id, payload).subscribe(() => {
        this.editando = undefined;
        this.carregarDetalhes();
      });
    }
  }


  cancelarEdicao() {
    this.editando = undefined;
  }

  private formatPeriodo(date: Date): string {
    const mm = String(date.getMonth() + 2).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${yyyy}`;
  }
  private formatPeriodoComp(date: Date): string {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}-${yyyy}`;
  }
}
