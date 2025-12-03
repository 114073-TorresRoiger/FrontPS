# Sistema de Notificaciones - Documentación

## Descripción General

Se ha implementado un sistema de notificaciones completo que permite:
- **Notificaciones en el sidebar**: Campanita con badge que muestra el número de notificaciones no leídas
- **Modal de notificaciones**: Panel lateral que muestra todas las notificaciones con detalles
- **Badge de mensajes no leídos**: Indicador en el botón flotante de chat

## Componentes Implementados

### 1. Modelos de Datos
**Archivo**: `src/app/domain/notificaciones/notificacion.model.ts`

```typescript
export type TipoNotificacion = 'NUEVA_SOLICITUD' | 'TRABAJO_FINALIZADO' | 'MENSAJE_NUEVO';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  idRelacionado?: number;
  urlAccion?: string;
}
```

### 2. Servicio de Notificaciones
**Archivo**: `src/app/data/notificaciones/notificacion.service.ts`

Proporciona:
- `notificaciones`: Signal con array de notificaciones
- `notificacionesNoLeidas`: Signal con contador
- `mensajesNoLeidos`: Signal con contador de mensajes
- Métodos CRUD para notificaciones

### 3. Componente Modal
**Archivo**: `src/app/shared/components/notificaciones-modal/`

Modal lateral deslizante con:
- Lista de notificaciones con iconos por tipo
- Badge "NUEVA" para notificaciones no leídas
- Botón para marcar todas como leídas
- Botón para eliminar notificaciones individuales
- Navegación al hacer clic (si tiene urlAccion)

## Integración en la Aplicación

### En Home Page

1. **Botón en Sidebar** (líneas 61-67 de home.page.html):
```html
<button class="nav-item" (click)="notificacionesModal.toggle()">
  <lucide-angular [img]="Bell" size="20"></lucide-angular>
  <span>Notificaciones</span>
  <span *ngIf="notificacionService.notificacionesNoLeidas() > 0" class="nav-badge">
    {{ notificacionService.notificacionesNoLeidas() }}
  </span>
</button>
```

2. **Badge en Chat Flotante** (línea 35 de home.page.html):
```html
<button class="floating-chat-btn" (click)="goToChat()">
  <lucide-angular [img]="MessageCircle" size="24"></lucide-angular>
  <span *ngIf="mensajesNoLeidos() > 0" class="chat-badge">{{ mensajesNoLeidos() }}</span>
</button>
```

3. **Componente Modal** (línea 554 de home.page.html):
```html
<app-notificaciones-modal #notificacionesModal></app-notificaciones-modal>
```

## Cómo Agregar Notificaciones Desde Otros Servicios

### Opción 1: Agregar notificación manualmente

```typescript
import { NotificacionService } from '@data/notificaciones/notificacion.service';

export class MiServicio {
  private notificacionService = inject(NotificacionService);

  enviarSolicitud(solicitud: SolicitudRequest) {
    return this.solicitudRepository.enviarSolicitud(solicitud).pipe(
      tap(() => {
        // Agregar notificación al profesional
        this.notificacionService.agregarNotificacion({
          tipo: 'NUEVA_SOLICITUD',
          titulo: 'Nueva Solicitud Recibida',
          mensaje: `Has recibido una nueva solicitud de trabajo`,
          idRelacionado: solicitud.id,
          urlAccion: '/profesional/solicitudes'
        });
      })
    );
  }
}
```

### Opción 2: Polling periódico (recomendado para producción)

En `home.page.ts` o en un servicio global:

```typescript
ngOnInit(): void {
  // Cargar notificaciones cada 30 segundos
  interval(30000).subscribe(() => {
    this.loadNotificaciones();
  });
}

private loadNotificaciones(): void {
  const user = this.authService.getCurrentUser();
  if (!user?.id) return;
  
  this.notificacionService.cargarNotificaciones(user.id).subscribe();
}
```

### Opción 3: WebSockets (ideal para tiempo real)

Cuando el backend implemente WebSockets para notificaciones en tiempo real:

