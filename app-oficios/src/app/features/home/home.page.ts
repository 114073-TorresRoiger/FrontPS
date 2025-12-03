// 📁 src/app/features/home/home.page.ts
import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  LucideAngularModule,
  Search,
  MessageCircle,
  User,
  UserPlus,
  Star,
  MapPin,
  Clock,
  Heart,
  ArrowLeft,
  Users,
  Award,
  DollarSign,
  ChevronDown,
  LogIn,
  LogOut,
  Settings,
  Briefcase,
  CalendarCheck,
  CheckCircle,
  X,
  Send,
  AlertCircle,
  Bell,
} from 'lucide-angular';
import { AuthService } from '../../domain/auth';
import { ListOficiosUseCase } from '../../domain/oficios/use-cases/list-oficios.usecase';
import { Oficio } from '../../domain/oficios/oficio.model';
import { GetProfesionalesByOficioUseCase } from '../../domain/profesionales/use-cases/get-profesionales-by-oficio.usecase';
import { PerfilProfesional } from '../../domain/profesionales/models/perfil-profesional.model';
import { EnviarSolicitudUseCase } from '../../domain/solicitudes/use-cases/enviar-solicitud.usecase';
import { VerificarSolicitudPendienteUseCase } from '../../domain/solicitudes/use-cases/verificar-solicitud-pendiente.usecase';
import { SolicitudRequest } from '../../domain/solicitudes/solicitud.model';
import { TrabajoService } from '../../domain/trabajo/trabajo.service';
import { TrabajoClienteResponse } from '../../domain/trabajo/trabajo.model';
import { SolicitudService } from '../../domain/solicitudes/solicitud.service';
import { ProfessionalCardComponent } from './professional-card/professional-card.component';
import { TurnoModalComponent } from './turno-modal/turno-modal.component';
import { ReseniaModalComponent } from './resenia-modal/resenia-modal.component';
import { NotificacionesModalComponent } from '../../shared/components/notificaciones-modal/notificaciones-modal.component';
import { NotificacionService } from '../../data/notificaciones/notificacion.service';
import { StreamChatService } from '../chat/services/stream-chat.service';

interface ServiceCard {
  id: number;
  title: string;
  oficioOriginal: string;
  image: string;
  description: string;
  professionalCount: number;
  averageRating: number;
  totalReviews: number;
  priceRange: { min: number; max: number };
  isFavorite: boolean;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    FormsModule,
    ReactiveFormsModule,
    ProfessionalCardComponent,
    TurnoModalComponent,
    ReseniaModalComponent,
    NotificacionesModalComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  // Dependencies
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly listOficiosUseCase = inject(ListOficiosUseCase);
  private readonly getProfesionalesByOficioUseCase = inject(GetProfesionalesByOficioUseCase);
  private readonly enviarSolicitudUseCase = inject(EnviarSolicitudUseCase);
  private readonly verificarSolicitudPendienteUseCase = inject(VerificarSolicitudPendienteUseCase);
  private readonly trabajoService = inject(TrabajoService);
  private readonly solicitudService = inject(SolicitudService);
  readonly notificacionService = inject(NotificacionService);
  private readonly streamChatService = inject(StreamChatService);

  // Icons
  readonly Search = Search;
  readonly MessageCircle = MessageCircle;
  readonly User = User;
  readonly UserPlus = UserPlus;
  readonly Star = Star;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly Heart = Heart;
  readonly ArrowLeft = ArrowLeft;
  readonly Users = Users;
  readonly X = X;
  readonly Send = Send;
  readonly Award = Award;
  readonly DollarSign = DollarSign;
  readonly ChevronDown = ChevronDown;
  readonly LogIn = LogIn;
  readonly LogOut = LogOut;
  readonly Settings = Settings;
  readonly Briefcase = Briefcase;
  readonly CalendarCheck = CalendarCheck;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly Bell = Bell;

  // Search functionality
  searchQuery = signal('');

