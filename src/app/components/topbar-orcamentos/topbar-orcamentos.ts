import {Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, FormControl} from '@angular/forms';
import {NgIf} from '@angular/common';
import {OrcamentosService} from '../../services/orcamentos';


@Component({
  standalone: true,
  selector: 'app-topbar-orcamentos',
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,

  ],
  templateUrl: './topbar-orcamentos.html',
  styleUrl: './topbar-orcamentos.css'
})
export class TopbarOrcamentos implements OnInit{
  bdi: number | null = null;
  encargo: string = '';
  bancos: { tipo: string, periodo: string }[] = [];
  modalAberto= false;
  orcamentoForm!:FormGroup;
  modalCriarPastaAberto = false;
  nomePasta: string = '';



  constructor(private svc:OrcamentosService,private fb:FormBuilder) {
  }
  ngOnInit(){
    this.initForms();
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

    // Aqui você pode adicionar a lógica real de criação de pasta, ex:
    // this.orcamentoService.criarNovaPasta(this.nomePasta).subscribe(...)

    console.log('Nova pasta criada:', this.nomePasta);
    this.fecharModalCriarPasta();
  }
  get nomeOrcamento(): FormControl{
    return this.orcamentoForm.get('nomeOrcamento') as FormControl
  }

  abrirModal(){
    this.modalAberto=true;
  }
  fecharModal(){
    this.modalAberto=false;
  }
  adicionarBanco() {
    this.bancos.push({ tipo: '', periodo: '' });
  }
  abrirSelecionarBanco() {
    console.log("Abrir tela de seleção de banco");
  }
  initForms() {
    this.orcamentoForm = this.fb.group({
      nomeOrcamento: [''],
      bdi: [null],
      encargo: ['']
    });
  }

  adicionarOrcamento(){
    const { nomeOrcamento, bdi, encargo } = this.orcamentoForm.value;

    const orcamento = {
      nome: nomeOrcamento,
      bdi,
      encargo,
      bancos:'SINAPI'
    };




  }

}
