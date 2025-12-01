import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionInicio } from './seleccion-inicio';

describe('SeleccionInicio', () => {
  let component: SeleccionInicio;
  let fixture: ComponentFixture<SeleccionInicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionInicio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionInicio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