  // View state
  showProfessionals = signal(false);
  selectedService = signal<ServiceCard | null>(null);
  isDropdownOpen = signal(false);
  isSidebarOpen = signal(false);

  // Services from API
  services = signal<ServiceCard[]>([]);
  isLoadingServices = signal(true);

  // Professionals from API
  currentProfessionals = signal<PerfilProfesional[]>([]);
  isLoadingProfessionals = signal(false);
  noProfessionalsFound = signal(false);

  // Modal de solicitud
  showSolicitudModal = signal(false);
  showPendingSolicitudWarning = signal(false);
  selectedProfessional = signal<PerfilProfesional | null>(null);
  solicitudForm!: FormGroup;
  isSendingSolicitud = signal(false);
  solicitudSuccess = signal(false);
  solicitudError = signal<string | null>(null);

  // Modal de turnos
  showTurnoModal = signal(false);

  // Trabajos finalizados del cliente
  trabajosFinalizados = signal<TrabajoClienteResponse[]>([]);
  isLoadingTrabajos = signal(false);
  showTrabajosSection = signal(false);

  // ⭐ AGREGAR: Modal de reseña
  showReseniaModal = signal(false);
  selectedTrabajoForResenia = signal<{
    trabajo: TrabajoClienteResponse;
    idProfesional: number;
  } | null>(null);

  // Notificaciones
  mensajesNoLeidos = signal(0);

  // Featured professionals
  featuredProfessionals = signal<any[]>([
    {
      id: 1,
      name: 'Carlos Rodríguez',
      service: 'Plomería',
      rating: 4.9,
      reviewCount: 234,
      price: 1500,
      location: 'San Miguel, Buenos Aires',
      experience: '12 años de experiencia',
      verified: true,
      image: 'assets/professionals/juan-perez.jpg',
    },
    {
      id: 2,
      name: 'Ana Martínez',
      service: 'Electricidad',
      rating: 4.8,
      reviewCount: 189,
      price: 1400,
      location: 'Villa Ballester, Buenos Aires',
      experience: '9 años de experiencia',
      verified: true,
      image: 'assets/professionals/roberto-silva.jpg',
    },
    {
      id: 3,
      name: 'Luis Fernández',
      service: 'Carpintería',
      rating: 5.0,
      reviewCount: 156,
      price: 2000,
      location: 'San Martín, Buenos Aires',
      experience: '15 años de experiencia',
      verified: true,
      image: 'assets/professionals/miguel-torres.jpg',
    },
    {
      id: 4,
      name: 'Patricia López',
      service: 'Pintura',
      rating: 4.7,
      reviewCount: 142,
      price: 1200,
      location: 'José C. Paz, Buenos Aires',
      experience: '8 años de experiencia',
      verified: true,
      image: 'assets/professionals/juan-perez.jpg',
    },
  ]);

  ngOnInit(): void {
    this.loadServices();
    this.initSolicitudForm();
    this.loadTrabajosFinalizados();
    this.loadNotificaciones();
    this.loadMensajesNoLeidos();
  }

  @HostListener('window:focus', ['$event'])
  onWindowFocus(event: FocusEvent): void {
    if (this.isUserAuthenticated()) {
      this.loadTrabajosFinalizados();
      this.loadMensajesNoLeidos();
      this.loadNotificaciones();
    }
  }

