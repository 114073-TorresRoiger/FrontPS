# 🧪 GUÍA DE PRUEBA - Chat con Profesionales

## ✅ Cambios Implementados

Se han aplicado los siguientes cambios para que el chat funcione correctamente con tu backend:

### 1. Modelo Actualizado
- ✅ `especialidad` ahora es opcional (puede no venir del backend)
- ✅ Maneja casos donde el profesional no tiene especialidad definida

### 2. Componente Modal Mejorado
- ✅ Logs detallados para debugging
- ✅ Manejo correcto de especialidad opcional
- ✅ Valor por defecto "Profesional" si no hay especialidad

### 3. Chat Page Mejorado
- ✅ Log del userId cuando se abre el modal
- ✅ Log del userId actualizado en el observable

---

## 🎯 Cómo Probar

### Paso 1: Verifica que el Backend Esté Corriendo

```bash
# Debe responder con tus solicitudes
curl http://localhost:8081/api/v1/solicitudes/usuario/1
```

**Respuesta esperada:**
```json
[
  {
    "idSolicitud": 1,
    "idProfesional": 2,
    "nombreProfesional": "Juan",
    "apellidoProfesional": "Pérez",
    "fechaSolicitud": "2024-11-12T10:30:00",
    "estado": "pendiente",
    "imagenUrl": "..."
  }
]
```

---

### Paso 2: Inicia la Aplicación

```bash
npm start
```

---

### Paso 3: Prueba el Flujo Completo

1. **Login** en la aplicación
2. **Ve a Home** (`/home`)
3. **Envía una solicitud** a un profesional (si no tienes ninguna)
4. **Ve al Chat** (botón 💬)
5. **Abre la consola del navegador** (F12)
6. **Haz clic en el botón verde** `➕` (Nueva Conversación)

---

### Paso 4: Verifica los Logs

En la consola del navegador deberías ver:

```javascript
✅ Usuario conectado al chat: 1
🔍 currentUserId actualizado: 1
🔍 Abriendo modal con userId: 1
🔍 Cargando solicitudes para usuario: 1
✅ Solicitudes cargadas: [{...}]
```

**Si ves esto:**
```javascript
ℹ️ No se encontraron solicitudes para este usuario
```
→ No tienes solicitudes en la base de datos. Ve a `/home` y envía una.

**Si ves esto:**
```javascript
❌ No hay userId disponible
```
→ El usuario no está correctamente autenticado. Vuelve a hacer login.

**Si ves esto:**
```javascript
❌ Error cargando solicitudes: ...
```
→ Revisa que el backend esté corriendo y el endpoint exista.

---

## 🔍 Debugging - Pestaña Network

1. Abre **DevTools** (F12)
2. Ve a la pestaña **Network**
3. Filtra por **Fetch/XHR**
4. Haz clic en el botón `➕`

**Busca la petición:**
```
GET http://localhost:8081/api/v1/solicitudes/usuario/1
```

**Verifica:**
- ✅ Status: `200 OK`
- ✅ Response: Array con solicitudes
- ✅ Headers: Sin errores CORS

---

## 📊 Casos de Prueba

### Caso 1: Usuario CON Solicitudes ✅

**Acción:** Abrir modal
**Esperado:** Ver lista de profesionales
**Logs:**
```
✅ Solicitudes cargadas: [...]
```

---

### Caso 2: Usuario SIN Solicitudes ℹ️

**Acción:** Abrir modal
**Esperado:** Ver mensaje "No tienes solicitudes enviadas"
**Logs:**
```
ℹ️ No se encontraron solicitudes para este usuario
```

---

### Caso 3: Profesional SIN Especialidad ✅

**Acción:** Seleccionar profesional sin especialidad
**Esperado:** Ver "Profesional" como especialidad por defecto
**Logs:**
```
👤 Profesional seleccionado: { specialty: 'Profesional' }
```

---

### Caso 4: Profesional SIN Imagen 🖼️

**Acción:** Ver profesional sin imagenUrl
**Esperado:** Avatar con inicial del nombre
**Visual:** Círculo con letra (ej: "J" para Juan)

---

### Caso 5: Crear Conversación ✅

**Acción:** Hacer clic en un profesional
**Esperado:** Se abre el chat
**Logs:**
```
👤 Profesional seleccionado: {...}
```

---

## ⚠️ Problemas Comunes y Soluciones

### Problema: Modal vacío pero tengo solicitudes

**Solución:**
```bash
# Limpia la caché del navegador
Ctrl + Shift + Delete
# O simplemente
Ctrl + F5
```

---

### Problema: Error CORS

**Síntoma:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solución en Backend:**
```java
@CrossOrigin(origins = "http://localhost:4200")
```

---

### Problema: userId es null

**Síntoma:**
```
❌ No hay userId disponible
```

**Solución:**
1. Cierra sesión
2. Vuelve a iniciar sesión
3. Ve directamente al chat

---

### Problema: 404 Not Found

**Síntoma:**
```
GET http://localhost:8081/api/v1/solicitudes/usuario/1
Status: 404
```

**Solución:**
Verifica que el endpoint esté exactamente así en tu Controller:
```java
@GetMapping("/usuario/{idUsuario}")
```

---

## ✅ Checklist Final

Antes de reportar un problema, verifica:

- [ ] Backend corriendo en puerto 8081
- [ ] Frontend corriendo en puerto 4200
- [ ] Usuario logueado (no guest/anónimo)
- [ ] Al menos 1 solicitud en la base de datos
- [ ] Endpoint retorna datos (prueba con curl/Postman)
- [ ] No hay errores en la consola
- [ ] No hay errores CORS

---

## 📞 Si Sigue Sin Funcionar

Comparte estos datos:

1. **Logs de la consola completos**
2. **Response del endpoint:**
   ```bash
   curl http://localhost:8081/api/v1/solicitudes/usuario/1
   ```
3. **Screenshot del modal**
4. **Versión de Angular:** `ng version`

---

## 🎉 ¡Todo Listo!

Si sigues todos los pasos y tienes solicitudes en la BD, el modal debería mostrar correctamente los profesionales y permitirte iniciar conversaciones.

**Los cambios aplicados están 100% listos para funcionar con tu backend actual.** 🚀
