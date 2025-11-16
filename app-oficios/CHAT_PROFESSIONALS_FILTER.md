# Filtrado de Profesionales en Chat por Solicitudes

## 📋 Resumen de Cambios

Se ha modificado el sistema de chat para que en el modal de selección de profesionales, **solo se muestren los profesionales a los que el usuario ha enviado solicitudes**, en lugar de mostrar todos los profesionales disponibles.

## 🎯 Objetivo

Mejorar la experiencia de usuario mostrando únicamente profesionales con los que ya existe una relación establecida mediante solicitudes enviadas.

---

## 🔧 Cambios Implementados

### 1. **Modelo de Datos** (`solicitud.model.ts`)

Se añadió una nueva interfaz `SolicitudConProfesional` que contiene información combinada de la solicitud y el profesional:

```typescript
export interface SolicitudConProfesional {
  idSolicitud: number;
  idProfesional: number;
  nombreProfesional: string;
  apellidoProfesional: string;
  especialidad: string;
  fechaSolicitud: string;
  estado: string;
  imagenUrl?: string;
}
```

**Campos importantes:**
- `idSolicitud`: ID de la solicitud
- `idProfesional`: ID del profesional (usado para crear el canal de chat)
- `nombreProfesional`, `apellidoProfesional`: Nombre completo del profesional
- `especialidad`: Especialidad del profesional
- `estado`: Estado de la solicitud (pendiente, aceptada, rechazada, en-proceso)
- `fechaSolicitud`: Fecha en que se envió la solicitud
- `imagenUrl`: URL de la imagen del profesional (opcional)

---

### 2. **Repository** (`solicitud.repository.ts` y `solicitud.http.repository.ts`)

Se añadió un nuevo método para obtener las solicitudes de un usuario:

```typescript
// Interface del repositorio
abstract getSolicitudesByUsuario(idUsuario: number): Observable<SolicitudConProfesional[]>;

// Implementación HTTP
getSolicitudesByUsuario(idUsuario: number): Observable<SolicitudConProfesional[]> {
  return this.http.get<SolicitudConProfesional[]>(`${this.baseUrl}/usuario/${idUsuario}`);
}
```

**Endpoint del backend:**
```
GET /api/v1/solicitudes/usuario/{idUsuario}
```

---

### 3. **Componente Modal** (`professional-selection-modal.component.ts`)

#### Cambios principales:

**Antes:**
- Usaba `ChatRepository.getAvailableProfessionals()` para obtener todos los profesionales
- Trabajaba con el modelo `Professional`

**Después:**
- Usa `SolicitudRepository.getSolicitudesByUsuario()` para obtener solo profesionales con solicitudes
- Trabaja con el modelo `SolicitudConProfesional`
- Recibe el `userId` como Input desde el componente padre

```typescript
export class ProfessionalSelectionModalComponent implements OnInit {
  private readonly solicitudRepository = inject(SolicitudRepository);

  @Input() userId: string | null = null;
  @Output() professionalSelected = new EventEmitter<ProfessionalForChat>();
  
  solicitudes: SolicitudConProfesional[] = [];

  async loadProfessionalsFromSolicitudes(): Promise<void> {
    if (!this.userId) return;

    this.solicitudRepository.getSolicitudesByUsuario(Number(this.userId)).subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando solicitudes:', error);
        this.isLoading = false;
      },
    });
  }
}
```

**Método `selectProfessional` actualizado:**
```typescript
selectProfessional(solicitud: SolicitudConProfesional): void {
  const professional: ProfessionalForChat = {
    id: solicitud.idProfesional.toString(),
    name: `${solicitud.nombreProfesional} ${solicitud.apellidoProfesional}`,
    specialty: solicitud.especialidad,
    imageUrl: solicitud.imagenUrl,
  };
  this.professionalSelected.emit(professional);
  this.close();
}
```

---

### 4. **Template del Modal** (`professional-selection-modal.component.html`)

**Cambios en el template:**

```html
<div *ngFor="let solicitud of solicitudes" class="professional-card">
  <div class="professional-avatar">
    <img *ngIf="solicitud.imagenUrl" [src]="solicitud.imagenUrl">
    <span *ngIf="!solicitud.imagenUrl">{{ getInitial(getProfessionalName(solicitud)) }}</span>
  </div>
  
  <div class="professional-info">
    <h3>{{ getProfessionalName(solicitud) }}</h3>
    <div class="professional-specialty">{{ solicitud.especialidad }}</div>
    <div class="solicitud-status" [class]="'status-' + solicitud.estado.toLowerCase()">
      Estado: {{ solicitud.estado }}
    </div>
  </div>

  <div class="solicitud-date">
    {{ solicitud.fechaSolicitud | date: 'dd/MM/yyyy' }}
  </div>
</div>
```

