import { Provider } from '@angular/core';
import { OficioRepository } from '../domain/oficios/oficio.repository';
import { OficioHttpRepository } from '../data/oficios/oficio.http.repository';
import { UsuarioRepository } from '../domain/usuario/usuario.repository';
import { UsuarioHttpRepository } from '../data/usuario/usuario.http.repository';
import { ProfesionalRepository } from '../domain/profesionales/profesional.repository';
import { ProfesionalHttpRepository } from '../data/profesionales/profesional.http.repository';

export const CORE_PROVIDERS: Provider[] = [
  { provide: OficioRepository, useClass: OficioHttpRepository },
  { provide: UsuarioRepository, useClass: UsuarioHttpRepository },
  { provide: ProfesionalRepository, useClass: ProfesionalHttpRepository },
];
