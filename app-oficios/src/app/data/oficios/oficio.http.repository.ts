import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Oficio } from '../../domain/oficios/oficio.model';
import { OficioRepository } from '../../domain/oficios/oficio.repository';

@Injectable({ providedIn: 'root' })
export class OficioHttpRepository implements OficioRepository {
  private readonly http = inject(HttpClient);
  // In a real app, use environment variable
  private readonly baseUrl = '/api/oficios';

  list(): Observable<Oficio[]> {
    // Placeholder: simulate HTTP until backend exists
    const mock: Oficio[] = [
      { id: '1', nombre: 'Carpintero', descripcion: 'Trabajos de madera' },
      { id: '2', nombre: 'Electricista', descripcion: 'Instalaciones eléctricas' },
    ];
    // return this.http.get<Oficio[]>(`${this.baseUrl}`);
    return of(mock).pipe(delay(300));
  }
}
