import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioRepository } from '../../domain/usuario/usuario.repository';
import { UsuarioRequest } from '../../domain/usuario/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioHttpRepository implements UsuarioRepository {
  private readonly http = inject(HttpClient);
  // In a real app, use environment variable
  private readonly baseUrl = '/api/usuarios';

  register(usuario: UsuarioRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, usuario);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password });
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/profile`);
  }

  updateProfile(usuario: Partial<UsuarioRequest>): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile`, usuario);
  }
}
