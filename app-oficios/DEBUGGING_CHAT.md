# 🔍 Guía de Debugging - Chat con Profesionales

## ❓ Problema Reportado
"Tengo una solicitud enviada a un profesional, pero no puedo conversar con él"

---

## 📋 Checklist de Verificación Rápida

Antes de empezar, verifica estos puntos básicos:

- [ ] ✅ Backend corriendo en `http://localhost:8081`
- [ ] ✅ Frontend corriendo en `http://localhost:4200`
- [ ] ✅ Usuario logueado correctamente
- [ ] ✅ Al menos 1 solicitud enviada desde `/home`

---

## 🧪 Pasos de Diagnóstico

### 1️⃣ **Verificar que el Backend Responda**

Abre tu navegador y accede directamente a:

```
http://localhost:8081/api/v1/solicitudes/usuario/1
```

(Reemplaza `1` con tu ID de usuario)

**✅ Respuesta Correcta:**
```json
[
  {
    "idSolicitud": 1,
    "idProfesional": 2,
    "nombreProfesional": "Juan",
    "apellidoProfesional": "Pérez",
    "especialidad": "Plomería",
    "fechaSolicitud": "2024-11-12T10:30:00",
    "estado": "pendiente",
    "imagenUrl": "http://example.com/image.jpg"
  }
]
```

**❌ Si obtienes 404:**
El endpoint no existe en tu backend. Necesitas implementarlo.

**❌ Si obtienes array vacío `[]`:**
No hay solicitudes en la base de datos. Crea una desde `/home` primero.

---

### 2️⃣ **Verificar la Consola del Navegador**

1. Abre DevTools con **F12**
2. Ve a la pestaña **Console**
3. Navega a `/chat`
4. Haz clic en el botón `➕ Nueva Consulta Profesional` o similar

**Busca estos mensajes:**

```javascript
// ✅ Mensajes Correctos:
🔍 Cargando solicitudes para usuario: 1
✅ Solicitudes cargadas: [{...}]
👤 Profesional seleccionado: {...}

// ❌ Mensajes de Error:
❌ userId no está definido
❌ Error al cargar solicitudes
ℹ️ No se encontraron solicitudes
```

---

### 3️⃣ **Verificar la Pestaña Network**

1. Ve a **DevTools** → **Network**
2. Filtra por **Fetch/XHR**
3. Haz clic en `➕ Nueva Consulta Profesional`
4. Busca la petición: `solicitudes/usuario/1`

**Analiza el resultado:**

| Status | Significado | Solución |
|--------|-------------|----------|
| 200 OK | ✅ Funciona | Continúa al siguiente paso |
| 404 Not Found | ❌ Endpoint no existe | Implementa el endpoint en backend |
| 500 Server Error | ❌ Error en backend | Revisa logs del backend |
| No aparece | ❌ No se hace la llamada | Verifica que userId esté definido |

---

### 4️⃣ **Verificar el Flujo Completo**

Ejecuta estos pasos en orden:

#### A. Verificar Usuario Logueado

1. Abre la consola (F12)
2. Ejecuta:
```javascript
// Verifica que el usuario esté logueado
const authService = ng.getComponent(document.body).authService;
console.log('Usuario:', authService.currentUser());
```

**Debe mostrar:**
```javascript
{
  id: 1,
  nombre: "Tu Nombre",
  email: "tu@email.com",
  ...
}
```

#### B. Verificar que el Modal Reciba el userId

1. Ve a `chat.page.ts`
2. Añade este log temporalmente:

```typescript
onNewChatRequested(): void {
  console.log('🔍 userId actual:', this.currentUserId); // ⚠️ AÑADE ESTO
  this.professionalModal?.open();
}
```

3. Haz clic en "Nueva Consulta"
4. Verifica en consola que aparezca: `🔍 userId actual: 1`

Si es `null` o `undefined`, el problema está en la autenticación.

#### C. Verificar Carga de Solicitudes

1. Ve a `professional-selection-modal.component.ts`
2. Añade estos logs temporalmente:

