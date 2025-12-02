import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagoRepository } from '../../domain/pago/pago.repository';
import { FacturaRequest, PreferenceResponse, MercadoPagoConfig, PagoFactura } from '../../domain/pago/pago.model';

@Injectable({ providedIn: 'root' })
export class PagoHttpRepository implements PagoRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/pagos`;

  crearPreferencia(request: FacturaRequest): Observable<PreferenceResponse> {
    return this.http.post<PreferenceResponse>(`${this.baseUrl}/crear-preferencia`, request);
  }

  obtenerConfiguracion(): Observable<MercadoPagoConfig> {
    return this.http.get<MercadoPagoConfig>(`${this.baseUrl}/config`);
  }

  historialIngresos(desde: string, hasta: string, idProfesional?: number): Observable<PagoFactura[]> {
    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    if (idProfesional) {
      params = params.set('idProfesional', idProfesional.toString());
    }

    return this.http.get<PagoFactura[]>(`${this.baseUrl}/historial-ingresos`, { params });
  }
}
