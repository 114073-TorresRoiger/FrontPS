import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagoRepository } from '../../domain/pago/pago.repository';
import { FacturaRequest, PreferenceResponse, MercadoPagoConfig } from '../../domain/pago/pago.model';

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
}
