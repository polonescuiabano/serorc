import { TestBed } from '@angular/core/testing';

import { Orcamentos } from './orcamentos';

describe('Orcamentos', () => {
  let service: Orcamentos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Orcamentos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
