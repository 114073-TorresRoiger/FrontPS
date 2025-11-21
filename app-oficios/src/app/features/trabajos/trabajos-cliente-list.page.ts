import { Component } from '@angular/core';
import { TrabajosClienteListComponent } from './trabajos-cliente-list.component';

@Component({
  selector: 'app-trabajos-cliente-list-page',
  standalone: true,
  imports: [TrabajosClienteListComponent],
  template: `<app-trabajos-cliente-list></app-trabajos-cliente-list>`
})
export class TrabajosClienteListPage {}
