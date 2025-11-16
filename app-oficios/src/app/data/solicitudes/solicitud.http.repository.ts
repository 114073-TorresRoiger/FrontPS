import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SolicitudRepository } from '../../domain/solicitudes/solicitud.repository';
import { SolicitudRequest, SolicitudResponse, SolicitudConProfesional } from '../../domain/solicitudes/solicitud.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SolicitudHttpRepository implements SolicitudRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/solicitudes`;

  enviarSolicitud(solicitud: SolicitudRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/enviar/`, solicitud);
  }

  responderSolicitud(idSolicitud: number, aceptada: boolean): Observable<any> {
    const params = new HttpParams().set('aceptada', aceptada.toString());
    return this.http.put(`${this.baseUrl}/responder/${idSolicitud}`, null, { params });
  }

  getSolicitud(idProfesional: number, estado: string): Observable<SolicitudResponse> {
    return this.http.get<SolicitudResponse>(`${this.baseUrl}/solicitud/${idProfesional}/${estado}`);
  }

  getSolicitudesByUsuario(idUsuario: number): Observable<SolicitudConProfesional[]> {
    return this.http.get<SolicitudConProfesional[]>(`${this.baseUrl}/usuario/${idUsuario}`);
  }
}
