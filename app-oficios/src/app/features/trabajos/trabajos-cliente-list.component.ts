import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { Router } from '@angular/router';
import { TrabajoService } from '../../domain/trabajo/trabajo.service';
import { TrabajoResponse } from '../../domain/trabajo/trabajo.model';
import { AuthService } from '../../domain/auth/auth.service';

@Component({
  selector: 'app-trabajos-cliente-list',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf],
  templateUrl: './trabajos-cliente-list.component.html',
  styleUrls: ['./trabajos-cliente-list.component.scss']
})
export class TrabajosClienteListComponent implements OnInit {
  private readonly trabajoService = inject(TrabajoService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  trabajos = signal<TrabajoResponse[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarTrabajosCliente();
  }

  cargarTrabajosCliente(): void {
    this.loading.set(true);
    const usuarioActual = this.authService.getUsuario();
    const usuarioId = usuarioActual?.id ?? null;
    if (!usuarioId) {
      this.error.set('No se pudo obtener el usuario actual');
      this.loading.set(false);
      return;
    }
    this.trabajoService.obtenerTrabajosPorUsuario(usuarioId).subscribe({
      next: (trabajos) => {
        this.trabajos.set(trabajos);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar trabajos');
        this.loading.set(false);
      }
    });
  }

  tienePagoPendiente(trabajo: TrabajoResponse): boolean {
    return trabajo.estado === 'FINALIZADO' && !trabajo.estadoPago;
  }

  verDetalleTrabajo(idTrabajo: number): void {
    this.router.navigate(['/trabajos', idTrabajo]);
  }
}
