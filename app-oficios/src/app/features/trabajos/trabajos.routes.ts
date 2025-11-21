import { Routes } from '@angular/router';
import { TRABAJOS_CLIENTE_LIST_ROUTES } from './trabajos-cliente-list.routes';
import { TrabajoDetalleComponent } from './trabajo-detalle.component';

export const TRABAJOS_ROUTES: Routes = [
  {
    path: '',
    children: [
      ...TRABAJOS_CLIENTE_LIST_ROUTES,
      {
        path: ':id',
        component: TrabajoDetalleComponent
      }
    ]
  }
];
