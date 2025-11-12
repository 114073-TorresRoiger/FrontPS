export interface SolicitudRequest {
  idUsuario: number;
  idProfesional: number;
  fechasolicitud: string; // ISO 8601 format
  fechaservicio: string; // ISO 8601 format
  observacion: string;
}

export interface SolicitudResponse {
  nombreUsuario: string;
  nombreProfesional: string;
  fechasolicitud: string;
  fechaservicio: string;
  direccion: string;
  observacion: string;
}
