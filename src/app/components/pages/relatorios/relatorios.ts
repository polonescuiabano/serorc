import { Component } from '@angular/core';
import { Sidebar } from '../../sidebar/sidebar';
import { FormsModule } from '@angular/forms';
import { InsumosService, Insumo } from '../../../services/insumos';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    Sidebar,
    FormsModule,
    CommonModule
  ],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css'
})
export class Relatorios {
  searchBy = 'codigo';
  tipo = 'PROPRIO';
  query = '';
  periodo = '';
  resultados: Insumo[] = [];

  constructor(private insumosService: InsumosService) {}

  buscar(): void {
    if (!this.query.trim()) {
      alert('Por favor, insira um termo para busca.');
      return;
    }

    if (this.searchBy === 'codigo') {
      this.insumosService.buscarPorCodigo(this.query, this.tipo, this.periodo).subscribe({
        next: (res) => {
          this.resultados = res;
        },
        error: (err) => {
          console.error('Erro na busca por código:', err);
          alert('Erro ao buscar por código.');
        }
      });
    } else if (this.searchBy === 'descricao') {
      this.insumosService.buscarPorNome(this.query, this.tipo, this.periodo).subscribe({
        next: (res) => {
          this.resultados = res;
        },
        error: (err) => {
          console.error('Erro na busca por nome:', err);
          alert('Erro ao buscar por nome.');
        }
      });
    }
  }

  limpar(): void {
    this.query = '';
    this.resultados = [];
  }
}
