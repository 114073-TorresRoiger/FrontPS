import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../domain/auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 (Unauthorized) o 403 (Forbidden), el token probablemente expiró
      if (error.status === 401 || error.status === 403) {
        // Limpiar la sesión y redirigir al login
        authService.logout();
        console.log('Token expirado o inválido, redirigiendo al login');
      }

      return throwError(() => error);
    })
  );
};
