import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detalhesorcamento } from './detalhesorcamento';

describe('Detalhesorcamento', () => {
  let component: Detalhesorcamento;
  let fixture: ComponentFixture<Detalhesorcamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detalhesorcamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Detalhesorcamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