```typescript
export class NotificacionService {
  private wsConnection: WebSocket;

  conectarWebSocket(userId: number): void {
    this.wsConnection = new WebSocket(`ws://api.tuoficio.com/notifications/${userId}`);
    
    this.wsConnection.onmessage = (event) => {
      const notificacion = JSON.parse(event.data);
      this.agregarNotificacion(notificacion);
    };
  }
}
```

## Estilos Personalizados

### Badge de Chat (home.page.scss)
```scss
.chat-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  animation: badge-pulse 2s infinite;
}
```

### Badge del Sidebar (home.page.scss)
```scss
.nav-badge {
  position: absolute;
  right: 1rem;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}
```

## Tipos de Notificaciones

### NUEVA_SOLICITUD
- **Para**: Profesionales
- **Cuándo**: Un cliente envía una nueva solicitud
- **Icono**: FileText (naranja)
- **Acción**: Navegar a `/profesional/solicitudes`

### TRABAJO_FINALIZADO
- **Para**: Clientes y Profesionales
- **Cuándo**: Un trabajo es marcado como finalizado
- **Icono**: CheckCircle (verde)
- **Acción**: Navegar a `/trabajos/finalizados`

### MENSAJE_NUEVO
- **Para**: Usuarios con mensajes sin leer
- **Cuándo**: Reciben un nuevo mensaje en el chat
- **Icono**: MessageSquare (morado)
- **Acción**: Navegar a `/chat`

## Integración con Backend (Pendiente)

### Endpoints Necesarios

1. **GET /api/notificaciones/usuario/{idUsuario}**
   - Retorna todas las notificaciones del usuario
   - Response: `NotificacionResponse[]`

2. **PUT /api/notificaciones/{id}/leer**
   - Marca una notificación como leída
   - Response: `void`

3. **PUT /api/notificaciones/usuario/{idUsuario}/leer-todas**
   - Marca todas las notificaciones como leídas
   - Response: `void`

4. **DELETE /api/notificaciones/{id}**
   - Elimina una notificación
   - Response: `void`

### Ejemplo de Implementación Backend (Spring Boot)

```java
@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {
    
    @Autowired
    private NotificacionService notificacionService;
    
    @GetMapping("/usuario/{idUsuario}")
    public List<NotificacionResponse> obtenerNotificaciones(@PathVariable Long idUsuario) {
        return notificacionService.obtenerPorUsuario(idUsuario);
    }
    
    @PostMapping
    public NotificacionResponse crearNotificacion(@RequestBody NotificacionRequest request) {
        return notificacionService.crear(request);
    }
    
    @PutMapping("/{id}/leer")
    public void marcarComoLeida(@PathVariable Long id) {
        notificacionService.marcarComoLeida(id);
    }
}
```

## Estado Actual

### Notificaciones de Trabajos y Solicitudes (Temporal)

Actualmente, el sistema funciona con **datos simulados** hasta que el backend implemente los endpoints:

```typescript
private simularNotificaciones(idUsuario: number): Observable<Notificacion[]> {
  const notificacionesEjemplo: Notificacion[] = [
    {
      id: 1,
      tipo: 'NUEVA_SOLICITUD',
      titulo: 'Nueva Solicitud Recibida',
      mensaje: 'Has recibido una nueva solicitud de trabajo',
      fecha: new Date(Date.now() - 3600000),
      leida: false,
      urlAccion: '/profesional/solicitudes'
    }
  ];
  return of(notificacionesEjemplo);
}
```

### Notificaciones de Chat (En Tiempo Real) ✅

Las notificaciones de chat **ya están integradas** con Stream Chat y funcionan en tiempo real:

#### Características Implementadas:

1. **Contador por Usuario**: Cada usuario ve únicamente sus mensajes no leídos
2. **Actualización en Tiempo Real**: 
   - Se actualiza automáticamente cuando llega un nuevo mensaje
   - Se reduce cuando el usuario abre y lee una conversación
   - Escucha eventos de Stream Chat (`message.new`, `message.read`)
3. **Integración Completa**:
   - `home.page.ts`: Carga inicial del contador y listeners de eventos
   - `chat.page.ts`: Actualiza el contador al marcar conversaciones como leídas
   - `stream-chat.service.ts`: Proporciona acceso a los canales y mensajes

#### Cómo Funciona:

```typescript
// En home.page.ts - Cargar mensajes no leídos al iniciar
async loadMensajesNoLeidos(): Promise<void> {
  const chatClient = this.streamChatService.getChatClient();
  const channels = await this.streamChatService.getUserChannels();
  
  let totalUnread = 0;
  for (const channel of channels) {
    totalUnread += channel.countUnread();
  }
  
  this.mensajesNoLeidos.set(totalUnread);
  this.notificacionService.actualizarMensajesNoLeidos(totalUnread);
  
  // Escuchar nuevos mensajes
  this.setupMessageListeners(channels);
}

