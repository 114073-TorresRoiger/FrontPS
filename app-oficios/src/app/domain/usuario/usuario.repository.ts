import { Observable } from 'rxjs';
import { UsuarioRequest } from './usuario.model';
import { PerfilUsuario, PerfilUsuarioRequest } from './models/perfil.model';

export abstract class UsuarioRepository {
  abstract register(usuario: UsuarioRequest): Observable<any>;
  abstract login(email: string, password: string): Observable<any>;
  abstract getUserProfile(): Observable<any>;
  abstract updateProfile(usuario: Partial<UsuarioRequest>): Observable<any>;
  abstract getPerfilCliente(idUsuario: string): Observable<PerfilUsuario>;
  abstract updatePerfilCliente(idUsuario: string, perfil: PerfilUsuarioRequest): Observable<any>;
}
