# FrontPS

### CLEAN ARCHITECTURE

src/
 └── app/
     ├── core/                 # Servicios y lógica central (auth, guards, interceptors)
     │    ├── auth/
     │    ├── interceptors/
     │    ├── guards/
     │    └── services/
     │
     ├── features/             # Funcionalidades principales (modulares)
     │    ├── auth/            # Módulo de login/registro
     │    ├── usuarios/        # Módulo de usuarios
     │    ├── profesionales/   # Módulo de profesionales
     │    ├── chat/            # Módulo de mensajería con Stream.io
     │    └── pagos/           # Módulo de pagos
     │
     ├── shared/               # Componentes, pipes y directivas reutilizables
     │    ├── components/
     │    ├── pipes/
     │    └── directives/
     │
     ├── state/                # Store global (NgRx)
     │    ├── app.state.ts
     │    ├── reducers/
     │    └── actions/
     │
     └── app-routing.module.ts # Ruteo principal
