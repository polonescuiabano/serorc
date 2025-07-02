import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Eventograma } from './eventograma';

describe('Eventograma', () => {
  let component: Eventograma;
  let fixture: ComponentFixture<Eventograma>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Eventograma]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Eventograma);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
