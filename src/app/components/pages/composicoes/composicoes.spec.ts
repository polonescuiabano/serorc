import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Composicoes } from './composicoes';

describe('Composicoes', () => {
  let component: Composicoes;
  let fixture: ComponentFixture<Composicoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Composicoes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Composicoes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
