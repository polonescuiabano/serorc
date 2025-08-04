import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Detalhesorcamento} from '../pages/detalhesorcamento/detalhesorcamento';
import {DetalhesorcamentoService, OrcamentoDetalhes} from '../../services/detalhesorcamento';
import * as XLSX from 'xlsx';
import {Composicao, ComposicoesService} from '../../services/composicoes';
import {firstValueFrom} from 'rxjs';


@Component({
  standalone: true,
  imports: [CommonModule,
    RouterLink, FormsModule],

  selector: 'app-topbar-detalhesorcamento',
  templateUrl: './topbar-detalhesorcamento.html',
  styleUrl: './topbar-detalhesorcamento.css'
})

export class TopbarDetalhesorcamento implements OnInit{
  @Input() orcamento!: OrcamentoDetalhes;
  @Output() encargosAlterados = new EventEmitter<'desonerado' | 'nao-desonerado'>();

  onEncargoChange(novoValor: 'desonerado' | 'nao-desonerado') {
    this.orcamento.encargosSociais = novoValor;
    this.encargosAlterados.emit(novoValor);
  }
modalImportarAberto = false;
menuFerramentasAberto = false;
bancosDisponiveis = ['SINAPI', 'SICRO'];
periodosDisponiveis = ['11/2024', '12/2024', '01/2025', '02/2025', '03/2025', '04/2025', '05/2025'];



primeiroItem = '';
ultimoItem = '';
orcamentoId!: string;

