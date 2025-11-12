import { Observable } from 'rxjs';
import { ProfesionalRequest } from './profesional-request.model';
import { PerfilProfesional } from './models/perfil-profesional.model';

export abstract class ProfesionalRepository {
  abstract register(request: ProfesionalRequest): Observable<any>;
  abstract getProfesionalesByOficio(oficio: string): Observable<PerfilProfesional[]>;
}
