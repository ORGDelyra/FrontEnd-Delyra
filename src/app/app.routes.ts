import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeGuard } from './guards/home.guard';

/* ================================
   PANTALLAS DE SELECCIÓN
================================ */
import { Bienvenida } from './bienvenida/bienvenida';
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
import { ChatCliente } from './cliente/chat/chat';
import { ChatSoporteCliente } from './cliente/chat-soporte';

/* Productos y carrito (compartidos) */
import { ListarProductos } from './productos/listar/listar';
import { ListarCarrito } from './carrito/listar/listar';
import { PerfilTienda } from './tienda/perfil/perfil';

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
import { ChatDomiciliario } from './domiciliario/chat/chat';

/* ================================
   ADMINISTRADOR
================================ */
import { InicioAdmin } from './admin/inicio/inicio';
import { UsuariosAdmin } from './admin/usuarios/usuarios';
import { CategoriasAdmin } from './admin/categorias/categorias';
import { ChatAdmin } from './admin/chat-admin/chat-admin';

/* ================================
   AYUDA Y CONFIGURACIÓN (CLIENTE)
================================ */
import { AyudaComponent } from './cliente/ayuda/ayuda';
// ...eliminado ConfiguracionComponent...



export const routes: Routes = [

  /* Selección inicial */
  { path: 'bienvenida', component: Bienvenida },
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
   { path: 'cliente/chat/:id', component: ChatCliente, canActivate: [AuthGuard] }, // Chat con vendedor
   { path: 'cliente/chat-soporte', component: ChatSoporteCliente, canActivate: [AuthGuard] }, // Chat con soporte
   { path: 'cliente/ayuda', component: AyudaComponent, canActivate: [AuthGuard] }, // Ayuda

  /* Productos y carrito */
  { path: 'productos/listar', component: ListarProductos },
  { path: 'carrito', redirectTo: '/carrito/listar', pathMatch: 'full' },
  { path: 'carrito/listar', component: ListarCarrito, canActivate: [AuthGuard] },
  { path: 'tienda/:id', component: PerfilTienda }, // Perfil público de tienda

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
  { path: 'domiciliario/chat', component: ChatDomiciliario },

  /* Admin */
   { path: 'admin/inicio', component: InicioAdmin },
   { path: 'admin/usuarios', component: UsuariosAdmin },
   { path: 'admin/categorias', component: CategoriasAdmin },
   { path: 'admin/chat-soporte', component: ChatAdmin },

  /* Default */
  { path: '', redirectTo: 'bienvenida', pathMatch: 'full' }
];
