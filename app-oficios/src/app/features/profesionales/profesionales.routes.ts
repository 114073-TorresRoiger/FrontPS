import { Routes } from '@angular/router';
import { profesionalGuard } from '../../core/guards/profesional.guard';
import { noAdminGuard } from '../../core/guards/no-admin.guard';

export const PROFESIONALES_ROUTES: Routes = [
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro-profesional').then(m => m.RegistroProfesional)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard').then(m => m.ProfessionalDashboardComponent),
    canActivate: [noAdminGuard, profesionalGuard]
  },
  {
    path: 'facturas',
    loadComponent: () => import('./facturas').then(m => m.FacturasComponent),
    canActivate: [noAdminGuard, profesionalGuard]
  },
  {
    path: 'resenas',
    loadComponent: () => import('./resenas').then(m => m.ResenasComponent),
    canActivate: [noAdminGuard, profesionalGuard]
  },
  {
    path: 'metodos-pago',
    loadComponent: () => import('./metodos-pago').then(m => m.MetodosPagoComponent),
    canActivate: [noAdminGuard, profesionalGuard]
  }
];