// Listeners de eventos en tiempo real
private setupMessageListeners(channels: any[]): void {
  channels.forEach(channel => {
    // Incrementar al recibir mensaje nuevo
    channel.on('message.new', (event: any) => {
      if (event.user?.id !== this.streamChatService.getCurrentUserId()) {
        const currentCount = this.mensajesNoLeidos();
        this.mensajesNoLeidos.set(currentCount + 1);
      }
    });
    
    // Actualizar al leer mensajes
    channel.on('message.read', () => {
      this.loadMensajesNoLeidos();
    });
  });
}
```

```typescript
// En chat.page.ts - Actualizar al abrir conversación
async openChannel(channel: Channel): Promise<void> {
  this.selectedChannel = channel;
  await this.loadMessages();
  await this.updateUnreadCount(); // Actualiza el contador global
}

private async updateUnreadCount(): Promise<void> {
  const channels = await this.chatService.getUserChannels();
  let totalUnread = 0;
  
  for (const channel of channels) {
    totalUnread += channel.countUnread();
  }
  
  this.notificacionService.actualizarMensajesNoLeidos(totalUnread);
}
```

#### Ventajas de la Implementación:

- ✅ **Sin Backend Adicional**: Usa la infraestructura de Stream Chat
- ✅ **Tiempo Real**: Notificaciones instantáneas sin polling
- ✅ **Por Usuario**: Cada usuario ve solo sus mensajes no leídos
- ✅ **Sincronizado**: El contador se actualiza automáticamente en todas las vistas
- ✅ **Eficiente**: No requiere consultas adicionales al backend

## Testing

### Probar Notificaciones
1. Iniciar sesión en la aplicación
2. Abrir el sidebar (botón izquierdo del navbar)
3. Hacer clic en "Notificaciones" (icono de campanita)
4. Ver el badge rojo con el número de notificaciones no leídas
5. El modal debe aparecer desde la derecha con las notificaciones
6. Hacer clic en una notificación para navegae a su acción

### Probar Badge de Chat
1. Ver el botón flotante de chat (abajo a la derecha)
2. Debería mostrar un badge rojo con el número "3"
3. El badge debe tener una animación de pulso

## Próximos Pasos

1. **Backend**: Implementar endpoints de notificaciones
2. **WebSockets**: Agregar soporte para notificaciones en tiempo real
3. **Push Notifications**: Implementar notificaciones push del navegador
4. **Persistencia**: Guardar preferencias de notificaciones del usuario
5. **Filtros**: Permitir filtrar notificaciones por tipo
6. **Historial**: Implementar paginación para notificaciones antiguas

## Archivos Modificados

- ✅ `src/app/domain/notificaciones/notificacion.model.ts` (nuevo)
- ✅ `src/app/data/notificaciones/notificacion.service.ts` (nuevo)
- ✅ `src/app/shared/components/notificaciones-modal/` (nuevo)
  - `notificaciones-modal.component.ts`
  - `notificaciones-modal.component.html`
  - `notificaciones-modal.component.scss`
- ✅ `src/app/features/home/home.page.ts` (modificado)
- ✅ `src/app/features/home/home.page.html` (modificado)
- ✅ `src/app/features/home/home.page.scss` (modificado)
