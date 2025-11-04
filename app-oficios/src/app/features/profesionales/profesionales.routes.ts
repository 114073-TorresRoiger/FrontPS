import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PROFESIONALES_ROUTES: Routes = [
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro-profesional').then(m => m.RegistroProfesional)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard').then(m => m.ProfessionalDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'facturas',
    loadComponent: () => import('./facturas').then(m => m.FacturasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'resenas',
    loadComponent: () => import('./resenas').then(m => m.ResenasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'metodos-pago',
    loadComponent: () => import('./metodos-pago').then(m => m.MetodosPagoComponent),
    canActivate: [authGuard]
  }
];
