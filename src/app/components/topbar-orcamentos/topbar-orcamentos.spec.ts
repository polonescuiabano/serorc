import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopbarOrcamentos } from './topbar-orcamentos';

describe('TopbarOrcamentos', () => {
  let component: TopbarOrcamentos;
  let fixture: ComponentFixture<TopbarOrcamentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarOrcamentos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopbarOrcamentos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
