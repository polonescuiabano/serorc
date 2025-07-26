import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {OrcamentosService} from '../../../services/orcamentos';
import {AuthService} from '../../../services/auth.service';
import {CommonModule} from '@angular/common';
import {Sidebar} from '../../sidebar/sidebar';
import {TopbarOrcamentos} from '../../topbar-orcamentos/topbar-orcamentos';

@Component({
  selector: 'app-orcamentos',
  imports: [CommonModule, Sidebar, TopbarOrcamentos],
  templateUrl: './orcamentos.html',
  styleUrl: './orcamentos.css'
})
export class Orcamentos implements OnInit{
  caminhoPastas: { id: string, nome: string }[] = [];
  usuarioId: string = '';
  empresa: string = '';
  pastaAtualId: string | null = null;
  pastas: any[] = [];
  orcamentos: any[] = [];

  constructor(private orcamentoService: OrcamentosService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const id = this.authService.getUsuarioId();
    const empresa = this.authService.getEmpresa();


    console.log('Usuário:', this.authService.getUser());
    console.log('ID:', this.authService.getUsuarioId());
    console.log('Empresa:', this.authService.getEmpresa());

    if (!id || !empresa) {
      alert('Usuário ou empresa não encontrados. Faça login novamente.');
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioId = id;
    this.empresa = empresa;

    this.carregarPastaRaiz();
  }

  carregarPastaRaiz(): void {
    this.orcamentoService.listarPastas(this.usuarioId, this.empresa).subscribe(pastas => {
      const raiz = pastas.find(p => p.nome === 'Raiz');
      if (raiz) {
        const pastaId = raiz.id || raiz._id;
        this.pastaAtualId = pastaId;
        this.caminhoPastas = [{ id: pastaId, nome: 'Raiz' }];

        this.orcamentoService.listarPastas(this.usuarioId, this.empresa, pastaId).subscribe(subpastas => {
          this.pastas = subpastas;
        });

        this.orcamentoService.listarOrcamentosPorPasta(pastaId).subscribe(orcamentos => {
          this.orcamentos = orcamentos;
        });
      }
    });
  }



  carregarConteudoDaPasta(pastaId: string): void {
    this.pastaAtualId = pastaId;

    this.orcamentoService.listarPastas(this.usuarioId, this.empresa, pastaId).subscribe(pastas => {
      console.log('Subpastas:', pastas);
      this.pastas = pastas;
    });

    this.orcamentoService.listarOrcamentosPorPasta(pastaId).subscribe(orcamentos => {
      console.log('Orçamentos:', orcamentos);
      this.orcamentos = orcamentos;
    });
  }

  abrirPasta(pastaId: string, pastaNome: string): void {
    const index = this.caminhoPastas.findIndex(p => p.id === pastaId);

    if (index === -1) {
      this.caminhoPastas.push({ id: pastaId, nome: pastaNome });
    } else {
      this.caminhoPastas = this.caminhoPastas.slice(0, index + 1);
    }

    this.carregarConteudoDaPasta(pastaId);
  }

  abrirOrcamento(orcamentoId: string): void {
    this.router.navigate(['/detalhes-orcamento', orcamentoId]);
  }

  deletarOrcamento(orcamentoId: string): void {
    if (confirm('Deseja realmente excluir este orçamento?')) {
      this.orcamentoService.deletarOrcamento(orcamentoId).subscribe(() => {
        this.carregarConteudoDaPasta(this.pastaAtualId!);
      });
    }
  }

  deletarPasta(pastaId: string): void {
    if (confirm('Deseja realmente excluir esta pasta?')) {
      this.orcamentoService.deletarPasta(pastaId).subscribe(() => {
        this.carregarConteudoDaPasta(this.pastaAtualId!);
      });
    }
  }
}


