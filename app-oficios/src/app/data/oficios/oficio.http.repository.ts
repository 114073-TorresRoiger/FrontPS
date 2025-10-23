import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Oficio } from '../../domain/oficios/oficio.model';
import { OficioRepository } from '../../domain/oficios/oficio.repository';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OficioHttpRepository implements OficioRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/oficios`;

  list(): Observable<Oficio[]> {
    return this.http.get<Oficio[]>(`${this.baseUrl}/all`);
  }
}
