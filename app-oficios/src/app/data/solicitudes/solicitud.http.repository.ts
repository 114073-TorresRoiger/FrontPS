import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { SolicitudRepository } from '../../domain/solicitudes/solicitud.repository';
import { SolicitudRequest, SolicitudResponse } from '../../domain/solicitudes/solicitud.model';
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
    return this.http.put(`${this.baseUrl}/responder/${idSolicitud}`, null, {
      params,
      responseType: 'text'
    });
  }

  getSolicitud(idProfesional: number, estado: string): Observable<SolicitudResponse | null> {
    return this.http.get<SolicitudResponse>(`${this.baseUrl}/solicitud/${idProfesional}/${estado}`, {
      observe: 'response'
    }).pipe(
      map(response => {
        // Si el status es 204 (No Content), retornar null
        if (response.status === 204 || !response.body) {
          return null;
        }
        return response.body;
      }),
      catchError(error => {
        // Si hay error 404 o cualquier otro, retornar null (no hay solicitudes)
        console.log('No hay solicitudes disponibles:', error.status);
        return of(null);
      })
    );
  }
}
