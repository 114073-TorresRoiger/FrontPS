export interface SolicitudRequest {
  idUsuario: number;
  idProfesional: number;
  fechasolicitud: string; // ISO 8601 format
  fechaservicio: string; // ISO 8601 format
  observacion: string;
  horaReserva?: string; // Hora reservada en formato HH:mm:ss
}

export interface SolicitudResponse {
  idSolicitud: number;
  nombreUsuario: string;
  nombreProfesional: string;
  fechasolicitud: string;
  fechaservicio: string;
  direccion: string;
  observacion: string;
  horaReserva?: string; // Hora reservada en formato HH:mm:ss
}

export interface SolicitudConProfesional {
  idSolicitud: number;
  idProfesional: number;
  nombreProfesional: string;
  apellidoProfesional: string;
  especialidad?: string; // Opcional porque puede no venir del backend
  fechaSolicitud: string;
  estado: string;
  imagenUrl?: string;
}

export interface TurnoDisponible {
  fecha: string; // LocalDate en formato ISO (YYYY-MM-DD)
  horaInicio: string; // LocalTime en formato ISO (HH:mm:ss)
  horaFin: string; // LocalTime en formato ISO (HH:mm:ss)
  disponible: boolean;
}

export interface ConfirmarTurnoRequest {
  idUsuario: number;
  idProfesional: number;
  fecha: string; // LocalDate formato YYYY-MM-DD
  hora: string; // LocalTime formato HH:mm:ss
  duracion: number; // minutos, default 60
  observacion?: string;
}
