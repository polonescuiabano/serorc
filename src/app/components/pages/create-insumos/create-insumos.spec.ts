import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateInsumos } from './create-insumos';

describe('CreateInsumos', () => {
  let component: CreateInsumos;
  let fixture: ComponentFixture<CreateInsumos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateInsumos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateInsumos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
