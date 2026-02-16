// 📁 src/app/domain/resenias/resenia.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ReseniaRequest {
  idUsuario: number;
  idProfesional: number;
  idTrabajo: number;
  puntuacion: number;
  comentario: string;
}

export interface ReseniaResponse {
  nombreUsuario: string;
  nombreProfesional: string;
  fecha: string;
  puntuacion: number;
  comentario: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReseniaService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/resenias`;

  constructor(private http: HttpClient) {}

  puntuarResenia(request: ReseniaRequest): Observable<ReseniaResponse> {
    const url = `${this.apiUrl}/puntuar/`;
    console.log('🌐 ReseniaService - Enviando petición a:', url);
    console.log('🌐 ReseniaService - Datos:', request);
    
    return this.http.post<ReseniaResponse>(url, request).pipe(
      tap({
        next: (response) => console.log('✅ ReseniaService - Respuesta exitosa:', response),
        error: (error) => console.error('❌ ReseniaService - Error en petición:', error)
      })
    );
  }
}
