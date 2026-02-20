import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private hasReloaded = false;

  handleError(error: any): void {
    // Detectar errores de carga de módulos dinámicos (chunks)
    const chunkFailedMessage = /Loading chunk [\d]+ failed|Failed to fetch dynamically imported module/i;
    
    if (chunkFailedMessage.test(error?.message || error?.toString?.())) {
      console.warn('🔄 Chunk loading failed. Reloading page...');
      
      // Evitar loops infinitos de reload
      if (!this.hasReloaded) {
        this.hasReloaded = true;
        
        // Guardar la URL actual antes de recargar
        const currentUrl = window.location.href;
        
        // Esperar un momento antes de recargar para evitar race conditions
        setTimeout(() => {
          // Forzar reload desde el servidor (no usar caché)
          window.location.href = currentUrl;
        }, 100);
      } else {
        console.error('❌ Chunk loading failed after reload. Please clear your browser cache.');
        alert('Error al cargar la aplicación. Por favor, limpia el caché del navegador (Ctrl+Shift+R) y vuelve a intentarlo.');
      }
      return;
    }

    // Para otros errores, solo loguearlos
    console.error('❌ Global error:', error);
  }
}
