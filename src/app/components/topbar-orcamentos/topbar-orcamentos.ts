import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, FormControl, FormArray} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {OrcamentosService} from '../../services/orcamentos';
import {AuthService} from '../../services/auth.service';


@Component({
  standalone: true,
  selector: 'app-topbar-orcamentos',
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    NgForOf,

  ],
  templateUrl: './topbar-orcamentos.html',
  styleUrl: './topbar-orcamentos.css'
})
export class TopbarOrcamentos implements OnInit, OnChanges{
  @Input() pastaAtualId: string | null = null;

  meses = [
    { label: 'Novembro/2024', valor: '11/2024' },
    { label: 'Dezembro/2024', valor: '12/2024' },
    { label: 'Janeiro/2025', valor: '01/2025' },
    { label: 'Fevereiro/2025', valor: '02/2025' },
    { label: 'Março/2025', valor: '03/2025' },
    { label: 'Abril/2025', valor: '04/2025' },
    { label: 'Maio/2025', valor: '05/2025' },
  ];

  pastas: any[] = [];
  pastaId: string | null = null;
  pastaPaiId: string | null = null;
  bdi: number | null = null;
  encargo: string = '';
  bancos: { tipo: string, periodo: string }[] = [];
  modalAberto= false;
  orcamentoForm!:FormGroup;
  modalCriarPastaAberto = false;
  nomePasta: string = '';



  constructor(    private auth: AuthService,
                  private svc:OrcamentosService,private fb:FormBuilder) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pastaAtualId'] && changes['pastaAtualId'].currentValue) {
      this.pastaId = changes['pastaAtualId'].currentValue;
      console.log('📦 pastaId atualizada via ngOnChanges:', this.pastaId);
      localStorage.setItem('pastaAtualId', this.pastaId ?? '');
    }
  }

  ngOnInit() {
    this.initForms();

    const usuarioId = this.auth.getUsuarioId();
    const empresa = this.auth.getEmpresa();

    if (usuarioId && empresa) {
      this.svc.listarPastas(usuarioId, empresa).subscribe(pastas => {
        console.log('📁 listarPastas resposta detalhada:', pastas);
        this.pastas = pastas;

        const pastaRaiz = pastas.find(p => p.nome?.toLowerCase() === 'raiz' && p.usuarioId === usuarioId);

        if (pastaRaiz && pastaRaiz._id) {

          this.pastaId = pastaRaiz._id.toString();
          this.pastaPaiId = null; // raiz não tem pasta pai
          console.log('🎯 Pasta raiz selecionada:', this.pastaId);
        } else if (pastas.length > 0) {
          const ultimaPasta = pastas[pastas.length - 1];
          this.pastaId = ultimaPasta._id ? ultimaPasta._id.toString() : null;
          this.pastaPaiId = ultimaPasta.pastaPaiId ? ultimaPasta.pastaPaiId.toString() : null;
          console.log('🎯 Última pasta selecionada:', this.pastaId);
        } else {
          this.pastaId = null;
          this.pastaPaiId = null;
          console.warn('⚠️ Nenhuma pasta encontrada para o usuário');
        }

        if (this.pastaId) {
          localStorage.setItem('pastaAtualId', this.pastaId);
        }

        console.log('📁 Pasta atual:', this.pastaId);
        console.log('📁 Pasta pai:', this.pastaPaiId);
      });
    }
  }

  abrirModalCriarPasta() {
    this.modalCriarPastaAberto = true;
  }

  fecharModalCriarPasta() {
    this.modalCriarPastaAberto = false;
    this.nomePasta = '';
  }

  criarPasta() {
    if (!this.nomePasta.trim()) return;

    const pastaAtual = this.pastaId || localStorage.getItem('pastaAtualId');

    if (!pastaAtual) {
      alert('Nenhuma pasta atual encontrada');
      return;
    }

    this.svc.criarNovaPasta(this.nomePasta, pastaAtual).subscribe({
      next: (res) => {
        console.log('✅ Pasta criada:', res);
        this.fecharModalCriarPasta();
      },
      error: (err) => {
        console.error('Erro ao criar pasta:', err);
        alert('Erro ao criar pasta');
      }
    });
  }


  abrirModal(){
    this.modalAberto=true;
  }
  fecharModal(){
    this.modalAberto=false;
  }

  get bancosControls() {
    return (this.orcamentoForm.get('bancos') as FormArray).controls;
  }

  adicionarBanco() {
    const bancos = this.orcamentoForm.get('bancos') as FormArray;
    bancos.push(this.fb.group({
      tipo: [''],
      periodo: ['']
    }));
  }

  initForms() {
    this.orcamentoForm = this.fb.group({
      nomeOrcamento: [''],
      bdi: [null],
      encargo: [''],
      bancos: this.fb.array([]),
    });
  }

  adicionarOrcamento() {
    const { nomeOrcamento, bdi, encargo } = this.orcamentoForm.value;

    const pastaFinal = this.pastaId ?? localStorage.getItem('pastaAtualId');

    if (!pastaFinal) {
      alert('Nenhuma pasta selecionada');
      return;
    }

    const usuarioId = this.auth.getUsuarioId();
    const empresa = this.auth.getEmpresa();

    if (!usuarioId || !empresa) {
      alert('Usuário ou empresa não encontrado');
      return;
    }

    const bancosFromForm = (this.orcamentoForm.get('bancos') as FormArray).value;

    const bancosValidos = bancosFromForm
      .filter((b: any) =>
        (b.tipo === 'SINAPI' || b.tipo === 'SICRO') &&
        this.meses.some(m => m.valor === b.periodo)
      )
      .map((b: any) => {
        const mesEncontrado = this.meses.find(m => m.valor === b.periodo);
        return {
          nome: b.tipo,
          periodo: mesEncontrado?.label || b.periodo
        };
      });

    const orcamentoDTO = {
      nome: nomeOrcamento,
      bdi: Number(bdi),
      encargosSociais: encargo,
      bancos: bancosValidos,
      itens: [],
      pastaId: pastaFinal,
    };

    console.log("O orcamento enviado: ", orcamentoDTO);
    this.svc.criarOrcamento(orcamentoDTO).subscribe({
      next: (res) => {
        console.log('✅ Orçamento criado:', res);
        this.fecharModal();
      },
      error: (err) => {
        console.error('❌ Erro ao criar orçamento:', err);
        alert('Erro ao criar orçamento');
      }
    });
  }



  removerBanco(index: number) {
    const bancos = this.orcamentoForm.get('bancos') as FormArray;
    bancos.removeAt(index);
  }
}
