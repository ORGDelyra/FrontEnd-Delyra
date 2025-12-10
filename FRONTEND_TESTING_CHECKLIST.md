# 📋 CHECKLIST INTEGRACIÓN MERCADO PAGO - FRONTEND

## ✅ Estado: Frontend listo para testing

**Fecha:** 5 de Diciembre de 2025  
**Cambios:** Integración completa de Mercado Pago en componente carrito  
**Próximo paso:** Testing y commit solo cuando TODO funcione

---

## 📝 CAMBIOS REALIZADOS EN FRONTEND

### 1. **Pipe de Moneda Colombiana**
- ✅ Creado: `src/app/pipes/moneda-colombiana.pipe.ts`
- ✅ Uso: `{{ valor | monedaColombia }}`
- ✅ Formato: Convierte a COP con separadores de miles
- ✅ Instalado en todos los componentes que muestran precios

### 2. **Servicio Mercado Pago**
- ✅ Actualizado: `src/app/services/mercado-pago.service.ts`
- ✅ Métodos:
  - `crearPreferenciaPago()` - Crea preference en MP
  - `verificarPago()` - Verifica estado del pago
  - `procesarWebhookPago()` - Maneja webhooks
  - `cargarScriptMercadoPago()` - Carga SDK MP

### 3. **Componente Carrito (Listar)**
- ✅ Agregado: `crearPedidoParaMercadoPago()` - Crea pedido PRIMERO
- ✅ Actualizado: `iniciarPagoMercadoPago()` - Inicia pago DESPUÉS
- ✅ Flujo condicional por tipo de entrega y método de pago
- ✅ 3 flujos implementados:
  1. Domicilio + Mercado Pago → Pago online
  2. Domicilio + Contraentrega → Sin pago online
  3. Recogida en tienda → Pago en tienda

### 4. **UI Actualizada**
- ✅ Opciones de pago dinámicas según entrega
- ✅ Botones con textos diferenciados
- ✅ Info visual clara para cada método
- ✅ Precios mostrados en COP con formato correcto

### 5. **Validaciones**
- ✅ Carrito no vacío
- ✅ Dirección requerida para domicilio
- ✅ Ubicación (lat/lng) requerida
- ✅ Token de autenticación (interceptor)

---

## 🧪 TESTING CHECKLIST

### Fase 1: Validación Básica

```
☐ 1. Frontend compila sin errores
      npm run build
      
☐ 2. No hay warnings en consola al iniciar app
      Abre DevTools (F12) → Console tab
      
☐ 3. Pipe monedaColombia funciona
      Verifica que precios muestran: $1.500.000 (formato COP)
      
☐ 4. Interceptor de auth funciona
      En Network → verifica que requests llevan Authorization header
```

### Fase 2: Flujo Domicilio + Mercado Pago

```
☐ 1. Crear carrito con productos
      - Agregaproductos al carrito
      - Verifica que se ven precios en COP
      
☐ 2. Seleccionar tipo de entrega
      - Selecciona: "A domicilio"
      - Verifica que aparecen opciones de pago: MP, Contraentrega, etc.
      
☐ 3. Ingresar dirección
      - Permite seleccionar ubicación en mapa
      - Marca "Domicilio" si es necesario
      - Dirección y coordenadas se cargan
      
☐ 4. Seleccionar "Mercado Pago"
      - Radio button se marca
      - Aparece info azul: "Pagarás de forma segura..."
      - Botón cambia a "Proceder al Pago"
      
☐ 5. Click en "Proceder al Pago"
      - Frontend crea pedido en backend
      - Backend retorna pedido ID
      - Frontend inicia preferencia de MP
      - Backend retorna init_point
      - Redirecciona a: https://www.mercadopago.com/checkout/...
      
☐ 6. En Mercado Pago
      - Formulario de pago visible
      - Ingresa tarjeta: 4111111111111111
      - Ingresa CVV: 123, Vencimiento: 11/25
      - Click "Pagar"
      
☐ 7. Después de pagar (ÉXITO)
      - Si aprobado: Redirecciona a /cliente/pedidos?payment=success
      - Mensaje: "✅ Pago aprobado"
      - Pedido se ve en lista de pedidos
      
☐ 8. Verificar BD en backend
      - Estado del pedido: "pago_confirmado"
      - estado_pago: "confirmado"
      - mercado_pago_preference_id: se guardó
      - fecha_pago_confirmado: tiene timestamp
```

### Fase 3: Flujo Domicilio + Contraentrega

```
☐ 1. Crear nuevo carrito
      
☐ 2. Seleccionar: Domicilio + Contraentrega
      - Info verde: "Pagarás en efectivo cuando recibas..."
      
☐ 3. Click "Realizar Pedido"
      - NO redirige a MP
      - Redirige a /cliente/pedidos
      - Pedido estado: "pendiente" (esperando domiciliario)
      - Estado pago: "pendiente"
```

### Fase 4: Flujo Recogida en Tienda

