import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilTienda } from './perfil';

describe('PerfilTienda', () => {
  let component: PerfilTienda;
  let fixture: ComponentFixture<PerfilTienda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilTienda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilTienda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
