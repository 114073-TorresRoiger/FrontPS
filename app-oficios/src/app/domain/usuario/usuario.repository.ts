import { Observable } from 'rxjs';
import { UsuarioRequest, MetricasUsuarios, UsuarioMetrica, ProfesionalMetrica } from './usuario.model';
import { PerfilUsuario, PerfilUsuarioRequest } from './models/perfil.model';

export abstract class UsuarioRepository {
  abstract register(usuario: UsuarioRequest): Observable<any>;
  abstract login(email: string, password: string): Observable<any>;
  abstract getUserProfile(): Observable<any>;
  abstract updateProfile(usuario: Partial<UsuarioRequest>): Observable<any>;
  abstract getPerfilCliente(idUsuario: string): Observable<PerfilUsuario>;
  abstract updatePerfilCliente(idUsuario: string, perfil: PerfilUsuarioRequest): Observable<any>;
  abstract updateAvatar(idAuth: number, avatarUrl: string): Observable<any>;
  abstract getAvatar(idAuth: number): Observable<string>;
  abstract getMetricasUsuarios(): Observable<MetricasUsuarios>;
  abstract getUsuariosMetrica(limit?: number): Observable<UsuarioMetrica[]>;
  abstract getProfesionalesMetrica(limit?: number): Observable<ProfesionalMetrica[]>;
}
