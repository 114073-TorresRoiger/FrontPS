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
  LogOut
} from 'lucide-angular';
import { AuthService } from '../../../domain/auth';
import { GetSolicitudesUseCase } from '../../../domain/solicitudes/use-cases/get-solicitudes.usecase';
import { ResponderSolicitudUseCase } from '../../../domain/solicitudes/use-cases/responder-solicitud.usecase';
import { SolicitudResponse } from '../../../domain/solicitudes/solicitud.model';
import { TrabajoService } from '../../../domain/trabajo/trabajo.service';

interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}

interface RecentActivity {
  type: string;
  description: string;
  time: string;
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
  imports: [CommonModule, RouterModule, LucideAngularModule],
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

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly getSolicitudesUseCase = inject(GetSolicitudesUseCase);
  private readonly responderSolicitudUseCase = inject(ResponderSolicitudUseCase);
  private readonly trabajoService = inject(TrabajoService);

  userName = signal<string>('');
  solicitudesPendientes = signal<SolicitudPendiente[]>([]);
  isLoadingSolicitudes = signal(false);
  respondingToSolicitud = signal<number | null>(null);

  // Modal de respuesta
  showResponseModal = signal(false);
  responseModalType = signal<'success' | 'error'>('success');
  responseModalMessage = signal('');

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

  recentActivities = signal<RecentActivity[]>([
    {
      type: 'payment',
      description: 'Pago recibido de Juan Pérez - $850',
      time: 'Hace 2 horas',
      icon: this.DollarSign
    },
    {
      type: 'review',
      description: 'Nueva reseña de María García - 5 estrellas',
      time: 'Hace 5 horas',
      icon: this.Star
    },
    {
      type: 'message',
      description: 'Nuevo mensaje de Carlos López',
      time: 'Hace 1 día',
      icon: this.MessageSquare
    },
    {
      type: 'booking',
      description: 'Nueva reserva para el 15 de Nov',
      time: 'Hace 2 días',
      icon: this.Calendar
    }
  ]);

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    console.log('Dashboard - Usuario actual:', user);

    if (user) {
      this.userName.set(`${user.name} ${user.lastName}`);

      // Cargar solicitudes pendientes si el usuario es profesional
      if (user.idProfesional) {
        console.log('Dashboard - Cargando solicitudes para profesional ID:', user.idProfesional);
        this.loadSolicitudesPendientes(user.idProfesional);
      } else {
        console.warn('Dashboard - Usuario no tiene idProfesional asignado');
      }
    } else {
      console.error('Dashboard - No hay usuario autenticado');
    }
  }

  private loadSolicitudesPendientes(idProfesional: number) {
    this.isLoadingSolicitudes.set(true);

    this.getSolicitudesUseCase.execute(idProfesional, 'PENDIENTE').subscribe({
      next: (solicitudes: SolicitudResponse[]) => {
        // El backend retorna un array de solicitudes
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
        if (solicitudesPendientes.length > 0) {
          console.log('📋 Primera solicitud ID:', solicitudesPendientes[0].idSolicitud);
        }
      },
      error: (error) => {
        // Manejar cualquier error inesperado
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
          // Si se aceptó, crear el trabajo
          console.log('🛠️ Creando trabajo para solicitud:', idSolicitud);
          this.crearTrabajo(idSolicitud);
        } else {
          // Si se rechazó, solo remover y mostrar mensaje
          const solicitudes = this.solicitudesPendientes();
          this.solicitudesPendientes.set(
            solicitudes.filter(s => s.idSolicitud !== idSolicitud)
          );
          this.respondingToSolicitud.set(null);
          this.showSuccessModal('Solicitud rechazada exitosamente');

          // Recargar el dashboard
          const user = this.authService.getCurrentUser();
          if (user?.idProfesional) {
            this.loadSolicitudesPendientes(user.idProfesional);
          }
        }
      },
      error: (error) => {
        console.error('❌ Error respondiendo solicitud:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);

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

        // Iniciar el trabajo automáticamente
        console.log('▶️ Iniciando trabajo:', trabajo.id);
        this.iniciarTrabajo(trabajo.id, idSolicitud);
      },
      error: (error) => {
        console.error('❌ Error al crear trabajo:', error);
        this.respondingToSolicitud.set(null);

        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Error al crear el trabajo: ${mensajeError}`);
      }
    });
  }

  iniciarTrabajo(idTrabajo: number, idSolicitud: number) {
    this.trabajoService.iniciarTrabajo(idTrabajo).subscribe({
      next: (trabajo) => {
        console.log('✅ Trabajo iniciado:', trabajo);

        // Remover la solicitud de la lista
        const solicitudes = this.solicitudesPendientes();
        this.solicitudesPendientes.set(
          solicitudes.filter(s => s.idSolicitud !== idSolicitud)
        );
        this.respondingToSolicitud.set(null);

        this.showSuccessModal('Solicitud aceptada y trabajo iniciado exitosamente');

        // Recargar el dashboard
        const user = this.authService.getCurrentUser();
        if (user?.idProfesional) {
          this.loadSolicitudesPendientes(user.idProfesional);
        }
      },
      error: (error) => {
        console.error('❌ Error al iniciar trabajo:', error);
        this.respondingToSolicitud.set(null);

        const mensajeError = error.error?.message || error.message || 'Error desconocido';
        this.showErrorModal(`Trabajo creado pero error al iniciarlo: ${mensajeError}`);
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

  formatDate(dateString: string): string {
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
    // Formato HH:mm:ss a HH:mm
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
