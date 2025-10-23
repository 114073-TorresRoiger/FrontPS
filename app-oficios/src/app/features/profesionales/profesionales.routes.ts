import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PROFESIONALES_ROUTES: Routes = [
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro-profesional').then(m => m.RegistroProfesional)
  }
];
