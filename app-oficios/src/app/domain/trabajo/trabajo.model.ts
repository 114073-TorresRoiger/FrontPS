export interface Trabajo {
  id: number;
  idsolicitud: number;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'PAUSADO' | 'FINALIZADO' | 'CANCELADO';
  fechainicio?: string;
  fechafin?: string;
  tiempototaltrabajado?: number;
  ultimafechapausa?: string;
  tiempoantesdepausa?: number;
  descripcionfinalizacion?: string;
  costofinal?: number;
  motivocancelacion?: string;
  // Relaciones
  solicitud?: any;
  factura?: any;
}

export interface FinalizarTrabajoRequest {
  descripcionFinalizacion: string;
  costoFinal: number;
}

export interface TrabajoResponse extends Trabajo {
  nombreUsuario?: string;
  nombreProfesional?: string;
  descripcionOficio?: string;
}
