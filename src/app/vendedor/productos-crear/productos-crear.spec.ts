import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosCrear } from './productos-crear';

describe('ProductosCrear', () => {
  let component: ProductosCrear;
  let fixture: ComponentFixture<ProductosCrear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosCrear]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosCrear);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
