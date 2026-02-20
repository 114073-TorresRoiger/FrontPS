import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private reloadAttempts = 0;
  private readonly maxReloadAttempts = 2;
  private readonly reloadKey = 'chunk_reload_timestamp';

  handleError(error: any): void {
    const errorMessage = error?.message || error?.toString?.() || '';
    
    // Detectar errores de carga de módulos dinámicos (chunks)
    const isChunkError = 
      /Loading chunk [\d]+ failed/i.test(errorMessage) ||
      /Failed to fetch dynamically imported module/i.test(errorMessage) ||
      /ChunkLoadError/i.test(errorMessage) ||
      /Failed to load module script/i.test(errorMessage) ||
      (errorMessage.includes('chunk') && errorMessage.includes('failed'));
    
    if (isChunkError) {
      console.warn('🔄 Chunk loading failed:', errorMessage);
      
      // Verificar si ya intentamos recargar recientemente
      const lastReload = sessionStorage.getItem(this.reloadKey);
      const now = Date.now();
      
      // Si recargamos hace menos de 10 segundos, no volver a recargar
      if (lastReload && (now - parseInt(lastReload, 10)) < 10000) {
        console.error('❌ Chunk loading failed after recent reload. Please clear your browser cache.');
        this.showUserFriendlyError();
        return;
      }
      
      // Guardar timestamp y recargar
      sessionStorage.setItem(this.reloadKey, now.toString());
      console.log('🔄 Forcing hard reload...');
      
      // Forzar reload desde el servidor (ignorar caché)
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }

    // Para otros errores, solo loguearlos
    console.error('❌ Global error:', error);
  }
  
  private showUserFriendlyError(): void {
    // Crear un overlay de error amigable
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8); z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; color: white; font-family: sans-serif;
    `;
    overlay.innerHTML = `
      <h2 style="margin-bottom: 20px;">Se detectó una actualización</h2>
      <p style="margin-bottom: 20px;">Por favor, recarga la página para obtener la última versión.</p>
      <button onclick="window.location.reload()" style="
        padding: 12px 24px; font-size: 16px; cursor: pointer;
        background: #22c55e; color: white; border: none; border-radius: 8px;
      ">Recargar página</button>
    `;
    document.body.appendChild(overlay);
  }
}
