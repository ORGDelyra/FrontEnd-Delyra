# Integración de Mercado Pago (Frontend listo) – Guía para Backend

> Objetivo: habilitar pagos online con Mercado Pago para Colombia (COP) usando Checkout Pro. Frontend ya consume endpoints; este documento es para que el backend complete la integración. **Si no es estrictamente necesario, no crear nuevas tablas: reutilizar campos/estructuras existentes y extender la tabla de pedidos**.

## Moneda
- Toda la integración es en **COP (Pesos Colombianos)**.
- En preferencias MP usar `currency_id: "COP"` y valores en pesos (enteros), sin decimales.

## Endpoints requeridos (Laravel)
Implementar bajo `/api/mercado-pago`:
1) `POST /crear-preferencia`
   - Request ejemplo (frontend):
   ```json
   {
     "pedidoId": 123,
     "items": [
       { "id": "SKU-1", "title": "Producto 1", "quantity": 2, "unit_price": 50000 }
     ],
     "total": 100000,
     "cliente": { "nombre": "Juan", "email": "cliente@test.com", "telefono": "3001234567" }
   }
   ```
   - Respuesta esperada:
   ```json
   { "id": "<preference_id>", "init_point": "https://www.mercadopago.com/..." }
   ```

2) `GET /verificar/{preference_id}`
   - Retorna estado del pago (`approved | pending | rejected`) y detalles relevantes.

3) `POST /webhook`
   - Recibe notificaciones de MP (`payment.created`, `payment.updated`).
   - Validar firma, consultar pago y actualizar estado del pedido.

## Campos sugeridos en tabla pedidos (reutilizar sin crear tablas nuevas si es posible)
Agregar/usar columnas en `pedidos`:
- `mercado_pago_preference_id` (string, nullable)
- `estado_pago` enum: `pendiente`, `confirmado`, `rechazado` (default `pendiente`)
- `metodo_pago` string: `mercado_pago`, `contraentrega`, `local`
- `fecha_pago_confirmado` timestamp nullable

Si ya tienes campos similares, reutilizarlos y solo agrega los faltantes. Evita tablas nuevas salvo que sea imprescindible.

## Flujo según tipo de entrega (ya implementado en frontend)
1) **Domicilio + Mercado Pago (online)**
   - Frontend llama `crear-preferencia`, redirige a `init_point`.
   - Webhook actualiza pedido a `pago_confirmado` si procede.
2) **Domicilio + Contraentrega**
   - Pedido se crea sin pago online, estado `pendiente_pago` (o equivalente).
3) **Recogida en tienda**
   - Pedido se crea para pago en tienda, sin flujo online.

## URLs de retorno (configurar en preferencia)
- Dev: `http://localhost:4200/cliente/pedidos?payment=success|failure|pending`
- Prod: `https://delyra.app/cliente/pedidos?payment=success` y `https://delyra.app/carrito?payment=failure|pending`

## Credenciales de prueba (Test mode)
- Public Key: `APP_USR-2a39692b-dfd9-465b-a4b0-4b4955219ecc`
- Access Token: `APP_USR-6254927304314018-120520-4df7d03808f8a4ec56cb4e4db8d953fe-3044195162`
(Access Token solo en backend)

## Pasos backend recomendados
- Crear servicio Laravel para hablar con MP usando Access Token.
- En `crear-preferencia`: registrar/actualizar pedido en BD (estado pago `pendiente`), construir `items` en COP y devolver `init_point` al frontend.
- En `webhook`: validar notificación, consultar pago, actualizar `estado_pago` y `fecha_pago_confirmado`; opcionalmente notificar al cliente.
- En `verificar`: exponer estado consultando a MP y/o BD.
- Manejar reintentos y logs de transacciones.

## Webhook en Mercado Pago
Configurar en panel MP:
- URL: `https://backend-delyra-production.up.railway.app/api/mercado-pago/webhook`
- Eventos: `payment` (created/updated)

## Testing manual (test mode)
- Tarjeta Visa prueba: 4111111111111111, CVV 123, vencimiento 11/25
- Flujo: crear pedido domicilio + Mercado Pago, redirigir a MP, pagar con tarjeta de prueba, verificar webhook y estado del pedido.

## Seguridad
- Access Token solo en backend.
- Validar firma de webhook y consultar pago antes de confiar en el estado.
- Rate limiting en endpoints MP.

## Nota final
- **Priorizar reutilizar la tabla de pedidos** añadiendo campos mínimos.
- **No crear tablas nuevas** salvo que sea estrictamente necesario para auditoría o logs.
