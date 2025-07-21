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

  carregarDetalhes() {
    this.svc.getDetalhesComposicao(this.id).subscribe(data => {
      this.composicao = data;
      this.composicao.dataCotacao = data.precosCotacao?.[0]?.dataCotacao;
      this.insumos = data.insumos || [];
      this.composicoesAuxiliares = data.composicoesAuxiliares || [];
      this.isProprio = data.tipo === 'PROPRIO';
      this.calcularTotal();
    });
  }

  calcularTotal() {
    const somaInsumos = this.insumos.reduce((s, i) => s + i.coeficiente * i.precoDesonerado, 0);
    const somaAux = this.composicoesAuxiliares.reduce((s, c) => s + c.coeficiente * c.precoDesonerado, 0);
    this.totalComposicao = somaInsumos + somaAux + (this.composicao.coeficientePrincipal || 0);
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
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}-${yyyy}`;
  }
}
