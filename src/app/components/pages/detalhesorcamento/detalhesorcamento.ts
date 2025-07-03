import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DetalhesorcamentoService, ItemOrcamento, OrcamentoDetalhes} from '../../../services/detalhesorcamento';
import {ActivatedRoute} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Composicao, ComposicoesService} from '../../../services/composicoes';
import {Insumo, InsumosService} from '../../../services/insumos';
import { HttpErrorResponse } from '@angular/common/http';
import {TopbarDetalhesorcamento} from '../../topbar-detalhesorcamento/topbar-detalhesorcamento';
import {Observable} from 'rxjs';


@Component({
  selector: 'app-detalhesorcamento',
  imports: [CommonModule, FormsModule, TopbarDetalhesorcamento],
  templateUrl: './detalhesorcamento.html',
  styleUrl: './detalhesorcamento.css'
})
export class Detalhesorcamento implements OnInit{
  orcamento!: OrcamentoDetalhes;
  novaEtapa?: Partial<ItemOrcamento>;
  selectedItem?: ItemOrcamento;


  editandoItem: any;



  constructor(
    private route: ActivatedRoute,
    private svc: DetalhesorcamentoService,
    private compSvc: ComposicoesService,
    private insSvc: InsumosService,
  ) {}
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }


  onSelectItem(item: ItemOrcamento) {
    this.selectedItem = this.selectedItem === item ? undefined : item;
  }


  private formatarPeriodo(periodo: string): string {
    const meses: { [key: string]: string } = {
      Janeiro: '01', Fevereiro: '02', Março: '03', Abril: '04',
      Maio: '05', Junho: '06', Julho: '07', Agosto: '08',
      Setembro: '09', Outubro: '10', Novembro: '11', Dezembro: '12'
    };

    const [mes, ano] = periodo.split('-');
    const mesNumerico = meses[mes.trim()] ?? mes;
    return `${mesNumerico}/${ano}`;
  }

  private getTipoBanco(): string {
    const banco = this.orcamento?.bancos?.[0];
    if (!banco) return '';
    const nome = banco.nome.trim();
    const periodoFormatado = this.formatarPeriodo(banco.periodo.trim());
    return `${nome} ${periodoFormatado}`;
  }

  iniciarAdicionarEtapa() {
    // Pega os níveis que são somente raiz (sem ponto)
    const niveisRaiz = this.orcamento.itens
      .map(i => i.nivel.toString())
      .filter(n => !n.includes('.'))
      .map(n => parseInt(n, 10));

    // Define o próximo nível raiz
    const proximoNivel = Math.max(0, ...niveisRaiz) + 1;
    const nivel = proximoNivel.toString();

    this.novaEtapa = {
      nivel: proximoNivel,
      descricao: '',
      quantidade: 1,
      tipo: 'etapa',
    };
  }


  iniciarAdicionar(tipo: | 'subetapa' | 'composicao' | 'insumo', parent?: ItemOrcamento) {
    let nivel: string;

    if (parent) {
      const partes = parent.nivel.toString().split('.').map(n => parseInt(n, 10));

      if (tipo === 'subetapa') {
        partes.push(1);
        nivel = partes.join('.');
      } else {
        const parentPrefix = parent.nivel.toString().split('.').slice(0, -1).join('.');
        const parentUltimoNivel = parseInt(parent.nivel.toString().split('.').slice(-1)[0], 10);

        const irmãosMesmoNivel = this.orcamento.itens.filter(i => {
          const nivelStr = i.nivel.toString();
          const prefix = nivelStr.split('.').slice(0, -1).join('.');
          return prefix === parentPrefix;
        });

        const maioresNumeros = irmãosMesmoNivel.map(i => parseInt(i.nivel.toString().split('.').slice(-1)[0], 10));
        const proximo = Math.max(...maioresNumeros, parentUltimoNivel) + 1;

        nivel = parentPrefix ? `${parentPrefix}.${proximo}` : `${proximo}`;
      }
    } else {
      const niveisRaiz = this.orcamento.itens
        .map(i => i.nivel.toString())
        .filter(n => !n.includes('.'))
        .map(n => parseInt(n, 10));
      const max = Math.max(0, ...niveisRaiz);
      nivel = (max + 1).toString();
    }

    this.editandoItem = {
      tipo,
      parent,
      item: {
        nivel,
        tipo,
        quantidade: 1,
        base: this.getTipoBanco()
      },
      resultados: [],
      buscaCodigo: '',
      buscaDescricao: ''
    };
  }

  onBuscarRealTime() {
    const codigo = this.editandoItem.buscaCodigo?.trim();
    const descricao = this.editandoItem.buscaDescricao?.trim();
    const banco = this.orcamento?.bancos?.[0];
    if (!banco) return;

    const nomeBanco = banco.nome;
    const periodo = banco.periodo;


    let comp$: Observable<Insumo[] | Composicao[]>;

    if (this.editandoItem.tipo === 'composicao') {
      comp$ = codigo
        ? this.compSvc.buscarPorCodigo(codigo, nomeBanco, this.formatarPeriodo(periodo))
        : this.compSvc.buscarPorNome(descricao ?? '', nomeBanco,  this.formatarPeriodo(periodo));
    } else {
      comp$ = codigo
        ? this.insSvc.buscarPorCodigo(codigo, nomeBanco,  this.formatarPeriodo(periodo))
        : this.insSvc.buscarPorNome(descricao ?? '', nomeBanco,  this.formatarPeriodo(periodo));
    }

    comp$.subscribe({
      next: (res: any) => {
        this.editandoItem.resultados = res;
      },
      error: (err: any) => {
        console.error('Erro ao buscar item:', err);
        this.editandoItem.resultados = [];
      }
    });
  }

  selecionar(res: Composicao | Insumo) {
    if (!this.editandoItem) return;

    const usarDesonerado = this.editandoItem.item.usarPrecoDesonerado ?? true;

    Object.assign(this.editandoItem.item, {
      codigo: res.codigo,
      descricao: this.editandoItem.tipo === 'composicao' ? (res as any).descricao : res.nome,
      unidade: res.unidadeMedida,
      precoUnitario: usarDesonerado
        ? (res as any).precoDesonerado
        : (res as any).precoNaoDesonerado
    });

    this.editandoItem.resultados = [];
    this.editandoItem.buscaCodigo = '';
    this.editandoItem.buscaDescricao = '';
  }

  iniciarNovaSubetapa(parent: ItemOrcamento) {
    const parentNivel = parent.nivel.toString();

    const filhosDiretos = this.orcamento.itens.filter(i => {
      const nivelStr = i.nivel.toString();
      return nivelStr.startsWith(parentNivel + '.') &&
        nivelStr.split('.').length === parentNivel.split('.').length + 1;
    });

    const ultimosNumeros = filhosDiretos.map(i => {
      const partes = i.nivel.toString().split('.');
      return parseInt(partes[partes.length -1], 10);
    });

    const maxUltimoNumero = ultimosNumeros.length > 0 ? Math.max(...ultimosNumeros) : 0;

    const novoNivel = parentNivel + '.' + (maxUltimoNumero + 1);

    this.novaEtapa = {
      nivel: novoNivel as any,
      descricao: '',
      quantidade: 1,
      tipo: 'subetapa',
    };
  }

  confirmarEdicao() {
    if (!this.editandoItem) return;
    const payload = this.editandoItem.item as any;
    this.svc.adicionarItem(this.orcamento.id, payload)
      .subscribe(o => this.orcamento = this.calculate(o));
    this.editandoItem = undefined;
  }

  cancelarEdicao() {
    this.editandoItem = undefined;
  }

  excluir(itemId: string) {
    this.svc.excluirItem(this.orcamento.id, itemId)
      .subscribe(o => this.orcamento = this.calculate(o));
  }

  load(id: string) {
    this.svc.getOrcamento(id)
      .subscribe(o => {
        console.log('Orçamento recebido do backend:', o);
        this.orcamento = this.calculate(o);
      });
  }

  iniciarNovaEtapa() {
    const nivelMax = this.orcamento.itens.reduce((max, item) => Math.max(max, item.nivel), 0);
    this.novaEtapa = {
      nivel: nivelMax + 1,
      descricao: '',
      unidade: '',
      quantidade: 1,
    };
  }

  private calculate(o: OrcamentoDetalhes): OrcamentoDetalhes {
    const bdiPercent = o.bdi ?? 0;

    o.itens = o.itens.map(i => {
      const preco = i.precoUnitario ?? 0;
      const quantidade = i.quantidade ?? 0;

      const valorComBdi = preco + (preco * bdiPercent / 100);
      const total = valorComBdi * quantidade;

      return {
        ...i,
        valorComBdi,
        total
      };
    });

    const itensOrdenados = [...o.itens].sort((a, b) => {
      return b.nivel.toString().split('.').length - a.nivel.toString().split('.').length;
    });

    for (let item of itensOrdenados) {
      const itemNivel = item.nivel.toString();

      const parentPath = itemNivel.split('.').slice(0, -1).join('.');
      if (!parentPath) continue;

      const parentItem = o.itens.find(i => i.nivel.toString() === parentPath);
      if (parentItem) {
        parentItem.total = (parentItem.total ?? 0) + (item.total ?? 0);
      }
    }

    o.itens = o.itens.sort((a, b) => {
      const aNivel = a.nivel.toString().split('.').map(Number);
      const bNivel = b.nivel.toString().split('.').map(Number);

      for (let i = 0; i < Math.max(aNivel.length, bNivel.length); i++) {
        const aVal = aNivel[i] ?? 0;
        const bVal = bNivel[i] ?? 0;
        if (aVal !== bVal) return aVal - bVal;
      }
      return 0;
    });

    return o;
  }


  confirmarNovaEtapa() {
    if (!this.novaEtapa) return;

    const payload: any = {
      nivel: this.novaEtapa.nivel,
      descricao: this.novaEtapa.descricao,
      quantidade: this.novaEtapa.quantidade,
      tipo: 'etapa'
    };
    console.log(payload);
    this.svc.adicionarItem(this.orcamento.id, payload)
      .subscribe(o => {
        this.orcamento = o;
        this.novaEtapa = undefined;
      });
  }

  cancelarNovaEtapa() {
    this.novaEtapa = undefined;
  }
}
