import { Observable } from 'rxjs';
import { Oficio } from './oficio.model';

export abstract class OficioRepository {
  abstract list(): Observable<Oficio[]>;
}
