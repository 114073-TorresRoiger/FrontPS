import { Observable } from 'rxjs';
import { SolicitudRequest, SolicitudResponse } from './solicitud.model';

export abstract class SolicitudRepository {
  abstract enviarSolicitud(solicitud: SolicitudRequest): Observable<any>;
  abstract responderSolicitud(idSolicitud: number, aceptada: boolean): Observable<any>;
  abstract getSolicitud(idProfesional: number, estado: string): Observable<SolicitudResponse>;
}
