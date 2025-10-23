import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfesionalRepository } from '../../domain/profesionales/profesional.repository';
import { ProfesionalRequest } from '../../domain/profesionales/profesional-request.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfesionalHttpRepository implements ProfesionalRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/registro`;

  register(request: ProfesionalRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/profesional`, request);
  }
}
