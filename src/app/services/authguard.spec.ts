import { TestBed } from '@angular/core/testing';

import { Authguard } from './authguard';

describe('Authguard', () => {
  let service: Authguard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Authguard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
