import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../domain/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Lista de endpoints públicos que NO deben incluir el token
  const publicEndpoints = [
    '/api/v1/auth/',
    '/api/v1/registro/',
    '/api/v1/password/',
    '/api/v1/usuario/tipos-documento',
    '/api/v1/domicilios/',
    '/api/v1/oficios/',
    '/api/v1/perfil/profesional/oficio/',
    '/api/v1/perfil/profesionales/',
    '/api/v1/solicitudes/profesionales/',
    '/api/v1/solicitudes/turnos/disponibles/',
    '/api/v1/resenias/',
    '/api/v1/pagos/'
  ];

  // Verificar si la URL es un endpoint público
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  // Si es un endpoint público, NO agregar el token
  if (isPublicEndpoint) {
    return next(req);
  }

  // Si hay token disponible y NO es endpoint público, agregar el header Authorization
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  // Si no hay token, continuar con la petición original
  return next(req);
};
