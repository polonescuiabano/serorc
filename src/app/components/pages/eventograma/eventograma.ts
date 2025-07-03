import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Eventograma, Evento, FrenteDeObra } from '../../../services/eventograma';
import {DetalhesorcamentoService, ItemOrcamento, OrcamentoDetalhes} from '../../../services/detalhesorcamento';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CurrencyPipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-eventograma',
  templateUrl: './eventograma.html',
  imports: [FormsModule, ReactiveFormsModule, CurrencyPipe, NgForOf, NgIf],
  styleUrls: ['./eventograma.css']
})
export class EventogramaComponent implements OnInit {
  orcamentoId!: string;
  eventos: Evento[] = [];
  frentes: FrenteDeObra[] = [];
  itens: ItemOrcamento[] = [];
  orcamento!: OrcamentoDetalhes;

  novoEventoForm!: FormGroup;
  novaFrenteForm!: FormGroup;

  editEventoId: string | null = null;
  editFrenteId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private svc: Eventograma,
    private fb: FormBuilder,
    private svcOrcamento: DetalhesorcamentoService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.orcamentoId = params.get('id')!;
      if (this.orcamentoId) {
        this.loadDados(this.orcamentoId);
        this.initForms();
      } else {
        console.error('ID do orçamento ausente na rota');
      }
    });

  }

  getIndentation(nivel: string | number): number {
    const nivelStr = nivel.toString();
    return nivelStr.split('.').length * 20;
  }

  get nomeEvento(): FormControl {
    return this.novoEventoForm.get('nome') as FormControl;
  }

  get numeroEvento(): FormControl {
    return this.novoEventoForm.get('numero') as FormControl;
  }

  get nomeFrente(): FormControl {
    return this.novaFrenteForm.get('nome') as FormControl;
  }

  initForms() {
    this.novoEventoForm = this.fb.group({
      id: [''],
      numero: [''],
      nome: ['']
    });
    this.novaFrenteForm = this.fb.group({
      id: [''],
      nome: ['']
    });
  }


  loadDados(id: string) {
    if (!id) {
      console.error('ID do orçamento inválido:', id);
      return;
    }

    this.svc.getEventos(id).subscribe({
      next: ev => this.eventos = ev,
      error: err => console.error('Erro ao buscar eventos:', err)
    });

    this.svc.getFrentes(id).subscribe({
      next: fr => this.frentes = fr,
      error: err => console.error('Erro ao buscar frentes:', err)
    });

    this.svcOrcamento.getOrcamento(id).subscribe({
      next: o => this.orcamento = this.calculate(o),
      error: err => console.error('Erro ao buscar orçamento:', err)
    });
  }


  private calculate(o: OrcamentoDetalhes): OrcamentoDetalhes {
    const bdiPercent = o.bdi ?? 0;

    o.itens = o.itens.map(i => {
      const preco = i.precoUnitario ?? 0;
      const quantidade = i.quantidade ?? 0;

      const valorComBdi = preco + (preco * bdiPercent / 100);
      const total = valorComBdi * quantidade;

      return {
        ...i,
        valorComBdi,
        total
      };
    });

    const itensOrdenados = [...o.itens].sort((a, b) => {
      return b.nivel.toString().split('.').length - a.nivel.toString().split('.').length;
    });

    for (let item of itensOrdenados) {
      const itemNivel = item.nivel.toString();

      const parentPath = itemNivel.split('.').slice(0, -1).join('.');
      if (!parentPath) continue;

      const parentItem = o.itens.find(i => i.nivel.toString() === parentPath);
      if (parentItem) {
        parentItem.total = (parentItem.total ?? 0) + (item.total ?? 0);
      }
    }

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

    return o;
  }


  private generateObjectId(): string {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    const random = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => (Math.floor(Math.random() * 16)).toString(16));
    return timestamp + random;
  }



  adicionarEvento() {
    const { numero, nome } = this.novoEventoForm.value;
    if (!nome || !numero) return;

    const novoEvento = {
      _id: this.generateObjectId(),
      nome,
      numero
    };

    console.log(novoEvento);

    this.svc.adicionarEvento(this.orcamentoId, novoEvento)
      .subscribe({
        next: () => {
          this.loadDados(this.orcamentoId);
          this.novoEventoForm.reset();
        },
        error: err => console.error('Erro ao adicionar evento:', err)
      });
  }

  editarEvento(evento: Evento) {
    this.editEventoId = evento._id!;
    this.novoEventoForm.setValue({
      id: evento._id ?? '',
      nome: evento.nome,
      numero: evento.numero ?? ''
    });
  }

  salvarEdicaoEvento() {
    if (!this.editEventoId) return;
    const { nome, numero } = this.novoEventoForm.value;
    this.svc.editarEvento(this.orcamentoId, this.editEventoId, { nome, numero }).subscribe(() => {
      this.editEventoId = null;
      this.novoEventoForm.reset();
      this.loadDados(this.orcamentoId);
    });
  }

  excluirEvento(eventoId: string) {
    if (!confirm('Confirma excluir evento?')) return;
    this.svc.excluirEvento(this.orcamentoId, eventoId).subscribe(() => this.loadDados(this.orcamentoId));
  }

  adicionarFrente() {
    const { nome } = this.novaFrenteForm.value;
    if (!nome) return;

    const novaFrente = {
      _id: this.generateObjectId(),
      nome
    };

    this.svc.adicionarFrente(this.orcamentoId, novaFrente)
      .subscribe({
        next: () => {
          this.loadDados(this.orcamentoId);
          this.novaFrenteForm.reset();
        },
        error: err => console.error('Erro ao adicionar frente:', err)
      });
  }

  editarFrente(frente: FrenteDeObra) {
    this.editFrenteId = frente._id!;
    this.novaFrenteForm.setValue({
      id: frente._id ?? '',
      nome: frente.nome
    });
  }

  salvarEdicaoFrente() {
    if (!this.editFrenteId) return;
    const { nome} = this.novaFrenteForm.value;
    this.svc.editarFrente(this.orcamentoId, this.editFrenteId, {  nome }).subscribe(() => {
      this.editFrenteId = null;
      this.novaFrenteForm.reset();
      this.loadDados(this.orcamentoId);
    });
  }

  excluirFrente(frenteId: string) {
    if (!confirm('Confirma excluir frente de obra?')) return;
    this.svc.excluirFrente(this.orcamentoId, frenteId).subscribe(() => this.loadDados(this.orcamentoId));
  }

  // Associar evento ao item
  onEventoChange(item: ItemOrcamento, eventoId: string | null) {
    if (eventoId) {
      this.svc.atualizarEventoDoItem(this.orcamentoId, item.id, { _id: eventoId }).subscribe(() => {
        item.eventoId = eventoId;
      });
    } else {
      this.svc.removerEventoDoItem(this.orcamentoId, item.id).subscribe(() => {
        item.eventoId = null;
      });
    }
  }

  // Quantidade por frente no item
  getQuantidadeFrente(item: ItemOrcamento, frenteId: string): number {
    return item.frentesDeObra?.find(f => f.frenteDeObraId === frenteId)?.quantidade ?? 0;
  }

  onInputQuantidade(event: Event, item: ItemOrcamento, frente: FrenteDeObra) {
    const input = event.target as HTMLInputElement;
    const quantidade = Number(input.value);
    this.onQuantidadeFrenteChange(item, frente, quantidade);
  }

  onQuantidadeFrenteChange(item: ItemOrcamento, frente: FrenteDeObra, quantidade: number) {
    if (quantidade > 0) {
      this.svc.adicionarFrenteAoItem(this.orcamentoId, item.id, { frenteDeObraId: frente._id, quantidade }).subscribe(() => {
        const existente = item.frentesDeObra?.find(f => f.frenteDeObraId === frente._id);
        if (existente) existente.quantidade = quantidade;
        else item.frentesDeObra = [...(item.frentesDeObra ?? []), { frenteDeObraId: frente._id, quantidade }];
      });
    } else {
      this.svc.removerFrenteDoItem(this.orcamentoId, item.id, frente._id).subscribe(() => {
        item.frentesDeObra = item.frentesDeObra?.filter(f => f.frenteDeObraId !== frente._id) || [];
      });
    }
  }
}
