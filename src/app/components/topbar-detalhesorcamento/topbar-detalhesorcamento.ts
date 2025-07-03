import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-topbar-detalhesorcamento',
  imports: [
    RouterLink
  ],
  templateUrl: './topbar-detalhesorcamento.html',
  styleUrl: './topbar-detalhesorcamento.css'
})
export class TopbarDetalhesorcamento implements OnInit{
  orcamentoId!: string;

  constructor(private route: ActivatedRoute) {
  }
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.orcamentoId = params.get('id')!;
    });
  }
}
