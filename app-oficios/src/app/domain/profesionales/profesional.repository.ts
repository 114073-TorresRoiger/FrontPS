import { Observable } from 'rxjs';
import { ProfesionalRequest } from './profesional-request.model';

export abstract class ProfesionalRepository {
  abstract register(request: ProfesionalRequest): Observable<any>;
}