**Estado vacío mejorado:**
```html
<div *ngIf="solicitudes.length === 0" class="empty-state">
  <p>No tienes solicitudes enviadas</p>
  <p class="empty-subtitle">Envía una solicitud a un profesional para poder iniciar una conversación</p>
</div>
```

---

### 5. **Estilos** (`professional-selection-modal.component.scss`)

Se añadieron estilos para los nuevos elementos:

```scss
// Avatar con soporte para imágenes
.professional-avatar {
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// Badge de estado de solicitud con colores dinámicos
.solicitud-status {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  margin-top: 4px;

  &.status-pendiente {
    background: #fef3c7;
    color: #92400e;
  }

  &.status-aceptada,
  &.status-aprobada {
    background: #d1fae5;
    color: #059669;
  }

  &.status-rechazada {
    background: #fee2e2;
    color: #dc2626;
  }

  &.status-en-proceso {
    background: #dbeafe;
    color: #1e40af;
  }
}

// Fecha de solicitud
.solicitud-date {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  white-space: nowrap;
}
```

---

### 6. **Chat Page** (`chat.page.ts` y `chat.page.html`)

Se modificó para pasar el `userId` al modal:

```typescript
// Nuevo tipo para el profesional seleccionado
interface ProfessionalForChat {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
}

// Método actualizado
async onProfessionalSelected(professional: ProfessionalForChat): Promise<void> {
  // ... lógica para crear conversación
}
```

**Template:**
```html
<app-professional-selection-modal
  [userId]="currentUserId"
  (professionalSelected)="onProfessionalSelected($event)"
></app-professional-selection-modal>
```

---

## 🔄 Flujo de Trabajo

1. Usuario autenticado abre el chat
2. Chat Page obtiene el `userId` del `AuthService`
3. Usuario hace clic en "Nueva conversación"
4. Se abre el modal que automáticamente carga las solicitudes del usuario
5. Se hace una petición `GET /api/v1/solicitudes/usuario/{userId}`
6. Se muestran solo los profesionales con solicitudes existentes
7. Usuario selecciona un profesional
8. Se crea el canal de chat con ese profesional

---

## 📡 Endpoint Requerido en el Backend

El backend debe implementar el siguiente endpoint:

```
GET /api/v1/solicitudes/usuario/{idUsuario}
```

**Respuesta esperada:**
```json
[
  {
    "idSolicitud": 1,
    "idProfesional": 123,
    "nombreProfesional": "Juan",
    "apellidoProfesional": "Pérez",
    "especialidad": "Plomería",
    "fechaSolicitud": "2024-01-15",
    "estado": "aceptada",
    "imagenUrl": "https://example.com/profile/123.jpg"
  },
  {
    "idSolicitud": 2,
    "idProfesional": 456,
    "nombreProfesional": "María",
    "apellidoProfesional": "González",
    "especialidad": "Electricidad",
    "fechaSolicitud": "2024-01-18",
    "estado": "pendiente",
    "imagenUrl": null
  }
]
```

---

## ✅ Beneficios

1. **Mejor UX**: Solo se muestran profesionales relevantes
2. **Contexto claro**: Se ve el estado y fecha de cada solicitud
3. **Información visual**: Soporte para imágenes de perfil
4. **Estado vacío mejorado**: Mensaje claro cuando no hay solicitudes
5. **Filtrado automático**: No requiere búsqueda manual

---

## 🧪 Pruebas Necesarias

1. **Usuario sin solicitudes**: Verificar que se muestre el mensaje de "No tienes solicitudes enviadas"
2. **Usuario con solicitudes**: Verificar que solo aparezcan esos profesionales
3. **Diferentes estados**: Verificar colores de badge según estado
4. **Con/sin imagen**: Verificar que se muestre inicial cuando no hay imagen
5. **Crear conversación**: Verificar que al seleccionar se cree el canal correctamente

---

## 📝 Notas Técnicas

- Se usa `Number(this.userId)` para convertir el string a número antes de llamar al repositorio
- El modal solo carga datos cuando se abre (`open()` method)
- Se mantiene compatibilidad con el resto del sistema de chat
- Los estados de solicitud se mapean a clases CSS dinámicamente

---

## 🚀 Próximos Pasos (Opcionales)

1. Añadir filtros por estado de solicitud
2. Ordenar por fecha más reciente
3. Añadir búsqueda dentro de las solicitudes
4. Mostrar contador de mensajes no leídos por profesional
5. Añadir acciones rápidas (ver perfil, cancelar solicitud, etc.)
