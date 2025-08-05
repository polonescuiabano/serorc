import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Sidebar} from '../../sidebar/sidebar';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {InsumosService} from '../../../services/insumos';

@Component({
  selector: 'app-criarcotacao',
  templateUrl: './criarcotacao.html',
  imports: [
    Sidebar, FormsModule, CommonModule
  ],
  styleUrl: './criarcotacao.css'
})
export class Criarcotacao {
  empresa: any = {
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    vendedor: '',
    dataCotacao: ''
  };


  insumos: any[] = [
    { codigo: '', nome: '', unidade: '', preco: '' }
  ];

  arquivoSelecionado!: File;

  constructor(private http: HttpClient, private insumosService: InsumosService) {}

  adicionarInsumo() {
    this.insumos.push({ codigo: '', nome: '', unidade: '', preco: '' });
  }

  onFileSelected(event: any) {
    this.arquivoSelecionado = event.target.files[0];
  }

  onSubmit() {
    const cotacaoDto = {
      nomeEmpresa: this.empresa.nome,
      cnpj: this.empresa.cnpj,
      telefone: this.empresa.telefone,
      email: this.empresa.email,
      vendedor: this.empresa.vendedor,
      dataCotacao: this.empresa.dataCotacao,
      insumos: this.insumos.map(i => ({
        codigo: i.codigo,
        nome: i.nome,
        unidade: i.unidade,
        preco: Number(i.preco),
        dataCotacao: this.empresa.dataCotacao
      }))
    };

    const formData = new FormData();

    formData.append('dto', new Blob([JSON.stringify(cotacaoDto)], { type: 'application/json' }));

    if (this.arquivoSelecionado) {
      formData.append('documento', this.arquivoSelecionado, this.arquivoSelecionado.name);
      formData.append('documentoNome', this.arquivoSelecionado.name);
    }

    this.insumosService.salvarCotacao(formData).subscribe({
      next: () => alert('Cotação enviada com sucesso.'),
      error: err => alert('Erro ao enviar cotação: ' + err.message)
    });
  }
}
