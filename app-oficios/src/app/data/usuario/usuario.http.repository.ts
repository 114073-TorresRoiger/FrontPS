import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioRepository } from '../../domain/usuario/usuario.repository';
import { UsuarioRequest } from '../../domain/usuario/usuario.model';
import { PerfilUsuario, PerfilUsuarioRequest } from '../../domain/usuario/models/perfil.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioHttpRepository implements UsuarioRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  register(usuario: UsuarioRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/register`, usuario);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/login`, { email, password });
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios/profile`);
  }

  updateProfile(usuario: Partial<UsuarioRequest>): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/profile`, usuario);
  }

  getPerfilCliente(idUsuario: string): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${this.baseUrl}/perfil/cliente/${idUsuario}`);
  }

  updatePerfilCliente(idUsuario: string, perfil: PerfilUsuarioRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/perfil/cliente/${idUsuario}`, perfil);
  }
}
