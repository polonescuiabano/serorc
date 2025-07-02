import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopbarListacomp } from './topbar-listacomp';

describe('TopbarListacomp', () => {
  let component: TopbarListacomp;
  let fixture: ComponentFixture<TopbarListacomp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarListacomp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopbarListacomp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