  private initSolicitudForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    this.solicitudForm = this.fb.group({
      fechaservicio: [minDate, Validators.required],
      observacion: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  private loadServices(): void {
    this.isLoadingServices.set(true);
    this.listOficiosUseCase.execute().subscribe({
      next: (oficios: Oficio[]) => {
        const serviceCards = oficios.map((oficio) => this.mapOficioToServiceCard(oficio));
        this.services.set(serviceCards);
        this.isLoadingServices.set(false);
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.isLoadingServices.set(false);
      },
    });
  }

  private mapOficioToServiceCard(oficio: Oficio): ServiceCard {
    const imageMap: { [key: string]: string } = {
      GASISTA: 'assets/services/gasista.jpg',
      ELECTRICISTA: 'assets/services/electricista.jpg',
      PLOMERO: 'assets/services/plomero.jpg',
      CARPINTERO: 'assets/services/carpintero.jpg',
      PINTOR: 'assets/services/pintura.jpg',
      'EMPLEADA DOMESTICA': 'assets/services/empleada-domestica.jpg',
      'INSTALADOR DE AIRES ACONDICIONADOS': 'assets/services/instalacion-aire-acondicionado.jpg',
    };

    return {
      id: oficio.id,
      title: this.formatOficioName(oficio.oficio),
      oficioOriginal: oficio.oficio,
      image: imageMap[oficio.oficio] || 'assets/logos/logo.png',
      description: oficio.descripcion,
      professionalCount: 0,
      averageRating: 0,
      totalReviews: 0,
      priceRange: { min: 0, max: 0 },
      isFavorite: false,
    };
  }

  private formatOficioName(oficio: string): string {
    return oficio
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  onSearch() {
    console.log('Searching for:', this.searchQuery());
  }

  toggleFavorite(serviceId: number) {
    const currentServices = this.services();
    const service = currentServices.find((s) => s.id === serviceId);
    if (service) {
      service.isFavorite = !service.isFavorite;
      this.services.set([...currentServices]);
    }
  }

  viewServiceProfessionals(service: ServiceCard) {
    this.selectedService.set(service);
    this.showProfessionals.set(true);
    this.loadProfessionalsByOficio(service.oficioOriginal);
  }

  private loadProfessionalsByOficio(oficio: string): void {
    this.isLoadingProfessionals.set(true);
    this.noProfessionalsFound.set(false);

    this.getProfesionalesByOficioUseCase.execute(oficio).subscribe({
      next: (profesionales: PerfilProfesional[]) => {
        this.currentProfessionals.set(profesionales);
        this.noProfessionalsFound.set(profesionales.length === 0);
        this.isLoadingProfessionals.set(false);

        const currentServices = this.services();
        const selectedService = this.selectedService();
        if (selectedService) {
          const service = currentServices.find((s) => s.id === selectedService.id);
          if (service) {
            service.professionalCount = profesionales.length;
            this.services.set([...currentServices]);
            this.selectedService.set({
              ...selectedService,
              professionalCount: profesionales.length,
            });
          }
        }
      },
      error: (error) => {
        console.error('Error loading professionals:', error);
        this.currentProfessionals.set([]);
        this.noProfessionalsFound.set(true);
        this.isLoadingProfessionals.set(false);
      },
    });
  }

  backToServices() {
    this.showProfessionals.set(false);
    this.selectedService.set(null);
  }

  getCurrentProfessionals() {
    return this.currentProfessionals();
  }

  getProfessionalDisplayName(professional: PerfilProfesional): string {
    return `${professional.nombre} ${professional.apellido}`;
  }

  contactProfessional(professional: PerfilProfesional) {
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para contactar a un profesional');
      this.router.navigate(['/auth/login']);
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser?.id) {
      alert('Error al obtener la información del usuario');
      return;
    }

    this.selectedProfessional.set(professional);
    this.showTurnoModal.set(true);
  }

  closeTurnoModal() {
    this.showTurnoModal.set(false);
    this.selectedProfessional.set(null);
  }

  onTurnoConfirmado(response: any) {
    console.log('Turno confirmado:', response);
  }

  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  closeSolicitudModal() {
    this.showSolicitudModal.set(false);
    this.selectedProfessional.set(null);
    this.solicitudForm.reset();
  }

  closePendingWarningModal() {
    this.showPendingSolicitudWarning.set(false);
    this.selectedProfessional.set(null);
  }

  enviarSolicitud() {
    if (this.solicitudForm.invalid || !this.selectedProfessional()) {
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser || !currentUser.id) {
      this.solicitudError.set('No se pudo obtener la información del usuario');
      return;
    }

    this.isSendingSolicitud.set(true);
    this.solicitudError.set(null);

    const solicitud: SolicitudRequest = {
      idUsuario: currentUser.id,
      idProfesional: this.getProfessionalId(this.selectedProfessional()!),
      fechasolicitud: new Date().toISOString(),
      fechaservicio: new Date(this.solicitudForm.value.fechaservicio).toISOString(),
      observacion: this.solicitudForm.value.observacion,
    };

    this.enviarSolicitudUseCase.execute(solicitud).subscribe({
      next: () => {
        this.isSendingSolicitud.set(false);
        this.solicitudSuccess.set(true);
        setTimeout(() => {
          this.closeSolicitudModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Error enviando solicitud:', error);
        this.isSendingSolicitud.set(false);
        this.solicitudError.set('Error al enviar la solicitud. Por favor, intenta nuevamente.');
      },
    });
  }
  private getProfessionalId(professional: PerfilProfesional): number {
    return professional.idProfesional;
  }
  toggleDropdown() {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.user-dropdown');
    if (!dropdown && this.isDropdownOpen()) {
      this.isDropdownOpen.set(false);
    }
  }
  goToChat() {
    console.log('Navigating to chat');
    this.router.navigate(['/chat']);
  }
  loadTrabajosFinalizados(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      console.log('Usuario no autenticado, no se cargan trabajos');
      return;
    }
    this.isLoadingTrabajos.set(true);
    this.trabajoService.obtenerTrabajosFinalizadosPorCliente(user.id).subscribe({
      next: (trabajos) => {
        console.log('✅ Trabajos finalizados cargados:', trabajos);
        this.trabajosFinalizados.set(trabajos);
        this.isLoadingTrabajos.set(false);
      },
      error: (error) => {
        console.log('❌ Error al cargar trabajos finalizados:', error);
        this.trabajosFinalizados.set([]);
        this.isLoadingTrabajos.set(false);
      },
    });
  }
  toggleTrabajosSection(): void {
    this.showTrabajosSection.set(!this.showTrabajosSection());
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
  irAPago(urlPago: string): void {
    if (urlPago) {
      window.open(urlPago, '_blank');
    }
  }
  // ⭐ AGREGAR: Método para abrir modal de reseña
  abrirModalResenia(trabajo: TrabajoClienteResponse): void {
    console.log('🔍 Abriendo modal para trabajo:', trabajo);
    this.solicitudService.getSolicitudById(trabajo.idSolicitud).subscribe({
      next: (solicitud) => {
        console.log('Solicitud recibida:', solicitud);
        // Usar solo el campo correcto
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
  goToSignIn() {
    this.isDropdownOpen.set(false);
    this.isSidebarOpen.set(false);
    this.router.navigate(['/auth/login']);
  }
  goToSignUp() {
    this.isDropdownOpen.set(false);
    this.isSidebarOpen.set(false);
    this.router.navigate(['/auth/registro']);
  }
  goToProfile() {
    this.isDropdownOpen.set(false);
    this.isSidebarOpen.set(false);
    this.router.navigate(['/usuarios/perfil']);
  }
  goToTrabajosFinalizados() {
    this.isDropdownOpen.set(false);
    this.isSidebarOpen.set(false);
    this.router.navigate(['/trabajos/finalizados']);
  }
  goToRegisterProfessional() {
    this.isDropdownOpen.set(false);
    this.isSidebarOpen.set(false);
    this.router.navigate(['/profesionales/registro']);
  }
  goToDashboard() {
    this.isDropdownOpen.set(false);
    this.isSidebarOpen.set(false);
    this.router.navigate(['/profesionales/dashboard']);
  }
  logout() {
    this.isDropdownOpen.set(false);
    this.isSidebarOpen.set(false);
    this.authService.logout();
  }
  getUserDisplayName(): string {
    return this.authService.getUserFullName();
  }
  isUserAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }
  isProfessional(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.idProfesional != null;
  }

  toggleSidebar(): void {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  cerrarModalResenia(): void {
    this.showReseniaModal.set(false);
    this.selectedTrabajoForResenia.set(null);
  }

  onReseniaEnviada(): void {
    console.log('✅ Reseña enviada exitosamente');
    this.loadTrabajosFinalizados();
  }

  loadNotificaciones(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) return;

    const userAny = user as any;
    const isProfessional = !!userAny.idProfesional;
    const userId = isProfessional ? userAny.idProfesional : user.id;

    this.notificacionService.cargarNotificaciones(userId, isProfessional).subscribe({
      next: () => {
        console.log('✅ Notificaciones cargadas');
      },
      error: (error) => {
        console.error('❌ Error cargando notificaciones:', error);
      }
    });
  }

  async loadMensajesNoLeidos(): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user?.id) {
        this.mensajesNoLeidos.set(0);
        this.notificacionService.actualizarMensajesNoLeidos(0);
        return;
      }

      let chatClient = this.streamChatService.getChatClient();
      
      // Si no hay cliente de chat inicializado, intentar inicializarlo
      if (!chatClient || !chatClient.user) {
        try {
          const userAny = user as any;
          const isProfessional = !!userAny.idProfesional;
          const realUserId = user.id.toString();
          const chatUserId = isProfessional ? userAny.idProfesional.toString() : realUserId;
          const userName = user.name && user.lastName 
            ? `${user.name} ${user.lastName}` 
            : user.name || 'Usuario';
          
          console.log('🔄 Inicializando chat para contar mensajes...');
          await this.streamChatService.initializeChat(
            chatUserId,
            userName,
            isProfessional,
            realUserId
          );
          
          chatClient = this.streamChatService.getChatClient();
        } catch (initError) {
          console.error('❌ Error inicializando chat:', initError);
          this.mensajesNoLeidos.set(0);
          this.notificacionService.actualizarMensajesNoLeidos(0);
          return;
        }
      }

      // Obtener el total de mensajes no leídos de todos los canales del usuario
      const channels = await this.streamChatService.getUserChannels();
      
      let totalUnread = 0;
      for (const channel of channels) {
        const unreadCount = channel.countUnread();
        totalUnread += unreadCount;
      }

      console.log('💬 Mensajes no leídos:', totalUnread);
      
      this.mensajesNoLeidos.set(totalUnread);
      this.notificacionService.actualizarMensajesNoLeidos(totalUnread);

      // Escuchar nuevos mensajes en tiempo real (solo una vez)
      if (channels.length > 0 && !this.messageListenersSetup) {
        this.setupMessageListeners(channels);
        this.messageListenersSetup = true;
      }
      
    } catch (error) {
      console.error('❌ Error cargando mensajes no leídos:', error);
      this.mensajesNoLeidos.set(0);
      this.notificacionService.actualizarMensajesNoLeidos(0);
    }
  }

  private messageListenersSetup = false;

  private setupMessageListeners(channels: any[]): void {
    // Escuchar eventos de nuevos mensajes en todos los canales
    channels.forEach(channel => {
      channel.on('message.new', (event: any) => {
        // Solo incrementar si el mensaje no es del usuario actual
        if (event.user?.id !== this.streamChatService.getCurrentUserId()) {
          const currentCount = this.mensajesNoLeidos();
          this.mensajesNoLeidos.set(currentCount + 1);
          this.notificacionService.actualizarMensajesNoLeidos(currentCount + 1);
        }
      });

      // Escuchar cuando se leen mensajes
      channel.on('message.read', (event: any) => {
        // Recalcular el total de no leídos
        this.loadMensajesNoLeidos();
      });
    });
  }

  toggleNotificaciones(): void {
    // Este método será llamado desde el template
  }
}
