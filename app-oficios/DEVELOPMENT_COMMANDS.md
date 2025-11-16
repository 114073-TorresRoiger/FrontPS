# 🛠️ Comandos Útiles - Stream Chat

## 🚀 Desarrollo

### Iniciar el servidor de desarrollo
```bash
npm start
# o
ng serve
```

### Compilar para producción
```bash
npm run build
# o
ng build --configuration production
```

### Ejecutar tests
```bash
npm test
# o
ng test
```

---

## 🔍 Debugging

### Ver console logs de Stream Chat
Abre DevTools del navegador (F12) y busca:
```
✅ Usuario conectado a Stream Chat: {userId}
✅ Obteniendo conversaciones para usuario: {userId}
❌ Error conectando usuario: {error}
```

### Verificar estado de conexión
En la consola del navegador:
```javascript
// Verificar si Stream Chat está conectado
window.streamChat = StreamChat.getInstance('YOUR_API_KEY');
console.log(streamChat.user); // Ver usuario actual
```

### Inspeccionar canales
```javascript
// Listar canales del usuario
const channels = await streamChat.queryChannels(
  { members: { $in: ['userId'] } },
  { last_message_at: -1 }
);
console.log(channels);
```

---

## 🧪 Testing Manual

### 1. Test de Login
```
1. Ir a /chat
2. Ingresar userId: "1"
3. Click en "Iniciar Chat"
4. ✅ Debe aparecer la lista de conversaciones
```

### 2. Test de Creación de Canal
```
1. Login como userId: "1"
2. Click en botón "➕"
3. Seleccionar un profesional
4. ✅ Debe abrir el chat con el profesional
```

### 3. Test de Mensajería
```
1. Abrir dos navegadores/pestañas
2. Login como "1" en pestaña A
3. Login como "2" en pestaña B
4. Crear canal entre 1 y 2
5. Enviar mensaje desde A
6. ✅ Debe aparecer en B en tiempo real
```

### 4. Test de Profesionales
```
1. Backend debe tener endpoint /professionals/available
2. Debe retornar array de profesionales
3. ✅ Modal debe mostrar lista de profesionales
```

---

## 📊 Stream Chat Dashboard

### Acceder al Dashboard
```
URL: https://getstream.io/dashboard/
```

### Ver Usuarios
```
Dashboard > App > Chat > Users
- Crear usuarios manualmente
- Ver usuarios activos
- Editar perfiles
```

### Ver Canales
```
Dashboard > App > Chat > Channels
- Ver todos los canales
- Inspeccionar mensajes
- Moderar contenido
```

### Ver Analytics
```
Dashboard > App > Analytics
- MAU (Monthly Active Users)
- Mensajes enviados
- Canales creados
```

---

## 🔧 Comandos de Backend

### Verificar endpoints
```bash
# Test endpoint de inicialización
curl http://localhost:8081/api/v1/chat/init?userId=1

# Test endpoint de profesionales
curl http://localhost:8081/api/v1/chat/professionals/available

# Test endpoint de conversaciones
curl http://localhost:8081/api/v1/chat/user/1/conversations
```

### Crear usuario manualmente (Postman/curl)
```bash
POST http://localhost:8081/api/v1/chat/users
Content-Type: application/json

{
  "userId": "1",
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "imageUrl": "https://example.com/avatar.jpg"
}
```

### Crear canal manualmente
```bash
POST http://localhost:8081/api/v1/chat/channels
Content-Type: application/json

{
  "channelType": "messaging",
  "channelId": "dm-1-2",
  "creatorId": "1",
  "members": ["1", "2"],
  "name": "Chat entre 1 y 2"
}
```

---

## 🔥 Shortcuts de Desarrollo

### Angular CLI
```bash
# Generar nuevo componente
ng g c features/chat/components/nuevo-componente --standalone

# Generar nuevo servicio
ng g s features/chat/services/nuevo-servicio

# Generar nuevo use case
ng g s domain/chat/use-cases/nuevo-usecase

# Ver estructura del proyecto
ng list
```