```typescript
async loadProfessionalsFromSolicitudes(): Promise<void> {
  console.log('🔍 userId recibido:', this.userId); // ⚠️ AÑADE ESTO
  
  if (!this.userId) {
    console.error('❌ userId es null');
    return;
  }

  this.isLoading = true;
  try {
    this.solicitudRepository.getSolicitudesByUsuario(Number(this.userId)).subscribe({
      next: (solicitudes) => {
        console.log('✅ Solicitudes:', solicitudes); // ⚠️ AÑADE ESTO
        this.solicitudes = solicitudes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error:', error); // ⚠️ AÑADE ESTO
        this.isLoading = false;
      },
    });
  } catch (error) {
    console.error('❌ Exception:', error); // ⚠️ AÑADE ESTO
    this.isLoading = false;
  }
}
```

---

## 🛠️ Soluciones a Problemas Comunes

### Problema 1: Modal vacío - No aparecen profesionales

**Síntoma:** El modal se abre pero no muestra ningún profesional.

**Diagnóstico:**
```bash
# En la consola del navegador
ℹ️ No se encontraron solicitudes
```

**Causa:** No hay solicitudes en la base de datos.

**Solución:**
1. Ve a `/home`
2. Busca un profesional
3. Envía una solicitud
4. Vuelve al chat

---

### Problema 2: Error 404 al cargar solicitudes

**Síntoma:** Error en Network tab:
```
GET http://localhost:8081/api/v1/solicitudes/usuario/1
Status: 404 Not Found
```

**Causa:** El backend no tiene el endpoint implementado.

**Solución Backend (Java/Spring Boot):**

```java
@RestController
@RequestMapping("/api/v1/solicitudes")
@CrossOrigin(origins = "http://localhost:4200")
public class SolicitudController {

    @Autowired
    private SolicitudService solicitudService;

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<SolicitudConProfesionalDTO>> getSolicitudesByUsuario(
            @PathVariable Long idUsuario) {
        
        List<SolicitudConProfesionalDTO> solicitudes = 
            solicitudService.getSolicitudesByUsuarioConProfesional(idUsuario);
        
        return ResponseEntity.ok(solicitudes);
    }
}
```

**DTO necesario:**
```java
public class SolicitudConProfesionalDTO {
    private Long idSolicitud;
    private Long idProfesional;
    private String nombreProfesional;
    private String apellidoProfesional;
    private String especialidad;
    private LocalDateTime fechaSolicitud;
    private String estado; // "pendiente", "aceptada", "rechazada"
    private String imagenUrl;
    
    // Getters y Setters
}
```

**Service:**
```java
@Service
public class SolicitudService {
    
    @Autowired
    private SolicitudRepository solicitudRepository;
    
    @Autowired
    private ProfesionalRepository profesionalRepository;
    
    public List<SolicitudConProfesionalDTO> getSolicitudesByUsuarioConProfesional(Long idUsuario) {
        List<Solicitud> solicitudes = solicitudRepository.findByIdUsuario(idUsuario);
        
        return solicitudes.stream()
            .map(solicitud -> {
                Profesional prof = profesionalRepository.findById(solicitud.getIdProfesional())
                    .orElse(null);
                
                if (prof == null) return null;
                
                SolicitudConProfesionalDTO dto = new SolicitudConProfesionalDTO();
                dto.setIdSolicitud(solicitud.getId());
                dto.setIdProfesional(prof.getId());
                dto.setNombreProfesional(prof.getNombre());
                dto.setApellidoProfesional(prof.getApellido());
                dto.setEspecialidad(prof.getEspecialidad());
                dto.setFechaSolicitud(solicitud.getFechaSolicitud());
                dto.setEstado(solicitud.getEstado());
                dto.setImagenUrl(prof.getImagenUrl());
                
                return dto;
            })
            .filter(dto -> dto != null)
            .collect(Collectors.toList());
    }
}
```

---

### Problema 3: userId es null

**Síntoma:**
```javascript
❌ userId no está definido
```

**Causa:** El usuario no está autenticado o el AuthService no está compartiendo el usuario correctamente.

**Solución:**

Verifica en `chat.page.ts`:

```typescript
ngOnInit(): void {
  const user = this.authService.currentUser();
  
  console.log('🔍 Usuario en ChatPage:', user); // ⚠️ AÑADE ESTO
  
  if (!user || !user.id) {
    this.connectionError = 'Debes iniciar sesión para usar el chat';
    this.router.navigate(['/auth/login']);
    return;
  }

  this.connectUser(user.id.toString());

  this.streamChatService.currentUserId$.subscribe((userId) => {
    this.currentUserId = userId;
    console.log('🔍 currentUserId actualizado:', this.currentUserId); // ⚠️ AÑADE ESTO
  });
}
```

---

### Problema 4: Puedo ver profesionales pero no crear conversación

