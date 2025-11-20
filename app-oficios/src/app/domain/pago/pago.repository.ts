import { Observable } from 'rxjs';
import { FacturaRequest, PreferenceResponse, MercadoPagoConfig } from './pago.model';

export abstract class PagoRepository {
  abstract crearPreferencia(request: FacturaRequest): Observable<PreferenceResponse>;
  abstract obtenerConfiguracion(): Observable<MercadoPagoConfig>;
}
