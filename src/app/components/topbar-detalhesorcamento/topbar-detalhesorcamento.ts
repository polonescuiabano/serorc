import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Detalhesorcamento} from '../pages/detalhesorcamento/detalhesorcamento';
import {DetalhesorcamentoService, OrcamentoDetalhes} from '../../services/detalhesorcamento';


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


constructor(private route: ActivatedRoute, private router: Router,   private detalhesOrcamentoService: DetalhesorcamentoService) {
}

ngOnInit() {
  this.route.paramMap.subscribe(params =>{
    this.orcamentoId = params.get('id')!;

  });
  const url =this.router.url;
  if (url.startsWith('/eventograma')){
    this.isOrcamento= true;
  }

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

  confirmarImportacao(): void {
    if (!this.primeiroItem || !this.ultimoItem) {
      alert('Preencha os dois campos!');
      return;
    }

    console.log('Importando orçamento com os itens:', {
      primeiroItem: this.primeiroItem,
      ultimoItem: this.ultimoItem
    });

    this.fecharModalImportar();
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
