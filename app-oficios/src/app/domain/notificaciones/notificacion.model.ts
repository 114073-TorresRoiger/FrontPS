export type TipoNotificacion = 'NUEVA_SOLICITUD' | 'TRABAJO_FINALIZADO' | 'MENSAJE_NUEVO';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  idRelacionado?: number; // ID de la solicitud, trabajo o mensaje relacionado
  urlAccion?: string; // URL para navegar al hacer clic
}

export interface NotificacionResponse {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  idRelacionado?: number;
  urlAccion?: string;
}
