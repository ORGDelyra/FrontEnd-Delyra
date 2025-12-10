# Backend CORS - Configuración por defecto (Sin cambios)

## El problema
Frontend está en `https://delyra.vercel.app` y backend en `https://backend-delyra-production.up.railway.app`.

Para que funcione **sin tocar CORS en absoluto**, el backend debe tener CORS habilitado **por defecto** en Laravel.

## Solución - Lo que debe tener el backend (sin cambios)

### 1️⃣ Verificar que Laravel 11+ tiene CORS habilitado por defecto

En versiones recientes de Laravel (11+), CORS viene habilitado automáticamente en:

```php
// config/cors.php (ya existe, solo verificar que está así)

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],  // ✅ Permite TODOS los orígenes
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

### 2️⃣ Si Laravel es versión antigua (10 o anterior)

Instalar el package de CORS:

```bash
composer require fruitcake/laravel-cors
```

Y en `config/cors.php`:

```php
'allowedOrigins' => ['*'],  // Permite todos los orígenes
'allowedMethods' => ['*'],
'allowedHeaders' => ['*'],
'supportsCredentials' => false,
```

### 3️⃣ Middleware debe estar registrado en `app/Http/Kernel.php`

```php
protected $middleware = [
    // ...
    \Illuminate\Http\Middleware\HandleCors::class,  // ✅ Debe estar
];
```

O en Kernel.php moderno:

```php
protected $middlewareGroups = [
    'api' => [
        \Illuminate\Http\Middleware\HandleCors::class,  // ✅ O aquí
        // ... otros middleware
    ],
];
```

## ✅ Verificar que CORS funciona

Desde el navegador en `https://delyra.vercel.app`, abre DevTools (F12) y:

1. Ve a pestaña **Network**
2. Intenta hacer login
3. Busca la petición POST a `/api/inicio/sesion`
4. Mira los Response Headers:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: *
   ```

Si ves estos headers, CORS está funcionando ✅

## ⚠️ Si aún no funciona

1. **Limpiar cache:**
   ```bash
   php artisan config:cache
   php artisan cache:clear
   ```

2. **Redeploy en Railway:**
   - Push a rama main/master
   - Railway redeploy automáticamente

3. **Revisar logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

## Resumen
**Frontend:** Usa `https://backend-delyra-production.up.railway.app` (ya configurado ✅)
**Backend:** Debe tener CORS habilitado POR DEFECTO (sin cambios especiales)

Si Laravel 11+ está bien instalado, debería funcionar sin hacer nada.
