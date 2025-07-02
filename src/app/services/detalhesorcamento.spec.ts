import { TestBed } from '@angular/core/testing';

import { OrcamentoDetalhes } from './detalhesorcamento';
import {OrcamentosService} from './orcamentos';

describe('Detalhesorcamento', () => {
  let service: OrcamentoDetalhes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Detalhesorcamento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
