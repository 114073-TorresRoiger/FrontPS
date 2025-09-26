## FrontPS - Instrucciones para iniciar el proyecto

Este repositorio contiene la aplicación Angular ubicada en la carpeta `app-oficios`.

A continuación se documentan los requisitos mínimos recomendados, las dependencias principales (extraídas de `app-oficios/package.json`) y los comandos más comunes para instalar y ejecutar la aplicación en Windows (PowerShell).

## Requisitos previos

- Node.js: se recomienda usar una versión LTS moderna (por ejemplo Node 18.x o Node 20.x). (Asunción: usar Node >= 18).
- npm: viene con Node; se recomienda npm >= 9.
- Git (opcional, para clonar/actualizar el repositorio).
- Angular CLI (opcional, útil para ejecutar comandos `ng` globalmente):
	- Para instalar globalmente: `npm install -g @angular/cli@20.3.2` (coincide con la versión en devDependencies, opcional).

Nota: no es estrictamente necesario instalar Angular CLI globalmente si se usan los scripts npm incluidos.

## Dependencias principales

Dependencias (runtime) incluidas en `app-oficios/package.json`:

- @angular/cdk: ^20.2.4 — Component Dev Kit de Angular.
- @angular/common: ^20.3.0
- @angular/compiler: ^20.3.0
- @angular/core: ^20.3.0
- @angular/forms: ^20.3.0
- @angular/material: ^20.2.4 — Angular Material UI components.
- @angular/platform-browser: ^20.3.0
- @angular/router: ^20.3.0
- @ngrx/effects: ^20.0.1 — NgRx Effects para manejo de efectos secundarios.
- @ngrx/entity: ^20.0.1
- @ngrx/store: ^20.0.1 — Estado global con NgRx Store.
- @ngrx/store-devtools: ^20.0.1 — Herramientas de desarrollo para NgRx.
- bootstrap: ^5.3.8 — Estilos y layout (Bootstrap).
- lucide-angular: ^0.544.0 — Iconos Lucide para Angular.
- rxjs: ~7.8.0 — Librería reactividad.
- stream-chat-angular: ^6.2.0 — Integración con Stream Chat (chat en tiempo real).
- tslib: ^2.3.0 — Helpers de TypeScript.
- zone.js: ~0.15.0 — required by Angular runtime.

DevDependencies (para desarrollo/build/test):

- @angular/build: ^20.3.2
- @angular/cli: ^20.3.2
- @angular/compiler-cli: ^20.3.0
- @types/jasmine: ~5.1.0
- jasmine-core: ~5.9.0
- karma: ~6.4.0
- karma-chrome-launcher: ~3.2.0
- karma-coverage: ~2.2.0
- karma-jasmine: ~5.1.0
- karma-jasmine-html-reporter: ~2.1.0
- typescript: ~5.9.2

Si va a ejecutar el proyecto localmente en modo desarrollo, instale las dependencias listadas arriba utilizando npm (o pnpm/yarn si prefiere, adaptando los comandos).

## Comandos útiles (PowerShell / Windows)

Abrir PowerShell y ejecutar los siguientes pasos desde la raíz del repositorio:

```powershell
cd .\app-oficios
npm install
```

Comandos disponibles (desde `app-oficios`):

- Iniciar servidor de desarrollo (ng serve):

```powershell
npm start
# o
npm run start
```

- Construir la aplicación para producción:

```powershell
npm run build
```

- Construcción en modo watch para desarrollo:

```powershell
npm run watch
```

- Ejecutar tests unitarios:

```powershell
npm test
```

- Ejecutar cualquier comando `ng` directamente (si tiene angular/cli global):

```powershell
ng serve
ng build --configuration production
```

Consejos adicionales:

- Para instalaciones en CI/CD prefiera `npm ci` (instala según lockfile si existe):

```powershell
npm ci
```

- Si necesita una versión específica del CLI para compatibilidad, puede instalarla localmente en `devDependencies` (ya está configurada) o globalmente con `npm install -g @angular/cli@<version>`.

## Notas finales

- El código fuente de la aplicación se encuentra en `app-oficios/src/app`.
- Si su entorno tiene restricciones de proxy o certificados, configure npm y Angular CLI según la documentación oficial.
- Si encuentra problemas al iniciar, copie aquí el error y lo reviso.

---

Archivo generado automáticamente: documentación básica para preparar y arrancar el proyecto en desarrollo.

