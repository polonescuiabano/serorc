import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detalhescomposicao } from './detalhescomposicao';

describe('Detalhescomposicao', () => {
  let component: Detalhescomposicao;
  let fixture: ComponentFixture<Detalhescomposicao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detalhescomposicao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Detalhescomposicao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
