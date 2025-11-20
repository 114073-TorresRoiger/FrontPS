# Integración con Mercado Pago - Guía de Implementación

## 📋 Resumen del Flujo de Trabajo

Este documento describe la integración completa del flujo de trabajo con la pasarela de pago de Mercado Pago en Angular.

## 🔄 Flujo Completo

### 1. Creación de Solicitud
```typescript
// Endpoint: POST /api/v1/solicitudes/turnos/confirmar
// El cliente crea una solicitud de servicio
```

### 2. Creación de Trabajo
```typescript
// Endpoint: POST /api/v1/trabajos/crear/{idSolicitud}
// Se crea automáticamente un registro de trabajo
```

### 3. Inicio del Trabajo
```typescript
// Endpoint: PUT /api/v1/trabajos/iniciar/{idTrabajo}
// El profesional inicia el trabajo
```

### 4. Finalización del Trabajo
```typescript
// Endpoint: PUT /api/v1/trabajos/finalizar/{idTrabajo}
// Body: { descripcionFinalizacion: string, costoFinal: number }
// El profesional finaliza el trabajo con descripción y costo
```

### 5. Pago con Mercado Pago
```typescript
// Endpoint: POST /api/v1/pagos/crear-preferencia
// Body: { idTrabajo: number, titulo: string, descripcion: string, monto: number, cantidad?: number }
// Crea preferencia y redirige a Mercado Pago
```

## 📁 Estructura de Archivos Creados

```
src/app/
├── domain/
│   ├── trabajo/
│   │   ├── trabajo.model.ts          # Interfaces de Trabajo
│   │   ├── trabajo.repository.ts     # Abstract repository
│   │   └── trabajo.service.ts        # Servicio de dominio
│   └── pago/
│       ├── pago.model.ts             # Interfaces de Pago/Factura
│       ├── pago.repository.ts        # Abstract repository
│       └── pago.service.ts           # Servicio de dominio
├── data/
│   ├── trabajos/
│   │   └── trabajo.http.repository.ts  # Implementación HTTP
│   └── pagos/
│       └── pago.http.repository.ts     # Implementación HTTP
├── features/
│   ├── trabajos/
│   │   ├── trabajo-detalle.component.ts   # Componente de ejemplo
│   │   ├── trabajo-detalle.component.html
│   │   └── trabajo-detalle.component.scss
│   └── pagos/
│       ├── pago-exitoso/
│       │   ├── pago-exitoso.component.ts
│       │   ├── pago-exitoso.component.html
│       │   └── pago-exitoso.component.scss
│       ├── pago-fallido/
│       │   ├── pago-fallido.component.ts
│       │   ├── pago-fallido.component.html
│       │   └── pago-fallido.component.scss
│       └── pago-pendiente/
│           ├── pago-pendiente.component.ts
│           ├── pago-pendiente.component.html
│           └── pago-pendiente.component.scss
└── core/
    └── providers.ts  # Configuración de inyección de dependencias
```

## 🔧 Configuración de Providers

Los repositorios ya están configurados en `core/providers.ts`:

```typescript
{ provide: TrabajoRepository, useClass: TrabajoHttpRepository },
{ provide: PagoRepository, useClass: PagoHttpRepository },
```

## 🚀 Uso de los Servicios

### TrabajoService

```typescript
import { TrabajoService } from '@domain/trabajo/trabajo.service';

constructor(private trabajoService: TrabajoService) {}

// Crear trabajo desde solicitud
crearTrabajo(idSolicitud: number) {
  this.trabajoService.crearTrabajo(idSolicitud).subscribe({
    next: (trabajo) => console.log('Trabajo creado:', trabajo),
    error: (err) => console.error('Error:', err)
  });
}

// Iniciar trabajo
iniciarTrabajo(idTrabajo: number) {
  this.trabajoService.iniciarTrabajo(idTrabajo).subscribe({
    next: (trabajo) => console.log('Trabajo iniciado:', trabajo),
    error: (err) => console.error('Error:', err)
  });
}

// Finalizar trabajo
finalizarTrabajo(idTrabajo: number) {
  const descripcion = 'Trabajo completado satisfactoriamente';
  const costo = 5000;
  
  this.trabajoService.finalizarTrabajo(idTrabajo, descripcion, costo).subscribe({
    next: (trabajo) => console.log('Trabajo finalizado:', trabajo),
    error: (err) => console.error('Error:', err)
  });
}
```

