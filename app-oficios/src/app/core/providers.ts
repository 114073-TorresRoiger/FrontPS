import { Provider } from '@angular/core';
import { OficioRepository } from '../domain/oficios/oficio.repository';
import { OficioHttpRepository } from '../data/oficios/oficio.http.repository';

export const CORE_PROVIDERS: Provider[] = [
  { provide: OficioRepository, useClass: OficioHttpRepository },
];
