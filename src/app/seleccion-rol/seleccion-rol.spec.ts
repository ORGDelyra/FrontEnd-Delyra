import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionRol } from './seleccion-rol';

describe('SeleccionRol', () => {
  let component: SeleccionRol;
  let fixture: ComponentFixture<SeleccionRol>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionRol]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionRol);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