  arquivoExcel: File | null = null;
  dadosExcel: any[] = [];
modalAberto = false;
  anoProposta: number | null = null;
  numeroMeta: string = '';
  numeroSubmeta: string = '';
  nome = '';
  encargos: 'desonerado' | 'nao-desonerado' = 'desonerado';
  bdi = '';
  nomeBanco = '';
  periodoBanco = '';
  bancos: { nome: string; periodo: string }[] = [];
  modalBancoAberto = false;
isOrcamento: boolean= false;
  menuAberto: boolean = false;
  menuEventogramaAberto: boolean = false;


constructor(private route: ActivatedRoute, private router: Router,   private detalhesOrcamentoService: DetalhesorcamentoService,     private composicoesService: ComposicoesService) {
}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.orcamentoId = params.get('id')!;
      this.carregarDadosOrcamento();
    });

    const url = this.router.url;
    if (url.startsWith('/eventograma')) {
      this.isOrcamento = true;
    }
  }


  onFileSelected(event: any): void {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      alert('Por favor, selecione um único arquivo');
      return;
    }
    this.arquivoExcel = target.files[0];
  }


  carregarDadosOrcamento() {
    this.detalhesOrcamentoService.getOrcamento(this.orcamentoId).subscribe({
      next: (dados) => {
        this.nome = dados.nome;
        this.bdi = String(dados.bdi);
        this.bancos = dados.bancos || [];
        this.encargos = dados.encargosSociais === 'nao-desonerado' ? 'nao-desonerado' : 'desonerado';
      },
      error: (err) => {
        console.error('Erro ao carregar orçamento:', err);
        alert('Erro ao carregar dados do orçamento.');
      }
    });
  }


  abrirModalImportar(): void {
    this.modalImportarAberto = true;
    this.menuFerramentasAberto = false;
  }

  fecharModalImportar(): void {
    this.modalImportarAberto = false;
  }

  importando = false;


  confirmarImportacao(): void {
    if (this.importando) return; // previne cliques repetidos

    if (!this.primeiroItem || !this.ultimoItem) {
      alert('Preencha os dois campos!');
      return;
    }

    if (!this.arquivoExcel) {
      alert('Por favor, selecione um arquivo Excel para importar.');
      return;
    }

    this.importando = true;

    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const dados = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      this.dadosExcel = dados;

      await this.processarDadosExcel(dados);

      this.importando = false;
    };

    reader.readAsBinaryString(this.arquivoExcel);
  }

  async processarDadosExcel(dados: any[][]): Promise<void> {
    const idxPrimeiro = Number(this.primeiroItem);
    const idxUltimo = Number(this.ultimoItem);

    if (isNaN(idxPrimeiro) || isNaN(idxUltimo)) {
      alert('Por favor, insira números válidos para as linhas inicial e final.');
      return;
    }

    if (idxPrimeiro < 0 || idxUltimo >= dados.length) {
      alert('Os índices de linha informados estão fora do intervalo do arquivo.');
      return;
    }

    if (idxUltimo < idxPrimeiro) {
      alert('O índice do último item não pode ser menor que o do primeiro.');
      return;
    }

    for (let i = idxPrimeiro; i <= idxUltimo; i++) {
      const linha = dados[i];
      if (!linha) continue;

      const nivelRaw = linha[0];
      const codigoItem = linha[1];
      const descricao = linha[3];
      const quantidadeRaw = linha[5];

      if (!nivelRaw || String(nivelRaw).trim() === '') continue;

      const quantidade = Number(quantidadeRaw);
      if (isNaN(quantidade)) continue;

      const codigoVazio = !codigoItem || String(codigoItem).trim() === '';

      const nivelStr = String(nivelRaw).trim();

      function isIntegerString(str: string): boolean {
        return /^\d+$/.test(str);
      }

      function isDecimalOrComplex(str: string): boolean {
        return /^(\d+\.)+\d+/.test(str) || /^\d+\.\d+$/.test(str);
      }

      if (codigoVazio && isIntegerString(nivelStr)) {
        await this.adicionarEtapaOuSubetapa('etapa', descricao, quantidade, nivelStr);
        continue;
      }

      if (codigoVazio && !isIntegerString(nivelStr)) {
        await this.adicionarEtapaOuSubetapa('subetapa', descricao, quantidade, nivelStr);
        continue;
      }

      if (!codigoVazio && quantidade > 0) {
        await this.adicionarItemOrcamento(
          String(codigoItem),
          quantidade,
          String(linha[2]),
          false,
          nivelStr
        );
      }
    }

    alert('Importação concluída.');
  }

  async adicionarEtapaOuSubetapa(
    tipo: 'etapa' | 'subetapa',
    descricao: string,
    quantidade: number,
    nivel: string
  ) {
    const item = {
      descricao: descricao || (tipo === 'etapa' ? 'Etapa automática' : 'Subetapa automática'),
      quantidade,
      nivel,
      tipo,
      frentes_de_obra: []
    };

    await firstValueFrom(
      this.detalhesOrcamentoService.adicionarItem(this.orcamentoId, item)
    );

    console.log(`✅ ${tipo === 'etapa' ? 'Etapa' : 'Subetapa'} '${nivel}' adicionada com sucesso.`);
  }


  async adicionarItemOrcamento(
    codigo: string,
    quantidade: number,
    banco: string,
    isEtapa: boolean,
    nivel: string
  ): Promise<void> {
    try {
      const codigoLimpo = codigo.trim();
      const bancoLimpo = banco.trim();

      if (!codigoLimpo && isEtapa) {
        const itemEtapa = {
          descricao: 'Etapa automática',
          quantidade,
          nivel,
          tipo: 'etapa',
          frentes_de_obra: []
        };

        await firstValueFrom(
          this.detalhesOrcamentoService.adicionarItem(this.orcamentoId, itemEtapa)
        );

        console.log(`✅ Etapa '${nivel}' adicionada com sucesso.`);
        return;
      }

      if (!codigoLimpo && !isEtapa) {
        const itemSubetapa = {
          descricao: 'Subetapa automática',
          quantidade,
          nivel,
          tipo: 'subetapa',
          frentes_de_obra: []
        };

        await firstValueFrom(
          this.detalhesOrcamentoService.adicionarItem(this.orcamentoId, itemSubetapa)
        );

        console.log(`📁 Subetapa '${nivel}' adicionada com sucesso.`);
        return;
      }


      const periodo = this.buscarPeriodoBanco(bancoLimpo);
      if (!periodo) {
        console.warn(`⚠️ Período não encontrado para banco '${bancoLimpo}', pulando item '${codigoLimpo}'.`);
        return;
      }

      const composicoes = await firstValueFrom(
        this.composicoesService.buscarPorCodigo(codigoLimpo, bancoLimpo, periodo)
      );

      if (!composicoes || composicoes.length === 0) {
        console.warn(`⚠️ Composição não encontrada para código '${codigoLimpo}' no banco '${bancoLimpo}' e período '${periodo}'.`);
        return;
      }

      const composicao: Composicao = composicoes[0];

      const encargosPercent = this.encargos === 'desonerado' ? 0 : (this.orcamento.encargosSociais === 'nao-desonerado' ? 0 : 0);
      const bdiPercent = Number(this.bdi) || 0;

      const precoBase = composicao.precoDesonerado;
      const precoUnitario = precoBase * (1 + encargosPercent / 100) * (1 + bdiPercent / 100);

      const itemOrcamento = {
        codigo: composicao.codigo,
        descricao: composicao.nome,
        unidade: composicao.unidadeMedida,
        quantidade,
        banco: bancoLimpo,
        precoUnitario,
        tipo: 'composicao',
        nivel,
        frentes_de_obra: []
      };

      console.log('🧩 Adicionando item ao orçamento:', itemOrcamento);

      await firstValueFrom(
        this.detalhesOrcamentoService.adicionarItem(this.orcamentoId, itemOrcamento)
      );

      console.log(`✅ Item '${codigoLimpo}' adicionado com sucesso.`);

    } catch (error: any) {
      console.error(`❌ Erro ao adicionar item '${codigo}':`, error?.message || error);
    }
  }




  buscarPeriodoBanco(banco: string): string | null {
    const bancoInfo = this.bancos.find(b => b.nome === banco);

    if (!bancoInfo || !bancoInfo.periodo) return null;

    const mapaMeses: Record<string, string> = {
      'janeiro': '01',
      'fevereiro': '02',
      'março': '03',
      'abril': '04',
      'maio': '05',
      'junho': '06',
      'julho': '07',
      'agosto': '08',
      'setembro': '09',
      'outubro': '10',
      'novembro': '11',
      'dezembro': '12'
    };

    const [mesNome, ano] = bancoInfo.periodo.toLowerCase().split('/');

    const mesNumero = mapaMeses[mesNome.trim()];
    if (!mesNumero || !ano) return null;

    return `${mesNumero}-${ano.trim()}`;
  }



  abrirMenu(): void {
    this.menuAberto = true;
  }


  fecharMenu(): void {
    this.menuAberto = false;
  }


  importarOrcamento(): void {
    console.log('Importando orçamento...');

    this.fecharMenu();
  }

  exportarParaTransfereGov() {
    if (!this.anoProposta || !this.numeroMeta || !this.numeroSubmeta) {
      alert('Por favor, preencha todos os campos antes de exportar.');
      return;
    }

    console.log('Exportando com os dados:', {
      anoProposta: this.anoProposta,
      numeroMeta: this.numeroMeta,
      numeroSubmeta: this.numeroSubmeta
    });

}

  abrirModal(): void {
    this.modalAberto = true;
    this.fecharMenu();
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  confirmarExportacao(): void {
    console.log('Exportação confirmada!');
    this.fecharModal();
  }

  abrirModalBanco() {
    this.modalBancoAberto = true;
    this.carregarDadosOrcamento();
  }

  fecharModalBanco() {
    this.modalBancoAberto = false;
  }

  adicionarBanco() {
    if (this.nomeBanco && this.periodoBanco) {
      this.bancos.push({
        nome: this.nomeBanco,
        periodo: this.periodoBanco
      });
      this.nomeBanco = '';
      this.periodoBanco = '';
    }
  }

  removerBanco(index: number) {
    this.bancos.splice(index, 1);
  }

  salvar() {
    const payload: Partial<OrcamentoDetalhes> = {
      nome: this.nome,
      bdi: Number(this.bdi),
      bancos: this.bancos,
    };

    if (this.encargos) {
      (payload as any).encargosSociais = this.encargos;
    }

    this.detalhesOrcamentoService.editarOrcamento(this.orcamentoId, payload).subscribe({
      next: (res) => {
        console.log('Orçamento atualizado:', res);
        alert('Orçamento salvo com sucesso.');
        this.fecharModalBanco();
      },
      error: (err) => {
        console.error('Erro ao salvar orçamento:', err);
        alert('Erro ao salvar o orçamento.');
      }
    });
  }

}