### PagoService

```typescript
import { PagoService } from '@domain/pago/pago.service';
import { FacturaRequest } from '@domain/pago/pago.model';

constructor(private pagoService: PagoService) {}

// Opción 1: Crear preferencia y redirigir automáticamente
procesarPagoAutomatico(idTrabajo: number, monto: number) {
  const request: FacturaRequest = {
    idTrabajo: idTrabajo,
    titulo: 'Pago por servicio profesional',
    descripcion: 'Servicio completado',
    monto: monto,
    cantidad: 1
  };

  this.pagoService.crearPreferenciaYRedirigir(request).subscribe({
    next: (response) => {
      // La redirección se hace automáticamente
      console.log('Redirigiendo a Mercado Pago...', response);
    },
    error: (err) => console.error('Error:', err)
  });
}

// Opción 2: Crear preferencia y redirigir manualmente
procesarPagoManual(idTrabajo: number, monto: number) {
  const request: FacturaRequest = {
    idTrabajo: idTrabajo,
    titulo: 'Pago por servicio profesional',
    descripcion: 'Servicio completado',
    monto: monto
  };

  this.pagoService.crearPreferencia(request).subscribe({
    next: (response) => {
      console.log('Preferencia creada:', response);
      // Redirigir manualmente
      this.pagoService.redirigirAPago(response.initPoint);
    },
    error: (err) => console.error('Error:', err)
  });
}
```

## 🎯 Rutas de Retorno de Mercado Pago

Las siguientes rutas están configuradas para recibir las respuestas de Mercado Pago:

- **Pago Exitoso**: `/pago-exitoso`
- **Pago Fallido**: `/pago-fallido`
- **Pago Pendiente**: `/pago-pendiente`

Estas rutas capturan automáticamente los parámetros de la URL:
- `payment_id`: ID del pago en Mercado Pago
- `status`: Estado del pago
- `external_reference`: ID de la factura en tu sistema

## 📝 Ejemplo Completo de Integración

```typescript
import { Component, inject } from '@angular/core';
import { TrabajoService } from '@domain/trabajo/trabajo.service';
import { PagoService } from '@domain/pago/pago.service';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  template: `...`
})
export class MiComponente {
  private trabajoService = inject(TrabajoService);
  private pagoService = inject(PagoService);

  flujoCompleto(idSolicitud: number) {
    // 1. Crear trabajo
    this.trabajoService.crearTrabajo(idSolicitud).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo creado:', trabajo.id);
        
        // 2. Iniciar trabajo
        this.trabajoService.iniciarTrabajo(trabajo.id).subscribe({
          next: (trabajoIniciado) => {
            console.log('✅ Trabajo iniciado');
            
            // ... El profesional trabaja ...
            
            // 3. Finalizar trabajo
            this.trabajoService.finalizarTrabajo(
              trabajo.id,
              'Trabajo completado',
              5000
            ).subscribe({
              next: (trabajoFinalizado) => {
                console.log('✅ Trabajo finalizado');
                
                // 4. Procesar pago
                const facturaRequest = {
                  idTrabajo: trabajo.id,
                  titulo: 'Pago por servicio',
                  descripcion: 'Servicio profesional',
                  monto: trabajoFinalizado.costofinal!
                };
                
                this.pagoService.crearPreferenciaYRedirigir(facturaRequest).subscribe({
                  next: (response) => {
                    console.log('✅ Redirigiendo a Mercado Pago');
                    // Redirección automática
                  }
                });
              }
            });
          }
        });
      }
    });
  }
}
```

## 🛠️ Endpoints del Backend

