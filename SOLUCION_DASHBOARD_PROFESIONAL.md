# 🔧 Solución: Acceso al Dashboard del Profesional

## Problema
No se puede acceder al dashboard del profesional en `/profesionales/dashboard`.

## Solución Implementada

### 1. ✅ Creado Guard Específico para Profesionales
Se creó `profesional.guard.ts` que verifica:
- Usuario autenticado
- Usuario tiene `idProfesional` asignado
- Redirige a `/home` si no es profesional
- Redirige a `/auth/login` si no está autenticado

### 2. ✅ Actualizado Rutas de Profesionales
Todas las rutas de profesionales ahora usan `profesionalGuard` en lugar de `authGuard`.

### 3. ✅ Agregado Logging para Debug
El dashboard ahora muestra en consola:
- Usuario actual con todos sus datos
- ID del profesional si existe
- Advertencias si no hay `idProfesional`

## 📋 Pasos para Probar

### Opción 1: Crear Usuario Profesional desde el Frontend

1. **Registrar nuevo usuario profesional:**
   ```
   1. Ir a http://localhost:4200/profesionales/registro
   2. Completar formulario de registro
   3. Iniciar sesión con las credenciales creadas
   4. Verificar que el backend retorne idProfesional en la respuesta
   ```

2. **Verificar en consola del navegador:**
   - Abrir DevTools (F12)
   - Ir a la pestaña Console
   - Deberías ver: `Dashboard - Usuario actual: {id, name, idProfesional, ...}`

### Opción 2: Verificar Usuario Existente en Base de Datos

1. **Conectar a PostgreSQL:**
   ```sql
   -- Verificar si hay profesionales registrados
   SELECT p.idprofesional, u.idusuario, a.mail, a.name, a.lastname
   FROM profesionales p
   INNER JOIN usuarios u ON p.idusuario = u.idusuario
   INNER JOIN auth a ON u.idauth = a.idauth;
   ```

2. **Si existe un profesional, intentar login:**
   - Email: (el que aparezca en la consulta)
   - El backend debe retornar `idProfesional` en la respuesta

### Opción 3: Crear Usuario Profesional Manualmente en DB

Si no hay profesionales, puedes crear uno manualmente:

```sql
-- 1. Crear Auth (usuario de login)
INSERT INTO auth (password, name, lastname, mail, active)
VALUES (
    '$2a$10$JqO3VFXXr8vP8Wf6Xh9MBeQE9CJJHqQF2VqxKqZQqGqYq2ZQqZQqZ', -- password: "Test123!"
    'Juan',
    'Pérez',
    'juan.perez@profesional.com',
    true
);

-- 2. Crear Dirección
INSERT INTO direcciones (idbarrio, calle, numero)
VALUES (1, 'Av. Colón', '1234')
RETURNING iddireccion;

-- 3. Crear Usuario (usar el idauth e iddireccion anteriores)
INSERT INTO usuarios (documento, telefono, nacimiento, iddireccion, idtipodoc, idauth)
VALUES (
    '12345678',
    '3512345678',
    '1990-01-01',
    1, -- iddireccion de paso 2
    1, -- DNI
    1  -- idauth de paso 1
)
RETURNING idusuario;

-- 4. Crear Profesional (usar el idusuario anterior)
INSERT INTO profesionales (fechadesde, idusuario, idoficio, precio_min, precio_max)
VALUES (
    CURRENT_DATE,
    1, -- idusuario de paso 3
    1, -- idoficio (debe existir en tabla oficios)
    5000,
    15000
)
RETURNING idprofesional;

-- 5. Verificar que se creó correctamente
SELECT 
    a.mail,
    a.name,
    a.lastname,
    u.idusuario,
    p.idprofesional
FROM auth a
INNER JOIN usuarios u ON a.idauth = u.idauth
INNER JOIN profesionales p ON u.idusuario = p.idusuario
WHERE a.mail = 'juan.perez@profesional.com';
```

**Credenciales para probar:**
- Email: `juan.perez@profesional.com`
- Password: `Test123!`

## 🔍 Verificación

### En el Frontend:

1. **Abrir DevTools (F12) → Console**
2. **Iniciar sesión con credenciales de profesional**
3. **Buscar en consola:**
   ```
   Dashboard - Usuario actual: {
     id: 1,
     name: "Juan",
     lastName: "Pérez",
     idProfesional: 1,  ← Este campo DEBE existir
     ...
   }
   ```

4. **Si NO aparece `idProfesional`:**
   - El backend NO está retornando el campo
   - Verificar que `AuthServiceImpl.java` incluya la línea:
     ```java
     .idProfesional(idProfesional)
     ```

### En el Backend:

1. **Verificar que AuthServiceImpl retorna idProfesional:**
   ```java
   // En BackPs/App/src/main/java/ar/edu/utn/frc/tup/app/auth/services/impl/AuthServiceImpl.java
   
   Integer idProfesional = null;
   if (usuario != null) {
       idProfesional = profesionalRepository.findByIdusuario_Id(usuario.getId())
               .map(p -> p.getId())
               .orElse(null);
   }
   
   return AuthResponse.builder()
       // ... otros campos ...
       .idProfesional(idProfesional)  ← DEBE existir
       .build();
   ```

## 🚨 Errores Comunes

### Error 1: "Acceso denegado: El usuario no es un profesional"
**Causa:** Usuario autenticado pero sin `idProfesional`
**Solución:** 
- Verificar que el usuario tenga un registro en tabla `profesionales`
- Verificar que el backend retorne `idProfesional` en login

### Error 2: Redirección a /auth/login
**Causa:** Usuario no autenticado
**Solución:** 
- Iniciar sesión primero
- Verificar que el token esté en localStorage

### Error 3: No se carga la página
**Causa:** Error en el componente
**Solución:** 
- Revisar Console del navegador
- Verificar que no haya errores de compilación de Angular

## 📝 Archivos Modificados

1. ✅ `core/guards/profesional.guard.ts` - Creado
2. ✅ `features/profesionales/profesionales.routes.ts` - Actualizado
3. ✅ `features/profesionales/dashboard/dashboard.component.ts` - Agregado logging
4. ✅ `features/profesionales/dashboard/dashboard.component.scss` - Estilos para solicitudes
5. ✅ `features/profesionales/dashboard/dashboard.component.html` - UI de solicitudes

## ✅ Próximos Pasos

Una vez que puedas acceder al dashboard:

1. **Probar carga de solicitudes:**
   - Un usuario cliente debe enviar una solicitud
   - El profesional debe verla en su dashboard

2. **Probar respuesta a solicitudes:**
   - Aceptar una solicitud
   - Rechazar una solicitud
   - Verificar que desaparezca de la lista

3. **Mejoras pendientes en Backend:**
   - Modificar endpoint para retornar array de solicitudes
   - Agregar campo `idSolicitud` a `SolicitudResponse`

## 🔗 URLs Importantes

- Login: http://localhost:4200/auth/login
- Registro Profesional: http://localhost:4200/profesionales/registro
- Dashboard: http://localhost:4200/profesionales/dashboard
- Home: http://localhost:4200/home

## 💡 Tips

- **Siempre revisar Console del navegador** para ver logs de debug
- **Usar Network tab** para ver las respuestas del backend
- **Verificar localStorage** para ver si el token y usuario están guardados:
  ```javascript
  // En Console del navegador:
  JSON.parse(localStorage.getItem('auth_user'))
  ```
