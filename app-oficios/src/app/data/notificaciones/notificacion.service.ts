import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notificacion, NotificacionResponse, TipoNotificacion } from '../../domain/notificaciones/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private readonly API_URL = environment.apiUrl;
  
  // Señales para el estado reactivo
  notificaciones = signal<Notificacion[]>([]);
  notificacionesNoLeidas = signal<number>(0);
  mensajesNoLeidos = signal<number>(0);

  constructor(private http: HttpClient) {}

  /**
   * Cargar notificaciones del usuario actual
   */
  cargarNotificaciones(idUsuario: number): Observable<Notificacion[]> {
    // Por ahora simulamos notificaciones hasta que el backend las implemente
    return this.simularNotificaciones(idUsuario).pipe(
      map(notificaciones => {
        this.notificaciones.set(notificaciones);
        this.actualizarContadorNoLeidas();
        return notificaciones;
      }),
      catchError(error => {
        console.error('Error cargando notificaciones:', error);
        return of([]);
      })
    );
  }

  /**
   * Marcar notificación como leída
   */
  marcarComoLeida(idNotificacion: number): Observable<void> {
    const notificaciones = this.notificaciones();
    const notificacion = notificaciones.find(n => n.id === idNotificacion);
    
    if (notificacion) {
      notificacion.leida = true;
      this.notificaciones.set([...notificaciones]);
      this.actualizarContadorNoLeidas();
    }

    // TODO: Implementar llamada al backend cuando esté disponible
    return of(void 0);
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  marcarTodasComoLeidas(): Observable<void> {
    const notificaciones = this.notificaciones().map(n => ({
      ...n,
      leida: true
    }));
    
    this.notificaciones.set(notificaciones);
    this.actualizarContadorNoLeidas();

    // TODO: Implementar llamada al backend cuando esté disponible
    return of(void 0);
  }

  /**
   * Eliminar notificación
   */
  eliminarNotificacion(idNotificacion: number): Observable<void> {
    const notificaciones = this.notificaciones().filter(n => n.id !== idNotificacion);
    this.notificaciones.set(notificaciones);
    this.actualizarContadorNoLeidas();

    // TODO: Implementar llamada al backend cuando esté disponible
    return of(void 0);
  }

  /**
   * Agregar nueva notificación
   */
  agregarNotificacion(notificacion: Omit<Notificacion, 'id' | 'fecha' | 'leida'>): void {
    const notificaciones = this.notificaciones();
    const nuevaNotificacion: Notificacion = {
      id: Date.now(),
      fecha: new Date(),
      leida: false,
      ...notificacion
    };
    
    this.notificaciones.set([nuevaNotificacion, ...notificaciones]);
    this.actualizarContadorNoLeidas();
  }

  /**
   * Obtener contador de notificaciones no leídas
   */
  getNotificacionesNoLeidas(): number {
    return this.notificacionesNoLeidas();
  }

  /**
   * Obtener contador de mensajes no leídos
   */
  getMensajesNoLeidos(): number {
    return this.mensajesNoLeidos();
  }

  /**
   * Actualizar contador de mensajes no leídos
   */
  actualizarMensajesNoLeidos(cantidad: number): void {
    this.mensajesNoLeidos.set(cantidad);
  }

  /**
   * Actualizar contador de notificaciones no leídas
   */
  private actualizarContadorNoLeidas(): void {
    const noLeidas = this.notificaciones().filter(n => !n.leida).length;
    this.notificacionesNoLeidas.set(noLeidas);
  }

  /**
   * Simular notificaciones (temporal hasta que el backend lo implemente)
   */
  private simularNotificaciones(idUsuario: number): Observable<Notificacion[]> {
    // Simulamos algunas notificaciones de ejemplo
    const notificacionesEjemplo: Notificacion[] = [
      {
        id: 1,
        tipo: 'NUEVA_SOLICITUD',
        titulo: 'Nueva Solicitud Recibida',
        mensaje: 'Has recibido una nueva solicitud de trabajo',
        fecha: new Date(Date.now() - 3600000), // Hace 1 hora
        leida: false,
        urlAccion: '/profesional/solicitudes'
      },
      {
        id: 2,
        tipo: 'TRABAJO_FINALIZADO',
        titulo: 'Trabajo Finalizado',
        mensaje: 'El profesional ha marcado el trabajo como finalizado',
        fecha: new Date(Date.now() - 7200000), // Hace 2 horas
        leida: false,
        urlAccion: '/trabajos/finalizados'
      }
    ];

    // En un caso real, esto haría una petición HTTP al backend
    return of(notificacionesEjemplo);
  }

  /**
   * Convertir respuesta del backend a modelo del frontend
   */
  private mapearNotificacion(response: NotificacionResponse): Notificacion {
    return {
      id: response.id,
      tipo: response.tipo,
      titulo: response.titulo,
      mensaje: response.mensaje,
      fecha: new Date(response.fecha),
      leida: response.leida,
      idRelacionado: response.idRelacionado,
      urlAccion: response.urlAccion
    };
  }
}
