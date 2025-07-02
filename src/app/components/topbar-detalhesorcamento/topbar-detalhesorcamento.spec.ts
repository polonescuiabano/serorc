import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopbarDetalhesorcamento } from './topbar-detalhesorcamento';

describe('TopbarDetalhesorcamento', () => {
  let component: TopbarDetalhesorcamento;
  let fixture: ComponentFixture<TopbarDetalhesorcamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarDetalhesorcamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopbarDetalhesorcamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
