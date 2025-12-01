import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

/* ================================
   PANTALLAS DE SELECCIÓN
================================ */
import { SeleccionRol } from './seleccion-rol/seleccion-rol';
import { SeleccionInicio } from './seleccion-inicio/seleccion-inicio';
import { SeleccionRegistro } from './seleccion-registro/seleccion-registro';

/* ================================
   AUTENTICACIÓN (COMPARTIDO)
================================ */
import { InicioSesion } from './auth/inicio-sesion/inicio-sesion';

/* ================================
   CLIENTE (COMPRADOR)
================================ */
import { RegistroCliente } from './cliente/registro/registro';
import { InicioCliente } from './cliente/inicio/inicio';
import { PerfilCliente } from './cliente/perfil/perfil';
import { PedidosCliente } from './cliente/pedidos/pedidos';

/* Productos y carrito (compartidos) */
import { ListarProductos } from './productos/listar/listar';
import { ListarCarrito } from './carrito/listar/listar';

/* ================================
   VENDEDOR (NEGOCIO)
================================ */
import { RegistroVendedor } from './vendedor/registro/registro';
import { InicioVendedor } from './vendedor/inicio/inicio';
import { PerfilVendedor } from './vendedor/perfil/perfil';
import { SucursalVendedor } from './vendedor/sucursal/sucursal';
import { PedidosVendedor } from './vendedor/pedidos/pedidos';

import { ProductosVendedor } from './vendedor/productos/productos';
import { CrearProductoVendedor } from './vendedor/productos-crear/productos-crear';
import { EditarProductoVendedor } from './vendedor/productos-editar/productos-editar';

/* ================================
   DOMICILIARIO (REPARTIDOR)
================================ */
import { RegistroDomiciliario } from './domiciliario/registro/registro';
import { InicioDomiciliario } from './domiciliario/inicio/inicio';
import { PerfilDomiciliario } from './domiciliario/perfil/perfil';
import { VehiculoDomiciliario } from './domiciliario/vehiculo/vehiculo';
import { PedidosDomiciliario } from './domiciliario/pedidos/pedidos';

/* ================================
   ADMINISTRADOR
================================ */
import { InicioAdmin } from './admin/inicio/inicio';
import { UsuariosAdmin } from './admin/usuarios/usuarios';
import { CategoriasAdmin } from './admin/categorias/categorias';



export const routes: Routes = [

  /* Selección inicial */
  { path: 'seleccionar-rol', component: SeleccionRol },
  { path: 'seleccionar-inicio', component: SeleccionInicio },
  { path: 'seleccionar-registro', component: SeleccionRegistro },

  /* Autenticación (compartido) */
  { path: 'inicio-sesion', component: InicioSesion },
  // Rutas legacy para compatibilidad (redirigen al componente único)
  { path: 'cliente/inicio-sesion', redirectTo: '/inicio-sesion', pathMatch: 'full' },
  { path: 'vendedor/inicio-sesion', redirectTo: '/inicio-sesion', pathMatch: 'full' },
  { path: 'domiciliario/inicio-sesion', redirectTo: '/inicio-sesion', pathMatch: 'full' },

  /* Cliente */
  { path: 'cliente/registro', component: RegistroCliente },
  { path: 'cliente/inicio', component: InicioCliente, canActivate: [AuthGuard] },
  { path: 'cliente/perfil', component: PerfilCliente, canActivate: [AuthGuard] },
  { path: 'cliente/pedidos', component: PedidosCliente, canActivate: [AuthGuard] },

  /* Productos y carrito */
  { path: 'productos/listar', component: ListarProductos },
  { path: 'carrito', component: ListarCarrito, canActivate: [AuthGuard] },

  /* Vendedor */
  { path: 'vendedor/registro', component: RegistroVendedor },
  { path: 'vendedor/inicio', component: InicioVendedor, canActivate: [AuthGuard] },
  { path: 'vendedor/perfil', component: PerfilVendedor, canActivate: [AuthGuard] },
  { path: 'vendedor/sucursal', component: SucursalVendedor, canActivate: [AuthGuard] },
  { path: 'vendedor/pedidos', component: PedidosVendedor, canActivate: [AuthGuard] },

  { path: 'vendedor/productos', component: ProductosVendedor, canActivate: [AuthGuard] },
  { path: 'vendedor/productos/crear', component: CrearProductoVendedor, canActivate: [AuthGuard] },
  { path: 'vendedor/productos/editar/:id', component: EditarProductoVendedor, canActivate: [AuthGuard] },

  /* Domiciliario */
  { path: 'domiciliario/registro', component: RegistroDomiciliario },
  { path: 'domiciliario/inicio', component: InicioDomiciliario, canActivate: [AuthGuard] },
  { path: 'domiciliario/perfil', component: PerfilDomiciliario, canActivate: [AuthGuard] },
  { path: 'domiciliario/vehiculo', component: VehiculoDomiciliario, canActivate: [AuthGuard] },
  { path: 'domiciliario/pedidos', component: PedidosDomiciliario, canActivate: [AuthGuard] },

  /* Admin */
  { path: 'admin/inicio', component: InicioAdmin, canActivate: [AuthGuard] },
  { path: 'admin/usuarios', component: UsuariosAdmin, canActivate: [AuthGuard] },
  { path: 'admin/categorias', component: CategoriasAdmin, canActivate: [AuthGuard] },

  /* Default */
  { path: '', redirectTo: 'seleccionar-rol', pathMatch: 'full' }
];
