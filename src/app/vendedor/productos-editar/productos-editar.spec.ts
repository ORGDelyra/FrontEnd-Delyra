import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosEditar } from './productos-editar';

describe('ProductosEditar', () => {
  let component: ProductosEditar;
  let fixture: ComponentFixture<ProductosEditar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosEditar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosEditar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
