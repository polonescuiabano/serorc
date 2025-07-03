import { TestBed } from '@angular/core/testing';

import { Eventograma } from './eventograma';

describe('Eventograma', () => {
  let service: Eventograma;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Eventograma);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