### Git
```bash
# Ver cambios
git status

# Commit de cambios
git add .
git commit -m "feat: Implementar Stream Chat con Clean Architecture"

# Push a la rama
git push origin Feature/StreamChat

# Crear pull request
# Ir a GitHub y crear PR desde Feature/StreamChat a main
```

---

## 📝 Logs Importantes

### Frontend (console.log)
```javascript
// En StreamChatService
console.log('✅ Usuario conectado a Stream Chat:', userId);
console.log('✅ Canal creado:', channel.id);
console.error('❌ Error al conectar:', error);

// En ChatPage
console.log('Canal seleccionado:', channel);
console.log('Profesional seleccionado:', professional);
```

### Backend (Java logs)
```java
log.info("Generando token para usuario: {}", userId);
log.info("Creando canal: {}/{}", channelType, channelId);
log.error("Error al crear usuario en Stream: {}", error);
```

---

## 🧹 Limpieza

### Limpiar node_modules
```bash
rm -rf node_modules
npm install
```

### Limpiar cache de Angular
```bash
ng cache clean
# o
rm -rf .angular/cache
```

### Reset de Stream Chat (Dashboard)
```
⚠️ CUIDADO: Esto eliminará todos los datos

Dashboard > App > Settings > Danger Zone > Reset App
```

---

## 📦 Variables de Entorno

### Development (.env.development)
```bash
STREAM_API_KEY=your_dev_api_key
API_URL=http://localhost:8081
```

### Production (.env.production)
```bash
STREAM_API_KEY=your_prod_api_key
API_URL=https://api.production.com
```

### Usar en CI/CD (GitHub Actions)
```yaml
env:
  STREAM_API_KEY: ${{ secrets.STREAM_API_KEY }}
  API_URL: ${{ secrets.API_URL }}
```

---

## 🔍 Troubleshooting Commands

### Ver versión de Angular
```bash
ng version
```

### Ver logs del servidor
```bash
npm start -- --verbose
```

### Verificar puertos en uso
```bash
# Windows
netstat -ano | findstr :4200
netstat -ano | findstr :8081

# Linux/Mac
lsof -i :4200
lsof -i :8081
```

### Matar proceso en puerto
```bash
# Windows
taskkill /PID {PID} /F

# Linux/Mac
kill -9 {PID}
```

---

## 📊 Métricas de Performance

### Lighthouse Audit
```bash
# Instalar lighthouse
npm install -g lighthouse

# Ejecutar audit
lighthouse http://localhost:4200/chat --view
```

### Bundle Analyzer
```bash
# Instalar analyzer
npm install -g webpack-bundle-analyzer

# Analizar build
ng build --stats-json
webpack-bundle-analyzer dist/app-oficios/browser/stats.json
```

---

## 🎯 Comandos Quick Start

### Setup Completo
```bash
# 1. Clonar repo (si aplica)
git clone <repo-url>
cd app-oficios

# 2. Instalar dependencias
npm install

# 3. Configurar environment
# Editar src/environments/environment.ts con tu Stream API Key

# 4. Iniciar backend (en otra terminal)
cd ../backend
./mvnw spring-boot:run

# 5. Iniciar frontend
npm start

# 6. Abrir navegador
# http://localhost:4200/chat
```

### Test Rápido
```bash
# Terminal 1: Backend
cd backend && ./mvnw spring-boot:run

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: Test con curl
curl http://localhost:8081/api/v1/chat/init?userId=1
```

---

## 📚 Recursos

### Documentación Oficial
- Angular: https://angular.dev/
- Stream Chat: https://getstream.io/chat/docs/
- RxJS: https://rxjs.dev/

### Tutoriales
- Stream Chat Angular: https://getstream.io/chat/angular/tutorial/
- Clean Architecture: https://blog.cleancoder.com/

### Comunidad
- Angular Discord: https://discord.gg/angular
- Stream Chat Support: support@getstream.io
- Stack Overflow: [stream-chat] + [angular] tags

---

**💡 Tip**: Guarda este archivo como referencia rápida durante el desarrollo!
