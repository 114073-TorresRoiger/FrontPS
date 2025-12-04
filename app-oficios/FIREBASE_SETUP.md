# Configuración de Firebase Storage

Esta guía te ayudará a configurar Firebase Storage para subir las fotos de avatar de los usuarios.

## Paso 1: Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Add project"
3. Ingresa un nombre para tu proyecto (ej: "app-oficios")
4. Acepta los términos y haz clic en "Continuar"
5. Puedes habilitar o deshabilitar Google Analytics (opcional)
6. Haz clic en "Crear proyecto"

## Paso 2: Configurar Firebase Storage

1. En el panel lateral izquierdo, selecciona "Build" > "Storage"
2. Haz clic en "Get started" o "Comenzar"
3. Selecciona las reglas de seguridad (puedes empezar con modo de prueba)
4. Selecciona la ubicación del servidor (recomendado: `southamerica-east1` para Argentina)
5. Haz clic en "Done"

## Paso 3: Configurar reglas de seguridad

En la pestaña "Rules" de Storage, configura las siguientes reglas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura a todos
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Permitir escritura solo en la carpeta avatars con validaciones
    match /avatars/{userId}_{timestamp}.{extension} {
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024  // Máximo 5MB
                   && request.resource.contentType.matches('image/.*');  // Solo imágenes
    }
  }
}
```

**Nota:** Para producción, deberías agregar autenticación Firebase y validar que el `userId` coincida con el usuario autenticado.

## Paso 4: Obtener las credenciales de configuración

1. En el panel lateral, haz clic en el ícono de engranaje ⚙️ y selecciona "Configuración del proyecto"
2. En la pestaña "General", desplázate hacia abajo hasta "Tus apps"
3. Haz clic en el ícono de web `</>`
4. Registra tu app (ej: "app-oficios-web")
5. Copia la configuración de Firebase que aparece

Deberías ver algo como esto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Paso 5: Configurar las variables de entorno en Angular

1. Abre el archivo `src/environments/environment.ts`
2. Reemplaza los valores de `firebase` con tus credenciales:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081',
  streamChat: {
    apiKey: '3mjs68wckahw',
    apiUrl: 'http://localhost:8081/api/v1/chat'
  },
  firebase: {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
  }
};
```

3. Haz lo mismo en `src/environments/environment.prod.ts` para producción

## Paso 6: Verificar la instalación

Las dependencias ya fueron instaladas:
- ✅ `firebase` - SDK de Firebase
- ✅ `FirebaseStorageService` - Servicio creado en `src/app/core/services/firebase-storage.service.ts`

## Uso

El servicio `FirebaseStorageService` se usa automáticamente cuando:

1. El usuario hace clic en "Cambiar Foto" en su perfil
2. Selecciona una imagen desde su sistema
3. La imagen se valida (tipo y tamaño)
4. Se sube a Firebase Storage en la ruta `avatars/{userId}_{timestamp}.{extension}`
5. Se obtiene la URL pública de descarga
6. La URL se guarda en el campo `avatar` del perfil

## Funciones disponibles

### `uploadAvatar(file: File, userId: string): Observable<string>`
Sube un avatar de usuario y retorna la URL de descarga.

### `validateImageFile(file: File): { valid: boolean; error?: string }`
Valida que el archivo sea una imagen válida (tipo y tamaño).

### `deleteFile(url: string): Observable<void>`
Elimina un archivo del storage (útil para limpiar avatars antiguos).

## Validaciones implementadas

- ✅ Solo imágenes: JPEG, JPG, PNG, GIF, WEBP
- ✅ Tamaño máximo: 5MB
- ✅ Nombres únicos con timestamp
- ✅ Indicador visual de progreso de carga
- ✅ Preview de la imagen antes de guardar
- ✅ Manejo de errores con mensajes claros

## Seguridad adicional (Recomendado para producción)

1. **Habilitar Firebase Authentication:**
   - Configura autenticación con el mismo JWT que usa tu backend
   - Actualiza las reglas de Storage para validar `request.auth.uid == userId`

2. **CORS:**
   - Firebase Storage ya tiene CORS habilitado por defecto
   - Si tienes problemas, puedes configurar CORS desde Firebase CLI

3. **Límites de cuota:**
   - Firebase Storage ofrece 5GB de almacenamiento gratuito
   - 1GB de descarga diaria gratuita
   - Monitorea el uso desde la consola de Firebase

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Verifica que copiaste correctamente el `apiKey` en `environment.ts`

### Error: "Storage: Object 'avatars/...' does not exist"
- Asegúrate de que el bucket de Storage esté creado en Firebase Console

### Error: "Firebase Storage: User does not have permission"
- Revisa las reglas de seguridad en la pestaña "Rules" de Storage
- Asegúrate de permitir escritura en la carpeta `avatars`

### La imagen no se muestra después de subirla
- Verifica que las reglas de lectura permitan acceso público
- Revisa la URL en la consola del navegador

## Soporte

Si tienes problemas con la configuración:
1. Revisa la [documentación oficial de Firebase Storage](https://firebase.google.com/docs/storage)
2. Verifica los logs en la consola del navegador (F12)
3. Revisa los logs en Firebase Console > Storage > Usage
