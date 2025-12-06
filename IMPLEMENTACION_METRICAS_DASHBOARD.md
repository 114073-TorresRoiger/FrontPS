# Implementación de Métricas del Dashboard Administrativo

## Resumen
Se implementaron las peticiones HTTP para obtener métricas reales desde el backend en el dashboard administrativo, reemplazando los datos mock por datos reales.

## Cambios Realizados

### 1. Modelos de Datos

#### `usuario.model.ts`
- ✅ Se agregó la interface `MetricasUsuarios`:
```typescript
export interface MetricasUsuarios {
  cantProfesionales: number;
  cantClientes: number;
}
```

#### `oficio.model.ts`
- ✅ Se actualizó el modelo `Oficio` para incluir el campo `activo`:
```typescript
export interface Oficio {
  id: number;
  oficio: string;
  descripcion?: string;  // Ahora es opcional
  activo: boolean;       // Campo agregado
}
```

### 2. Repositorios

#### `usuario.repository.ts` (Domain Layer)
- ✅ Se agregó el método abstracto:
```typescript
abstract getMetricasUsuarios(): Observable<MetricasUsuarios>;
```

#### `usuario.http.repository.ts` (Data Layer)
- ✅ Se implementó el método `getMetricasUsuarios()`:
```typescript
getMetricasUsuarios(): Observable<MetricasUsuarios> {
  return this.http.get<MetricasUsuarios>(
    `${this.baseUrl}/perfil/metrica/usuarios-registrados`
  );
}
```

### 3. Dashboard Component

#### Imports Agregados
```typescript
import { UsuarioRepository } from '../../../domain/usuario/usuario.repository';
import { OficioRepository } from '../../../domain/oficios/oficio.repository';
import { Oficio } from '../../../domain/oficios/oficio.model';
```

#### Inyección de Dependencias
```typescript
private readonly usuarioRepository = inject(UsuarioRepository);
private readonly oficioRepository = inject(OficioRepository);
```

#### Métodos Actualizados

**`cargarUsuarios()`**
- Consume el endpoint: `api/v1/perfil/metrica/usuarios-registrados`
- Actualiza `totalUsuarios` con `cantClientes`
- Actualiza `totalProfesionales` con `cantProfesionales`

**`cargarOficios()`**
- Consume el endpoint: `api/v1/oficios/all`
- Actualiza la lista de oficios
- Calcula `totalOficios` y `totalOficiosActivos`

### 4. Template HTML

#### Actualización de la Lista de Oficios
- ✅ Cambio de `oficio.nombre` a `oficio.oficio`
- ✅ Eliminación de referencias a campos que no existen en el backend (`profesionales`, `demanda`)
- ✅ Agregado de badge de estado con estilo visual

#### Modal de Edición
- ✅ Actualizado para usar `oficio.oficio` en lugar de `oficio.nombre`
- ✅ Agregado checkbox para activar/desactivar oficios

### 5. Estilos (SCSS)

Se agregaron estilos para el badge de estado:

```scss
.oficio-status {
  margin-top: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #fee;
  color: #dc2626;

  &.activo {
    background-color: #dcfce7;
    color: #16a34a;
  }
}
```

## Endpoints Consumidos

### 1. Métricas de Usuarios
```
GET /api/v1/perfil/metrica/usuarios-registrados
```

**Respuesta:**
```json
{
  "cantProfesionales": 2,
  "cantClientes": 3
}
```

### 2. Lista de Oficios
```
GET /api/v1/oficios/all
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "oficio": "GASISTA",
    "activo": true
  },
  {
    "id": 2,
    "oficio": "ELECTRICISTA",
    "activo": true
  }
]
```

## Manejo de Errores

Ambos métodos incluyen manejo de errores:

```typescript
error: (error) => {
  console.error('Error cargando métricas:', error);
  // Se establecen valores por defecto
  this.totalUsuarios.set(0);
  this.totalProfesionales.set(0);
}
```

## Arquitectura Limpia