```
☐ 1. Crear nuevo carrito

☐ 2. Seleccionar: Recogida en tienda
      - NO aparece opción de dirección
      - Opciones de pago: solo Efectivo, Tarjeta
      - NO aparece Mercado Pago
      
☐ 3. Click "Realizar Pedido"
      - Pedido se crea
      - Estado: "listo_para_recoger"
      - Sin pago online
```

### Fase 5: Manejo de Errores

```
☐ 1. Sin token de autenticación
      - Request falla con 401
      - Mensaje: "No autenticado"
      
☐ 2. Carrito vacío
      - Botón deshabilitado
      - Mensaje: "Tu carrito está vacío"
      
☐ 3. Sin dirección (domicilio)
      - Botón deshabilitado
      - Mensaje: "Por favor ingresa dirección"
      
☐ 4. Sin coordenadas (domicilio)
      - Botón deshabilitado
      - Mensaje: "Por favor permite acceso a ubicación"
      
☐ 5. Error en backend al crear pedido
      - Mensaje de error visible
      - No redirige a MP
      
☐ 6. Error en backend al crear preferencia
      - Mensaje de error visible
      - No redirige a MP
```

### Fase 6: Testing de Tarjetas (en Mercado Pago)

```
☐ 1. Tarjeta APROBADA
      Número: 4111111111111111
      CVV: 123, Vencimiento: 11/25
      Resultado: ✅ Pago aprobado, redirige a success
      
☐ 2. Tarjeta RECHAZADA
      Número: 4000000000000002
      CVV: 123, Vencimiento: 11/25
      Resultado: ❌ Pago rechazado, redirige a failure
      
☐ 3. Tarjeta PENDIENTE
      Número: 4000000000000069
      CVV: 123, Vencimiento: 11/25
      Resultado: ⏳ Pago pendiente, redirige a pending
```

### Fase 7: Verificación Final

```
☐ 1. Logs del navegador (Console)
      - Sin errores rojos (errors)
      - Warnings pueden aparecer pero no bloquean
      
☐ 2. Logs del servidor (backend laravel.log)
      - Aparece: "Mercado Pago - Preferencia creada"
      - Aparece: "Mercado Pago - Webhook recibido"
      - Aparece: "Mercado Pago - Pago confirmado" (si aprobado)
      
☐ 3. Base de datos
      - Tabla pedidos tiene nuevos campos MP
      - Pedidos con MP tienen todos los campos poblados
      
☐ 4. Interfaz visual
      - Precios muestran en formato COP: $1.500.000
      - No hay "$" mezclados o formatos raros
      - Botones responden bien
      - Mensajes de error/éxito visibles
```

---

## 🚨 PROBLEMAS COMUNES

### "Unauthorized" en crear preferencia
- **Causa:** Token no se envía o está expirado
- **Solución:** Verifica que localStorage tiene 'token'
- **Debug:** En Network → Headers → Authorization debe estar presente

### "Pedido no encontrado" en MP
- **Causa:** El pedido no se creó o ID es incorrecto
- **Solución:** Verifica respuesta de /api/cart/crear-pedido
- **Debug:** En Console, revisa `resultado.id`

### No redirecciona a Mercado Pago
- **Causa:** init_point vacío o respuesta incompleta
- **Solución:** Verifica respuesta de /api/mercado-pago/crear-preferencia
- **Debug:** Agrega console.log(respuesta) antes de redirect

### Montos incorrectos en MP
- **Causa:** No está en COP o tiene decimales
- **Solución:** Asegurar que `Math.round()` está en precios
- **Debug:** Verifica que unit_price es entero en request

---

## ✅ CUANDO TODO FUNCIONE

Una vez que TODOS los tests pasen:

```bash
# 1. Ver cambios
git status

# 2. Agregar todos los cambios
git add .

# 3. Crear commit detallado
git commit -m "feat: implementación completa de Mercado Pago en frontend

- Agregado pipe MonedaColombiana para formatear COP
- Actualizado MercadoPagoService con flujos correctos
- Integrado en componente ListarCarrito
- Implementados 3 flujos de pago según tipo de entrega:
  * Domicilio + Mercado Pago (pago online)
  * Domicilio + Contraentrega (sin MP)
  * Recogida en tienda (pago local)
- Actualizado UI con opciones dinámicas
- Precios en COP con formato correcto
- Validaciones de seguridad (autenticación, direcciones)
- Manejo de errores robusto"

# 4. Push a rama
git push origin rama-daniel

# 5. Notificar backend que está listo
```

---

## 📞 PASOS SIGUIENTES

1. **Testing completo** (usar checklist arriba)
2. **Comunicar con backend** que MP está listo
3. **Mergear rama-daniel a main** (cuando esté validado)
4. **Deployment a Railway**
5. **Configurar webhooks en prod**

---

**Documento versión 1.0**  
**Frontend - Integración Mercado Pago**  
**Estado: ✅ Listo para Testing**
