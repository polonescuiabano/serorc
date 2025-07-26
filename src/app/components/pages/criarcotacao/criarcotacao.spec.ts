import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Criarcotacao } from './criarcotacao';

describe('Criarcotacao', () => {
  let component: Criarcotacao;
  let fixture: ComponentFixture<Criarcotacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Criarcotacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Criarcotacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
