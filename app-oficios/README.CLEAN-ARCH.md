# Estructura y convenciones

Este proyecto aplica Clean Architecture encima de Angular standalone.

Capas:

- core: providers globales, configuraciones y adaptadores del framework
- shared: UI reutilizable sin estado ni dependencias a features
- domain: entidades y casos de uso (sin Angular)
- data: implementaciones concretas (HTTP, mappers) que satisfacen contratos del dominio
- features: páginas standalone y routing por feature

Reglas rápidas:

- UI consume casos de uso (no directamente data)
- El dominio depende de abstracciones (repositorios), no de implementaciones
- En core/providers.ts se enlazan repositorios con implementaciones
- Rutas lazy en `app.routes.ts` por feature
