import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  FileText,
  MessageSquare,
  CreditCard,
  Calendar,
  ArrowLeft,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  X as XIcon,
  Check,
  LogOut,
  Play,
  Pause,
  Square,
  Ban,
  Inbox,
  MapPin
} from 'lucide-angular';
import { AuthService } from '../../../domain/auth';
import { GetSolicitudesUseCase } from '../../../domain/solicitudes/use-cases/get-solicitudes.usecase';
import { ResponderSolicitudUseCase } from '../../../domain/solicitudes/use-cases/responder-solicitud.usecase';
import { SolicitudResponse } from '../../../domain/solicitudes/solicitud.model';
import { TrabajoService } from '../../../domain/trabajo/trabajo.service';
import { PagoService } from '../../../domain/pago/pago.service';
import { SolicitudMapComponent } from '../../../domain/solicitudes/solicitud-map.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}

interface SolicitudPendiente {
  idSolicitud: number;
  nombreUsuario: string;
  fechasolicitud: string;
  fechaservicio: string;
  direccion: string;
  observacion: string;
  horaReserva?: string;
}

@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, SolicitudMapComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class ProfessionalDashboardComponent implements OnInit {
  readonly TrendingUp = TrendingUp;
  readonly DollarSign = DollarSign;
  readonly Users = Users;
  readonly LogOut = LogOut;
  readonly Star = Star;
  readonly FileText = FileText;
  readonly MessageSquare = MessageSquare;
  readonly CreditCard = CreditCard;
  readonly Calendar = Calendar;
  readonly ArrowLeft = ArrowLeft;
  readonly Award = Award;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly XIcon = XIcon;
  readonly Check = Check;
  readonly Play = Play;
  readonly Pause = Pause;
  readonly Square = Square;
  readonly Ban = Ban;
  readonly Inbox = Inbox;
  readonly MapPin = MapPin;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly getSolicitudesUseCase = inject(GetSolicitudesUseCase);
  private readonly responderSolicitudUseCase = inject(ResponderSolicitudUseCase);
  private readonly trabajoService = inject(TrabajoService);
  private readonly pagoService = inject(PagoService);
  private readonly http = inject(HttpClient);

  userName = signal<string>('');
  solicitudesPendientes = signal<SolicitudPendiente[]>([]);
  isLoadingSolicitudes = signal(false);
  respondingToSolicitud = signal<number | null>(null);

  // Modal de respuesta
  showResponseModal = signal(false);
  responseModalType = signal<'success' | 'error'>('success');
  responseModalMessage = signal('');

  // Trabajos
  trabajos = signal<any[]>([]);
  isLoadingTrabajos = signal(false);

  // Modal de finalizar trabajo
  showFinalizarModal = signal(false);
  trabajoAFinalizar = signal<number | null>(null);
  descripcionFinalizacion = signal('');
  costoFinalTrabajo = signal<number>(0);

  // Modal de cancelar trabajo
  showCancelarModal = signal(false);
  trabajoACancelar = signal<number | null>(null);
  motivoCancelacion = signal('');

  // Loading states para acciones
  actionLoading = signal<number | null>(null);

  // ====== NUEVA FUNCIONALIDAD: Vista de Solicitudes con Mapa ======
  mostrarVistaSolicitudes = signal(false);
  solicitudesConMapa = signal<any[]>([]);
  solicitudSeleccionadaMapa = signal<any>(null);
  isLoadingSolicitudesConMapa = signal(false);
  showDetalleMapaModal = signal(false);

  metrics = signal<Metric[]>([
    {
      title: 'Ingresos del Mes',
      value: '$12,450',
      change: '+12.5%',
      trend: 'up',
      icon: this.DollarSign
    },
    {
      title: 'Trabajos Completados',
      value: '24',
      change: '+8.3%',
      trend: 'up',
      icon: this.CheckCircle
    },
    {
      title: 'Clientes Activos',
      value: '18',
      change: '+15.2%',
      trend: 'up',
      icon: this.Users
    },
    {
      title: 'Calificación Promedio',
      value: '4.8',
      change: '+0.2',
      trend: 'up',
      icon: this.Star
    }
  ]);

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    console.log('Dashboard - Usuario actual:', user);

    if (user) {
      this.userName.set(`${user.name} ${user.lastName}`);

      if (user.idProfesional) {
        console.log('Dashboard - Cargando solicitudes para profesional ID:', user.idProfesional);
        this.loadSolicitudesPendientes(user.idProfesional);
        this.loadTrabajos();
      } else {
        console.warn('Dashboard - Usuario no tiene idProfesional asignado');
      }
    } else {
      console.error('Dashboard - No hay usuario autenticado');
    }
  }

  // ====== NUEVOS MÉTODOS PARA SOLICITUDES CON MAPA ======
  
  async verTodasLasSolicitudes() {
    this.mostrarVistaSolicitudes.set(true);
    await this.cargarSolicitudesConMapa();
  }

  volverAlDashboard() {
    this.mostrarVistaSolicitudes.set(false);
    this.solicitudSeleccionadaMapa.set(null);
  }

  async cargarSolicitudesConMapa() {
    const user = this.authService.getCurrentUser();
    if (!user?.idProfesional) return;

    this.isLoadingSolicitudesConMapa.set(true);

    try {
      const url = `${environment.apiUrl}/api/v1/solicitudes/profesional/${user.idProfesional}/con-ubicacion`;
      const result = await this.http.get<any[]>(url).toPromise();
      this.solicitudesConMapa.set(result || []);
      console.log('✅ Solicitudes con mapa cargadas:', result);
    } catch (error) {
      console.error('❌ Error cargando solicitudes con mapa:', error);
      this.solicitudesConMapa.set([]);
    } finally {
      this.isLoadingSolicitudesConMapa.set(false);
    }
  }

  verDetalleSolicitudMapa(solicitud: any) {
    console.log('👁️ Abriendo detalle con mapa:', solicitud);
    this.solicitudSeleccionadaMapa.set(solicitud);
    this.showDetalleMapaModal.set(true);
  }

  cerrarDetalleMapaModal() {
    this.showDetalleMapaModal.set(false);
    setTimeout(() => {
      this.solicitudSeleccionadaMapa.set(null);
    }, 300);
  }

  async aceptarSolicitudConMapa(idSolicitud: number) {
    if (!confirm('¿Estás seguro de que deseas aceptar esta solicitud?')) {
      return;
    }

    this.respondingToSolicitud.set(idSolicitud);

    this.responderSolicitudUseCase.execute(idSolicitud, true).subscribe({
      next: () => {
        this.crearTrabajo(idSolicitud);
        this.cerrarDetalleMapaModal();
      },
      error: (error) => {
        console.error('❌ Error al aceptar solicitud:', error);
        this.respondingToSolicitud.set(null);
        this.showErrorModal('Error al aceptar la solicitud');
      }
    });
  }

  async rechazarSolicitudConMapa(idSolicitud: number) {
    if (!confirm('¿Estás seguro de que deseas rechazar esta solicitud?')) {
      return;
    }

    this.respondingToSolicitud.set(idSolicitud);

    this.responderSolicitudUseCase.execute(idSolicitud, false).subscribe({
      next: () => {
        this.respondingToSolicitud.set(null);
        this.showSuccessModal('Solicitud rechazada exitosamente');
        this.cerrarDetalleMapaModal();
        this.cargarSolicitudesConMapa();
        
        const user = this.authService.getCurrentUser();
        if (user?.idProfesional) {
          this.loadSolicitudesPendientes(user.idProfesional);
        }
      },
      error: (error) => {
        console.error('❌ Error al rechazar solicitud:', error);
        this.respondingToSolicitud.set(null);
        this.showErrorModal('Error al rechazar la solicitud');
      }
    });
  }

  // ====== MÉTODOS EXISTENTES ======

  private loadSolicitudesPendientes(idProfesional: number) {
    this.isLoadingSolicitudes.set(true);

    this.getSolicitudesUseCase.execute(idProfesional, 'PENDIENTE').subscribe({
      next: (solicitudes: SolicitudResponse[]) => {
        const solicitudesPendientes: SolicitudPendiente[] = solicitudes.map(solicitud => ({
          idSolicitud: solicitud.idSolicitud,
          nombreUsuario: solicitud.nombreUsuario,
          fechasolicitud: solicitud.fechasolicitud,
          fechaservicio: solicitud.fechaservicio,
          direccion: solicitud.direccion,
          observacion: solicitud.observacion,
          horaReserva: solicitud.horaReserva
        }));

        this.solicitudesPendientes.set(solicitudesPendientes);
        this.isLoadingSolicitudes.set(false);
        console.log('✅ Solicitudes cargadas:', solicitudesPendientes.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar solicitudes:', error);
        this.solicitudesPendientes.set([]);
        this.isLoadingSolicitudes.set(false);
      }
    });
  }

  responderSolicitud(idSolicitud: number, aceptada: boolean) {
    this.respondingToSolicitud.set(idSolicitud);
    console.log(`📤 Enviando respuesta: idSolicitud=${idSolicitud}, aceptada=${aceptada}`);

    this.responderSolicitudUseCase.execute(idSolicitud, aceptada).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del servidor:', response);

        if (aceptada) {
          console.log('🛠️ Creando trabajo para solicitud:', idSolicitud);
          this.crearTrabajo(idSolicitud);
        } else {
          const solicitudes = this.solicitudesPendientes();
          this.solicitudesPendientes.set(
            solicitudes.filter(s => s.idSolicitud !== idSolicitud)
          );
          this.respondingToSolicitud.set(null);
          this.showSuccessModal('Solicitud rechazada exitosamente');

          const user = this.authService.getCurrentUser();
          if (user?.idProfesional) {
            this.loadSolicitudesPendientes(user.idProfesional);
          }
        }
      },
      error: (error) => {
        console.error('❌ Error respondiendo solicitud:', error);
        this.respondingToSolicitud.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al responder la solicitud: ${mensajeError}`);
      }
    });
  }

  crearTrabajo(idSolicitud: number) {
    this.trabajoService.crearTrabajo(idSolicitud).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo creado:', trabajo);

        const solicitudes = this.solicitudesPendientes();
        this.solicitudesPendientes.set(
          solicitudes.filter(s => s.idSolicitud !== idSolicitud)
        );
        this.respondingToSolicitud.set(null);

        this.showSuccessModal('Solicitud aceptada y trabajo creado exitosamente. El profesional debe iniciarlo manualmente.');
        this.loadTrabajos();
        
        // Recargar también las solicitudes con mapa si está en esa vista
        if (this.mostrarVistaSolicitudes()) {
          this.cargarSolicitudesConMapa();
        }

        const user = this.authService.getCurrentUser();
        if (user?.idProfesional) {
          this.loadSolicitudesPendientes(user.idProfesional);
        }
      },
      error: (error) => {
        console.error('❌ Error al crear trabajo:', error);
        this.respondingToSolicitud.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al crear el trabajo: ${mensajeError}`);
      }
    });
  }

  iniciarTrabajoManual(idTrabajo: number) {
    this.actionLoading.set(idTrabajo);
    this.trabajoService.iniciarTrabajo(idTrabajo).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo iniciado:', trabajo);
        this.actionLoading.set(null);
        this.showSuccessModal('Trabajo iniciado exitosamente');
        this.loadTrabajos();
      },
      error: (error) => {
        console.error('❌ Error al iniciar trabajo:', error);
        this.actionLoading.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al iniciar trabajo: ${mensajeError}`);
      }
    });
  }

  pausarTrabajoManual(idTrabajo: number) {
    this.actionLoading.set(idTrabajo);
    this.trabajoService.pausarTrabajo(idTrabajo).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo pausado:', trabajo);
        this.actionLoading.set(null);
        this.showSuccessModal('Trabajo pausado exitosamente');
        this.loadTrabajos();
      },
      error: (error) => {
        console.error('❌ Error al pausar trabajo:', error);
        this.actionLoading.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al pausar trabajo: ${mensajeError}`);
      }
    });
  }

  reanudarTrabajoManual(idTrabajo: number) {
    this.actionLoading.set(idTrabajo);
    this.trabajoService.reanudarTrabajo(idTrabajo).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo reanudado:', trabajo);
        this.actionLoading.set(null);
        this.showSuccessModal('Trabajo reanudado exitosamente');
        this.loadTrabajos();
      },
      error: (error) => {
        console.error('❌ Error al reanudar trabajo:', error);
        this.actionLoading.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al reanudar trabajo: ${mensajeError}`);
      }
    });
  }

  openFinalizarModal(idTrabajo: number) {
    this.trabajoAFinalizar.set(idTrabajo);
    this.descripcionFinalizacion.set('');
    this.costoFinalTrabajo.set(0);
    this.showFinalizarModal.set(true);
  }

  closeFinalizarModal() {
    this.showFinalizarModal.set(false);
    this.trabajoAFinalizar.set(null);
    this.descripcionFinalizacion.set('');
    this.costoFinalTrabajo.set(0);
  }

  confirmarFinalizarTrabajo() {
    const idTrabajo = this.trabajoAFinalizar();
    const observaciones = this.descripcionFinalizacion();
    const montoFinal = this.costoFinalTrabajo();

    if (!idTrabajo || !observaciones || montoFinal <= 0) {
      this.showErrorModal('Debe completar todos los campos para finalizar el trabajo');
      return;
    }

    this.actionLoading.set(idTrabajo);
    this.trabajoService.finalizarTrabajo(idTrabajo, observaciones, montoFinal).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo finalizado:', trabajo);
        this.crearFacturaTrabajo(trabajo.idSolicitud, trabajo.idTrabajo, trabajo.oficio, montoFinal);
      },
      error: (error) => {
        console.error('❌ Error al finalizar trabajo:', error);
        this.actionLoading.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al finalizar trabajo: ${mensajeError}`);
      }
    });
  }

  crearFacturaTrabajo(idSolicitud: number, idTrabajo: number, oficio: string, monto: number) {
    const facturaRequest = {
      idSolicitud: idSolicitud,
      idTrabajo: idTrabajo,
      titulo: `Pago por servicio de ${oficio}`,
      descripcion: `Trabajo finalizado - ${oficio}`,
      cantidad: 1,
      monto: monto
    };

    console.log('📄 Creando factura:', facturaRequest);

    this.pagoService.crearPreferencia(facturaRequest).subscribe({
      next: (response) => {
        console.log('✅ Factura creada:', response);
        this.actionLoading.set(null);
        this.closeFinalizarModal();
        this.showSuccessModal('Trabajo finalizado y factura creada exitosamente');
        this.loadTrabajos();
      },
      error: (error) => {
        console.error('❌ Error al crear factura:', error);
        this.actionLoading.set(null);
        this.closeFinalizarModal();
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Trabajo finalizado pero error al crear factura: ${mensajeError}`);
        this.loadTrabajos();
      }
    });
  }

  openCancelarModal(idTrabajo: number) {
    this.trabajoACancelar.set(idTrabajo);
    this.motivoCancelacion.set('');
    this.showCancelarModal.set(true);
  }

  closeCancelarModal() {
    this.showCancelarModal.set(false);
    this.trabajoACancelar.set(null);
    this.motivoCancelacion.set('');
  }

  confirmarCancelarTrabajo() {
    const idTrabajo = this.trabajoACancelar();
    const motivo = this.motivoCancelacion();

    if (!idTrabajo || !motivo) {
      this.showErrorModal('Debe proporcionar un motivo para cancelar el trabajo');
      return;
    }

    this.actionLoading.set(idTrabajo);
    this.trabajoService.cancelarTrabajo(idTrabajo, motivo).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo cancelado:', trabajo);
        this.actionLoading.set(null);
        this.closeCancelarModal();
        this.showSuccessModal('Trabajo cancelado exitosamente');
        this.loadTrabajos();
      },
      error: (error) => {
        console.error('❌ Error al cancelar trabajo:', error);
        this.actionLoading.set(null);
        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al cancelar trabajo: ${mensajeError}`);
      }
    });
  }

  showSuccessModal(message: string) {
    this.responseModalType.set('success');
    this.responseModalMessage.set(message);
    this.showResponseModal.set(true);
  }

  showErrorModal(message: string) {
    this.responseModalType.set('error');
    this.responseModalMessage.set(message);
    this.showResponseModal.set(true);
  }

  closeResponseModal() {
    this.showResponseModal.set(false);
  }

  loadTrabajos() {
    const user = this.authService.getCurrentUser();
    if (!user?.idProfesional) return;

    this.isLoadingTrabajos.set(true);
    this.trabajoService.obtenerTrabajosPorProfesional(user.idProfesional).subscribe({
      next: (trabajos) => {
        console.log('✅ Trabajos cargados:', trabajos);
        this.trabajos.set(trabajos);
        this.isLoadingTrabajos.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar trabajos:', error);
        this.trabajos.set([]);
        this.isLoadingTrabajos.set(false);
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'PENDIENTE': 'badge-pendiente',
      'EN_CURSO': 'badge-en-curso',
      'PAUSADO': 'badge-pausado',
      'FINALIZADO': 'badge-finalizado',
      'CANCELADO': 'badge-cancelado'
    };
    return classes[estado] || 'bg-secondary';
  }

  getBadgeClassSolicitud(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning';
      case 'ACEPTADA': return 'bg-success';
      case 'RECHAZADA': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatMoneda(monto: number | null): string {
    if (monto === null) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-AR');
    }
  }

  formatHora(hora: string): string {
    if (!hora) return '';
    return hora.substring(0, 5);
  }

  goToInvoices() {
    this.router.navigate(['/profesionales/facturas']);
  }

  goToReviews() {
    this.router.navigate(['/profesionales/resenas']);
  }

  goToMessages() {
    this.router.navigate(['/chat']);
  }

  goToPaymentMethods() {
    this.router.navigate(['/profesionales/metodos-pago']);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout();
  }
}