import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateComp } from './create-comp';

describe('CreateComp', () => {
  let component: CreateComp;
  let fixture: ComponentFixture<CreateComp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateComp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateComp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
