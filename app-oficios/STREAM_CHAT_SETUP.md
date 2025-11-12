# 🚀 Guía Rápida: Integración Stream Chat

## ✅ Pasos para Activar

### 1. Configurar Stream API Key

```typescript
// src/environments/environment.ts
export const environment = {
  streamChat: {
    apiKey: 'TU_API_KEY_DE_STREAM', // ⚠️ Obtener de https://getstream.io/dashboard/
    apiUrl: 'http://localhost:8081/api/v1/chat'
  }
};
```

### 2. Verificar Backend Endpoints

Tu backend debe implementar el `ChatController` con estos endpoints:

```
✅ GET  /api/v1/chat/init?userId={userId}
✅ POST /api/v1/chat/users
✅ POST /api/v1/chat/channels
✅ POST /api/v1/chat/channels/members
✅ POST /api/v1/chat/messages
✅ GET  /api/v1/chat/user/{userId}/conversations
✅ GET  /api/v1/chat/professionals/available
✅ POST /api/v1/chat/conversations/with-professional
```

### 3. Iniciar Aplicación

```bash
npm start
```

Visita: `http://localhost:4200/chat`

### 4. Probar

1. **Login**: Ingresa un ID de usuario (ej: `1`, `2`, `3`)
2. **Nueva Consulta**: Click en botón "➕"
3. **Seleccionar Profesional**: Click en un profesional
4. **Enviar Mensaje**: Escribe y presiona Enter

---

## 🏗️ Arquitectura Implementada

```
📦 Clean Architecture
├── 🎯 Domain Layer (Lógica de Negocio)
│   ├── chat.model.ts
│   ├── chat.repository.ts (interface)
│   └── use-cases/
│       ├── initialize-chat.usecase.ts
│       ├── create-channel.usecase.ts
│       ├── send-message.usecase.ts
│       └── get-user-conversations.usecase.ts
│
├── 💾 Data Layer (Acceso a Datos)
│   └── chat.http.repository.ts (implementación HTTP)
│
└── 🎨 Presentation Layer (UI)
    ├── chat.page.ts (página principal)
    ├── services/
    │   └── stream-chat.service.ts
    └── components/
        ├── chat-channel-list/
        ├── chat-channel/
        └── professional-selection-modal/
```

---

## 🔧 Providers Configurados

Los siguientes providers ya están registrados en `core/providers.ts`:

```typescript
✅ ChatRepository → ChatHttpRepository
✅ InitializeChatUseCase
✅ CreateChannelUseCase
✅ SendMessageUseCase
✅ GetUserConversationsUseCase
```

---

## 📋 Checklist de Verificación

- [ ] Stream API Key configurado en `environment.ts`
- [ ] Backend corriendo en `http://localhost:8081`
- [ ] Endpoints del `ChatController` funcionando
- [ ] Base de datos configurada
- [ ] Profesionales creados en la base de datos
- [ ] Frontend corriendo en `http://localhost:4200`

---

## 🐛 Troubleshooting

### Error: "Cliente no está conectado"
- Verifica que el backend esté corriendo
- Verifica la API Key de Stream
- Revisa la consola del navegador

### No aparecen profesionales
- Endpoint `/professionals/available` debe retornar datos
- Verifica que existan profesionales en la base de datos

### Mensajes no se envían
- Verifica token de autenticación
- Revisa logs del backend
- Confirma que el canal existe

---

## 🎯 Próximos Pasos

1. ✅ **Integración completa**: Todo está implementado
2. 🔄 **Testing**: Probar flujo completo
3. 🎨 **Personalización**: Ajustar estilos según diseño
4. 🔐 **Autenticación**: Integrar con AuthService real
5. 📱 **Responsive**: Optimizar para móviles
6. 🚀 **Deploy**: Configurar variables de entorno

---

## 📞 Soporte

- [Stream Chat Docs](https://getstream.io/chat/docs/)
- [Angular Tutorial](https://getstream.io/chat/angular/tutorial/)
- [Stream Dashboard](https://getstream.io/dashboard/)

---

**¡Listo para usar! 🎉**
