import { TestBed } from '@angular/core/testing';

import { Composicoes } from './composicoes';

describe('Composicoes', () => {
  let service: Composicoes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Composicoes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
