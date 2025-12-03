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
  cargarNotificaciones(idUsuario: number, isProfessional: boolean = false): Observable<Notificacion[]> {
    // Si es profesional, cargar notificaciones de nuevas solicitudes
    if (isProfessional) {
      return this.cargarNotificacionesProfesional(idUsuario);
    }
    
    // Si es cliente, cargar notificaciones de trabajos finalizados
    return this.cargarNotificacionesCliente(idUsuario);
  }

  /**
   * Cargar notificaciones específicas de profesional (nuevas solicitudes)
   */
  private cargarNotificacionesProfesional(idProfesional: number): Observable<Notificacion[]> {
    // Usar el endpoint correcto: /solicitud/{idProfesional}/{estado}
    return this.http.get<any[]>(`${this.API_URL}/api/v1/solicitudes/solicitud/${idProfesional}/PENDIENTE`)
      .pipe(
        map(solicitudes => {
          // Mapear las solicitudes pendientes a notificaciones
          const notificaciones = solicitudes.map((solicitud) => ({
            id: solicitud.idSolicitud,
            tipo: 'NUEVA_SOLICITUD' as TipoNotificacion,
            titulo: 'Nueva Solicitud Recibida',
            mensaje: `${solicitud.nombreCliente} ${solicitud.apellidoCliente} te ha enviado una solicitud`,
            fecha: new Date(solicitud.fechaSolicitud),
            leida: false,
            idRelacionado: solicitud.idSolicitud,
            urlAccion: '/profesionales/dashboard?view=solicitudes'
          }));
          
          this.notificaciones.set(notificaciones);
          this.actualizarContadorNoLeidas();
          return notificaciones;
        }),
        catchError(error => {
          console.error('Error cargando notificaciones de profesional:', error);
          // En caso de error 403/404 o cualquier otro, simplemente retornar array vacío
          // No es crítico, las notificaciones son una feature nice-to-have
          this.notificaciones.set([]);
          this.actualizarContadorNoLeidas();
          return of([]);
        })
      );
  }

  /**
   * Cargar notificaciones específicas de cliente (trabajos finalizados)
   */
  private cargarNotificacionesCliente(idUsuario: number): Observable<Notificacion[]> {
    // TODO: Implementar cuando el backend tenga endpoint de notificaciones
    // Por ahora retornamos array vacío para clientes
    this.notificaciones.set([]);
    this.actualizarContadorNoLeidas();
    return of([]);
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