### Trabajos
- `POST /api/v1/trabajos/crear/{idSolicitud}` - Crear trabajo
- `PUT /api/v1/trabajos/iniciar/{idTrabajo}` - Iniciar trabajo
- `PUT /api/v1/trabajos/pausar/{idTrabajo}` - Pausar trabajo
- `PUT /api/v1/trabajos/reanudar/{idTrabajo}` - Reanudar trabajo
- `PUT /api/v1/trabajos/finalizar/{idTrabajo}` - Finalizar trabajo
- `PUT /api/v1/trabajos/cancelar/{idTrabajo}?motivo={motivo}` - Cancelar trabajo
- `GET /api/v1/trabajos/{idTrabajo}` - Obtener trabajo
- `GET /api/v1/trabajos/solicitud/{idSolicitud}` - Obtener trabajo por solicitud
- `GET /api/v1/trabajos/profesional/{idProfesional}?estado={estado}` - Trabajos del profesional
- `GET /api/v1/trabajos/usuario/{idUsuario}?estado={estado}` - Trabajos del usuario
- `GET /api/v1/trabajos/sin-factura` - Trabajos sin factura

### Pagos
- `POST /api/v1/pagos/crear-preferencia` - Crear preferencia de pago
- `GET /api/v1/pagos/config` - Obtener configuración de Mercado Pago
- `POST /api/v1/pagos/webhook` - Webhook de Mercado Pago

## 🔒 Configuración del Backend

Asegúrate de que tu `application.yml` tenga configurado:

```yaml
mercadopago:
  access.token: ${MERCADOPAGO_ACCESS_TOKEN}
  public.key: ${MERCADOPAGO_PUBLIC_KEY}
  webhook.url: ${MERCADOPAGO_WEBHOOK_URL}
  frontend.url: ${FRONTEND_URL:http://localhost:4200}
```

Las URLs de retorno configuradas en el backend deben ser:
- Success: `${FRONTEND_URL}/pago-exitoso`
- Failure: `${FRONTEND_URL}/pago-fallido`
- Pending: `${FRONTEND_URL}/pago-pendiente`

## 🎨 Componente de Ejemplo

Se ha creado `TrabajoDetalleComponent` como ejemplo completo que incluye:

✅ Gestión completa del ciclo de vida del trabajo
✅ Modal para finalización del trabajo
✅ Modal de confirmación de pago
✅ Integración con Mercado Pago
✅ Manejo de estados y errores
✅ UI responsiva y moderna

## 📱 Estados del Trabajo

- `PENDIENTE`: Trabajo creado, esperando inicio
- `EN_PROGRESO`: Trabajo en ejecución
- `PAUSADO`: Trabajo pausado temporalmente
- `FINALIZADO`: Trabajo completado, listo para pago
- `CANCELADO`: Trabajo cancelado

## ⚠️ Consideraciones Importantes

1. **Validaciones Backend**: El backend valida que:
   - Solo trabajos FINALIZADOS pueden ser facturados
   - Un trabajo no puede tener más de una factura
   - El trabajo debe existir y estar en el estado correcto

2. **Redirección**: Cuando se crea la preferencia, el usuario es redirigido automáticamente a Mercado Pago

3. **Webhooks**: El backend recibe notificaciones de Mercado Pago y actualiza el estado de la factura

4. **Seguridad**: Los tokens de Mercado Pago deben estar en variables de entorno

## 🔍 Testing

Para probar la integración:

1. Crear una solicitud
2. Crear el trabajo desde la solicitud
3. Iniciar el trabajo
4. Finalizar el trabajo con costo
5. Procesar el pago (serás redirigido a Mercado Pago)
6. Completar el pago en Mercado Pago
7. Verificar la redirección a `/pago-exitoso`

## 📞 Soporte

Si encuentras algún problema con la integración, verifica:

- Que el backend esté corriendo en `http://localhost:8081`
- Que las credenciales de Mercado Pago estén configuradas
- Que los CORS estén habilitados en el backend
- Los logs del navegador y del backend para errores específicos
