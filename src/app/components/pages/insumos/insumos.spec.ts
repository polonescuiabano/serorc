import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Insumos } from './insumos';

describe('Insumos', () => {
  let component: Insumos;
  let fixture: ComponentFixture<Insumos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Insumos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Insumos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
