import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DetalhesorcamentoService, ItemOrcamento, OrcamentoDetalhes} from '../../../services/detalhesorcamento';
import {ActivatedRoute} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Composicao, ComposicoesService} from '../../../services/composicoes';
import {Insumo, InsumosService} from '../../../services/insumos';
import {TopbarDetalhesorcamento} from '../../topbar-detalhesorcamento/topbar-detalhesorcamento';
import {Observable} from 'rxjs';
import {Sidebar} from '../../sidebar/sidebar';
import {TopbarListacomp} from '../../topbar-listacomp/topbar-listacomp';


@Component({
  selector: 'app-detalhesorcamento',
  imports: [CommonModule, FormsModule, TopbarDetalhesorcamento, Sidebar, TopbarListacomp],
  templateUrl:'./detalhesorcamento.html',
  styleUrl: './detalhesorcamento.css'
})
export class Detalhesorcamento implements OnInit{
  orcamento!: OrcamentoDetalhes;
  novaEtapa?: Partial<ItemOrcamento>;
  selectedItem?: ItemOrcamento;
  totalSemBDI: number = 0;
  totalComBDI: number = 0;
  totalFinal: number = 0;


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


  get itensOrdenados() {
    if (!this.orcamento || !this.orcamento.itens) return [];

    return this.orcamento.itens.slice().sort((a, b) => {
      const nivelA = a.nivel.toString().split('.').map(Number);
      const nivelB = b.nivel.toString().split('.').map(Number);

      for (let i = 0; i < Math.max(nivelA.length, nivelB.length); i++) {
        const valA = nivelA[i] ?? 0;
        const valB = nivelB[i] ?? 0;
        if (valA !== valB) return valA - valB;
      }

      return 0;
    });
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


  iniciarAdicionar(tipo: 'subetapa' | 'composicao' | 'insumo', parent?: ItemOrcamento) {
    let nivel: string;

    if (parent) {
      this.selectedItem = parent;
      const parentNivel = parent.nivel.toString();
      const parentNivelParts = parentNivel.split('.');
      const parentDepth = parentNivelParts.length;

      if (tipo === 'subetapa') {
        // Sempre adiciona um novo nível abaixo do parent
        nivel = `${parentNivel}.1`;
      } else {
        // Adiciona como próximo filho direto (não subetapa) do parent
        const filhosDiretos = this.orcamento.itens.filter(i => {
          const nivelParts = i.nivel.toString().split('.');
          return nivelParts.length === parentDepth + 1 &&
            i.nivel.toString().startsWith(parentNivel + '.');
        });

        const ultimosNumeros = filhosDiretos.map(i => {
          const partes = i.nivel.toString().split('.');
          return parseInt(partes[partes.length - 1], 10);
        });

        const proximo = ultimosNumeros.length > 0 ? Math.max(...ultimosNumeros) + 1 : 1;
        nivel = `${parentNivel}.${proximo}`;
      }
    } else {
      // Adicionando etapa raiz (nível "1", "2", etc)
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

    const tipo = this.editandoItem.tipo;

    this.editandoItem.item = {
      ...this.editandoItem.item,
      codigo: res.codigo,
      descricao: tipo === 'composicao' ? (res as Composicao).nome : (res as Insumo).nome,
      unidade: res.unidadeMedida,
      precoDesonerado: (res as any).precoDesonerado,
      precoNaoDesonerado: (res as any).precoNaoDesonerado,
      quantidade: this.editandoItem.item.quantidade ?? 1,
      tipo: tipo,
      base: this.getTipoBanco()
    };

    // Limpar busca
    this.editandoItem.resultados = [];
    this.editandoItem.buscaCodigo = '';
    this.editandoItem.buscaDescricao = '';
  }


  isUltimoFilhoDireto(i: ItemOrcamento): boolean {
    if (!this.selectedItem) return false;

    const parentNivel = this.selectedItem.nivel.toString();
    const nivelAtual = i.nivel.toString();

    const isFilhoDireto = nivelAtual.startsWith(parentNivel + '.') &&
      nivelAtual.split('.').length === parentNivel.split('.').length + 1;

    if (isFilhoDireto) {
      const filhos = this.itensOrdenados.filter(it => {
        const n = it.nivel.toString();
        return n.startsWith(parentNivel + '.') &&
          n.split('.').length === parentNivel.split('.').length + 1;
      });

      return filhos[filhos.length - 1]?.nivel.toString() === i.nivel.toString();
    }

    // Caso o item seja o próprio pai e ele não tenha filhos
    const isSelectedItem = nivelAtual === parentNivel;

    const hasFilhos = this.itensOrdenados.some(el => {
      const n = el.nivel.toString();
      return n.startsWith(parentNivel + '.') &&
        n.split('.').length === parentNivel.split('.').length + 1;
    });

    return isSelectedItem && !hasFilhos;
  }

/**
  shouldMostrarLinhaEdicao(i: ItemOrcamento): boolean {
    if (!this.editandoItem || !this.selectedItem) return false;

    const selectedNivel = this.selectedItem.nivel.toString();
    const currentNivel = i.nivel.toString();

    const isFilhoDireto = currentNivel.startsWith(selectedNivel + '.') &&
      currentNivel.split('.').length === selectedNivel.split('.').length + 1;

    if (isFilhoDireto) {
      const filhosDiretos = this.itensOrdenados.filter(el => {
        const n = el.nivel.toString();
        return n.startsWith(selectedNivel + '.') &&
          n.split('.').length === selectedNivel.split('.').length + 1;
      });

      return filhosDiretos[filhosDiretos.length - 1]?.nivel.toString() === currentNivel;
    }

    // Se o item atual é o próprio item selecionado e ele não tem filhos
    const hasFilhos = this.itensOrdenados.some(el => {
      const n = el.nivel.toString();
      return n.startsWith(selectedNivel + '.') &&
        n.split('.').length === selectedNivel.split('.').length + 1;
    });

    return !hasFilhos && selectedNivel === currentNivel;
  }
*/




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


  recalcularEncargos(novoEncargo: 'desonerado' | 'nao-desonerado') {
    this.orcamento.encargosSociais = novoEncargo;
    this.orcamento = this.calculate(this.orcamento);
  }


  private calculate(o: OrcamentoDetalhes): OrcamentoDetalhes {
    const bdiPercent = o.bdi ?? 0;
    const usarDesonerado = o.encargosSociais === 'desonerado';

    // Atualiza os valores dos itens
    o.itens = o.itens.map(i => {
      console.log(`Item ${i.id} | precoDesonerado: ${i.precoDesonerado} | precoNaoDesonerado: ${i.precoNaoDesonerado} | precoUnitario original: ${i.precoUnitario}`);

      const precoUnitario = usarDesonerado
        ? i.precoDesonerado ?? i.precoUnitario ?? 0
        : i.precoNaoDesonerado ?? i.precoUnitario ?? 0;
      console.log(`Preco escolhido: ${precoUnitario}`);

      const quantidade = i.quantidade ?? 0;

      const valorComBdi = precoUnitario + (precoUnitario * bdiPercent / 100);
      const total = valorComBdi * quantidade;

      return {
        ...i,
        precoUnitario,
        valorComBdi,
        total
      };
    });

    // Ordenar do mais profundo ao mais superficial
    const itensOrdenados = [...o.itens].sort((a, b) => {
      return b.nivel.toString().split('.').length - a.nivel.toString().split('.').length;
    });

    // Propagar total dos filhos para os pais
    for (const item of itensOrdenados) {
      const nivelAtual = item.nivel.toString();
      const parentPath = nivelAtual.split('.').slice(0, -1).join('.');
      if (!parentPath) continue;

      const parent = o.itens.find(i => i.nivel.toString() === parentPath);
      if (parent) {
        parent.total = (parent.total ?? 0) + (item.total ?? 0);
      }
    }

    // Reordenar para exibição
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

    const etapas = o.itens.filter(i => i.tipo === 'etapa');
    const soltos = o.itens.filter(i =>
      !i.nivel.toString().includes('.') && i.tipo !== 'etapa'
    );



    const totalComBDI = [...etapas, ...soltos].reduce((acc, i) => acc + (i.total ?? 0), 0);
    const totalSemBDI = bdiPercent > 0 ? totalComBDI / (1 + bdiPercent / 100) : totalComBDI;

    this.totalSemBDI = totalSemBDI;
    this.totalComBDI = totalComBDI;
    this.totalFinal = totalComBDI;

    o.totalSemBDI = totalSemBDI;
    o.totalComBDI = totalComBDI;
    o.totalFinal = totalComBDI;

    return { ...o };
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
