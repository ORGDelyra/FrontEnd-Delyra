import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionRegistro } from './seleccion-registro';

describe('SeleccionRegistro', () => {
  let component: SeleccionRegistro;
  let fixture: ComponentFixture<SeleccionRegistro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionRegistro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionRegistro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