La implementación respeta los principios de Clean Architecture:

1. **Domain Layer**: Define las interfaces y contratos
2. **Data Layer**: Implementa la comunicación HTTP
3. **Presentation Layer**: Consume los servicios a través de los repositorios

## Actualización: Listado de Usuarios y Profesionales

### Nuevas Interfaces Agregadas

#### `usuario.model.ts`
```typescript
export interface UsuarioMetrica {
  nombre: string;
  email: string;
  strikes: number;
  estado: boolean;
}

export interface ProfesionalMetrica {
  nombre: string;
  oficio: string;
  calificacion: string;
  serviciosCompletados: number;
}
```

### Nuevos Métodos en Repositorios

#### `usuario.repository.ts`
```typescript
abstract getUsuariosMetrica(limit?: number): Observable<UsuarioMetrica[]>;
abstract getProfesionalesMetrica(limit?: number): Observable<ProfesionalMetrica[]>;
```

#### `usuario.http.repository.ts`
```typescript
getUsuariosMetrica(limit?: number): Observable<UsuarioMetrica[]> {
  let params = new HttpParams();
  if (limit) {
    params = params.set('limit', limit.toString());
  }
  return this.http.get<UsuarioMetrica[]>(
    `${this.baseUrl}/perfil/metrica/usuarios`, 
    { params }
  );
}

getProfesionalesMetrica(limit?: number): Observable<ProfesionalMetrica[]> {
  let params = new HttpParams();
  if (limit) {
    params = params.set('limit', limit.toString());
  }
  return this.http.get<ProfesionalMetrica[]>(
    `${this.baseUrl}/perfil/metrica/profesionales`, 
    { params }
  );
}
```

### Métodos Actualizados en Dashboard

**`cargarUsuarios()`**
- Carga totales de usuarios y profesionales desde `/metrica/usuarios-registrados`
- Carga lista de usuarios (máximo 5) desde `/metrica/usuarios?limit=5`

**`cargarProfesionales()`**
- Carga lista de profesionales (máximo 5) desde `/metrica/profesionales?limit=5`

### Tablas Actualizadas

#### Tabla de Usuarios
Ahora muestra:
- Nombre
- Email
- Strikes (con badge warning si > 0)
- Estado (Activo/Inactivo con badge)
- Mensaje "No hay usuarios registrados" si está vacía

#### Tabla de Profesionales
Ahora muestra:
- Nombre
- Oficio
- Calificación (con emoji ⭐)
- Servicios Completados
- Mensaje "No hay profesionales registrados" si está vacía

### Nuevos Estilos

```scss
.badge {
  &.warning {
    background-color: #fef3c7;
    color: #92400e;
  }
}

.no-data-cell {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 2rem 1rem !important;
}
```

### Nuevos Endpoints Consumidos

3. **GET** `/api/v1/perfil/metrica/usuarios?limit=5` → Lista de usuarios
4. **GET** `/api/v1/perfil/metrica/profesionales?limit=5` → Lista de profesionales

## Próximos Pasos Sugeridos

1. Implementar endpoints para gestión de oficios (CRUD)
2. Agregar loading states durante las peticiones
3. Implementar notificaciones de éxito/error
4. Agregar paginación si la lista de oficios crece
5. Implementar caché para reducir peticiones al backend

## Testing

Para verificar la implementación:

1. Iniciar el backend en el puerto configurado
2. Ejecutar el frontend con `ng serve`
3. Navegar al dashboard administrativo
4. Verificar que las métricas se cargan correctamente
5. Revisar la consola del navegador para errores HTTP

## Notas Importantes

- Los datos mock fueron removidos de `cargarUsuarios()` y `cargarOficios()`
- `cargarProfesionales()` aún utiliza datos mock hasta que esté disponible el endpoint
- El gráfico de oficios más demandados ya estaba implementado y funcionando correctamente
- Se mantiene la funcionalidad de filtros por fecha para el gráfico de oficios solicitados
