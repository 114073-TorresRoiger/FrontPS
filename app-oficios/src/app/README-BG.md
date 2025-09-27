Uso de background global `.app-bg`

Este archivo contiene instrucciones para usar la clase global `.app-bg` que centraliza el background (gradiente + patrón) usado en las pantallas de autenticación y demás vistas.

1) La clase y variables globales se encuentran en `src/app/app.scss`.

2) `src/styles.scss` importa `src/app/app.scss` automáticamente, por lo que la clase `.app-bg` y las variables SCSS están disponibles globalmente.

3) Para aplicar el background a una página o componente, añade la clase al contenedor root de la plantilla. Ejemplo en un template HTML:

<div class="login-container app-bg"> ... </div>

ó si tu componente usa su propio contenedor:

<div class="registro-container app-bg"> ... </div>

4) Alternativa (si el contenedor tiene estilos `@extend` o `@include`): puedes `@extend .app-bg;` desde el SCSS del componente:

.registro-container {
  @extend .app-bg;
}

5) Nota: si usas `@extend` en archivos parciales, asegúrate de que `app.scss` se compile antes o esté importado en `styles.scss` (ya está configurado en este proyecto).

Con esto se evita duplicación y asegura consistencia visual entre pantallas.
