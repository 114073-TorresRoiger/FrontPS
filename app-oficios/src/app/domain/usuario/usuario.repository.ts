import { Observable } from 'rxjs';
import { UsuarioRequest } from './usuario.model';

export abstract class UsuarioRepository {
  abstract register(usuario: UsuarioRequest): Observable<any>;
  abstract login(email: string, password: string): Observable<any>;
  abstract getUserProfile(): Observable<any>;
  abstract updateProfile(usuario: Partial<UsuarioRequest>): Observable<any>;
}
