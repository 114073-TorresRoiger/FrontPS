import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeft,
  FileText,
  DollarSign,
  Star,
  AlertCircle,
  CheckCircle,
} from 'lucide-angular';
import { TrabajoService } from '../../domain/trabajo/trabajo.service';
import { TrabajoClienteResponse } from '../../domain/trabajo/trabajo.model';
import { SolicitudService } from '../../domain/solicitudes/solicitud.service';
import { AuthService } from '../../domain/auth';
import { ReseniaModalComponent } from '../home/resenia-modal/resenia-modal.component';

@Component({
  selector: 'app-trabajos-finalizados',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ReseniaModalComponent],
  templateUrl: './trabajos-finalizados.page.html',
  styleUrl: './trabajos-finalizados.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrabajosFinalizadosPage implements OnInit {
  private readonly router = inject(Router);
  private readonly trabajoService = inject(TrabajoService);
  private readonly solicitudService = inject(SolicitudService);
  readonly authService = inject(AuthService);

  // Icons
  readonly ArrowLeft = ArrowLeft;
  readonly FileText = FileText;
  readonly DollarSign = DollarSign;
  readonly Star = Star;
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle;

  // State
  trabajosFinalizados = signal<TrabajoClienteResponse[]>([]);
  isLoadingTrabajos = signal(false);
  showReseniaModal = signal(false);
  selectedTrabajoForResenia = signal<{
    trabajo: TrabajoClienteResponse;
    idProfesional: number;
  } | null>(null);

  ngOnInit(): void {
    this.loadTrabajosFinalizados();
  }

  private loadTrabajosFinalizados(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) return;

    this.isLoadingTrabajos.set(true);
    this.trabajoService.obtenerTrabajosFinalizadosPorCliente(user.id).subscribe({
      next: (trabajos) => {
        this.trabajosFinalizados.set(trabajos);
        this.isLoadingTrabajos.set(false);
      },
      error: (error) => {
        console.error('Error al cargar trabajos finalizados:', error);
        this.isLoadingTrabajos.set(false);
      },
    });
  }

  formatMoneda(monto: string): string {
    const montoNumero = parseFloat(monto);
    if (isNaN(montoNumero)) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(montoNumero);
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: Record<string, string> = {
      PENDIENTE: 'badge-pendiente',
      EN_CURSO: 'badge-en-curso',
      PAUSADO: 'badge-pausado',
      FINALIZADO: 'badge-finalizado',
      CANCELADO: 'badge-cancelado',
    };
    return classes[estado] || 'badge-default';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  trabajosPagados(): number {
    return this.trabajosFinalizados().filter(t => t.estadoPago === 'APROBADO').length;
  }

  resenasEnviadas(): number {
    return this.trabajosFinalizados().filter(t => t.tieneResenia).length;
  }

  irAPago(urlPago: string): void {
    if (urlPago) {
      window.open(urlPago, '_blank');
    }
  }

  abrirModalResenia(trabajo: TrabajoClienteResponse): void {
    console.log('🔍 Abriendo modal para trabajo:', trabajo);
    this.solicitudService.getSolicitudById(trabajo.idSolicitud).subscribe({
      next: (solicitud) => {
        console.log('Solicitud recibida:', solicitud);
        const idProfesional = solicitud.idProfesional;
        const dataParaModal = {
          trabajo: trabajo,
          idProfesional,
        };
        console.log('🔍 Datos que se pasarán al modal:', dataParaModal);
        this.selectedTrabajoForResenia.set(dataParaModal);
        this.showReseniaModal.set(true);
      },
      error: (error: any) => {
        console.error('Error al obtener solicitud:', error);
        alert('No se pudo cargar la información del profesional');
      },
    });
  }

  cerrarModalResenia(): void {
    this.showReseniaModal.set(false);
    this.selectedTrabajoForResenia.set(null);
  }

  onReseniaEnviada(): void {
    this.cerrarModalResenia();
    this.loadTrabajosFinalizados();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
