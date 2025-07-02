import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ComposicoesService} from '../../../services/composicoes';

@Component({
  selector: 'app-detalhescomposicao',
  imports: [],
  templateUrl: './detalhescomposicao.html',
  styleUrl: './detalhescomposicao.css'
})
export class Detalhescomposicao implements OnInit{
  codigo!: string;
  composicao: any;
  insumos: any[] = [];
  composicoesAuxiliares: any[] = [];
  isProprio = false;

  constructor(
    private route: ActivatedRoute,
    private composicoesService: ComposicoesService
  ) {}

  ngOnInit() {
    this.codigo = this.route.snapshot.paramMap.get('codigo') || '';
    this.carregarDetalhes();
  }

  carregarDetalhes() {
    this.composicoesService.getDetalhesComposicao(this.codigo).subscribe(data => {
      this.composicao = data;
      this.insumos = data.insumos || [];
      this.composicoesAuxiliares = data.composicoesAuxiliares || [];
      this.isProprio = data.tipo === 'PROPRIO';
    });
  }

  adicionarInsumo() {
  }

  adicionarComposicaoAuxiliar() {
  }
}