**Síntoma:** Al hacer clic en un profesional, no se abre el chat.

**Causa:** Error al crear el canal en Stream o en el backend.

**Diagnóstico:**

1. Revisa la consola:
```javascript
❌ Error creando conversación con profesional: ...
```

2. Revisa Network tab:
```
POST http://localhost:8081/api/v1/chat/conversations/with-professional
Status: ???
```

**Solución:**

Verifica que el endpoint de creación de conversación exista en tu backend:

```java
@PostMapping("/conversations/with-professional")
public ResponseEntity<ConversationResponse> createConversationWithProfessional(
        @RequestBody CreateConversationRequest request) {
    
    ConversationResponse response = chatService.createConversation(
        request.getUserId(),
        request.getProfessionalId()
    );
    
    return ResponseEntity.ok(response);
}
```

---

## 🧪 Script de Test Automático

Guarda este código en `test-chat.ts` en la raíz del proyecto:

```typescript
export async function testChatFlow() {
  console.log('🧪 ========== TEST DEL CHAT ==========\n');
  
  // Test 1: Backend accesible
  console.log('1️⃣ Verificando backend...');
  try {
    const response = await fetch('http://localhost:8081/api/v1/solicitudes/usuario/1');
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Backend responde');
      console.log('   📋 Solicitudes:', data.length);
      console.log('   📄 Datos:', data);
    } else {
      console.error('   ❌ Backend error:', response.status);
    }
  } catch (error) {
    console.error('   ❌ No se puede conectar al backend');
  }
  
  console.log('\n🧪 ========== FIN DEL TEST ==========');
}

// Para ejecutar en la consola del navegador:
// 1. Abre DevTools (F12)
// 2. Ve a Console
// 3. Copia y pega esta función
// 4. Ejecuta: testChatFlow()
```

---

## 📱 Test Paso a Paso Manual

Sigue estos pasos en orden:

### Paso 1: Preparación
```bash
# Terminal 1: Backend
cd backend
mvn spring-boot:run

# Terminal 2: Frontend  
cd app-oficios
npm start
```

### Paso 2: Login
1. Ve a `http://localhost:4200`
2. Inicia sesión
3. ✅ Verifica que veas el home

### Paso 3: Crear Solicitud
1. Busca un profesional
2. Haz clic en "Ver Perfil"
3. Haz clic en "Enviar Solicitud"
4. Completa el formulario
5. ✅ Verifica que aparezca mensaje de éxito

### Paso 4: Ir al Chat
1. Haz clic en el botón **💬 Chat** (navbar o home)
2. ✅ Deberías ver la pantalla de chat
3. ✅ No debe haber errores en consola

### Paso 5: Abrir Modal
1. Haz clic en **➕ Nueva Conversación** o similar
2. ✅ Debe abrirse el modal
3. ✅ Debe aparecer el profesional de tu solicitud

### Paso 6: Iniciar Chat
1. Haz clic en el profesional
2. ✅ Debe abrirse el chat
3. Escribe un mensaje
4. ✅ El mensaje debe enviarse

---

## 🆘 Si Nada Funciona

Si después de seguir todos los pasos aún no funciona, comparte:

1. **Screenshot del modal** cuando lo abres
2. **Toda la salida de la consola** (F12 → Console)
3. **Network tab** con la petición fallida
4. **Respuesta del endpoint** al acceder manualmente a:
   ```
   http://localhost:8081/api/v1/solicitudes/usuario/1
   ```

---

## ✅ Estado de Implementación Actual

**Frontend:**
- ✅ Modelo `SolicitudConProfesional` creado
- ✅ Repositorio con método `getSolicitudesByUsuario()`
- ✅ Componente modal actualizado
- ✅ Integración con AuthService
- ✅ Flujo de navegación configurado

**Backend (Necesitas Implementar):**
- ⚠️ Endpoint `GET /api/v1/solicitudes/usuario/{id}`
- ⚠️ DTO `SolicitudConProfesionalDTO`
- ⚠️ Lógica en Service para unir Solicitud + Profesional

---

## 🎯 Próximo Paso Inmediato

**Si el modal está vacío:**
→ Implementa el endpoint en el backend (ver Problema 2)

**Si el modal no se abre:**
→ Verifica que `currentUserId` no sea null (ver Problema 3)

**Si aparecen profesionales pero no puedes chatear:**
→ Verifica endpoint de creación de conversación (ver Problema 4)
