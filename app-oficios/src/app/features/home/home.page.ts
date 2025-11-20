import { ChangeDetectionStrategy, Component, signal, inject, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, Search, MessageCircle, User, UserPlus, Star, MapPin, Clock, Heart, ArrowLeft, Users, Award, DollarSign, ChevronDown, LogIn, LogOut, Settings, Briefcase, CalendarCheck, CheckCircle, X, Send } from 'lucide-angular';
import { AuthService } from '../../domain/auth';
import { ListOficiosUseCase } from '../../domain/oficios/use-cases/list-oficios.usecase';
import { Oficio } from '../../domain/oficios/oficio.model';
import { GetProfesionalesByOficioUseCase } from '../../domain/profesionales/use-cases/get-profesionales-by-oficio.usecase';
import { PerfilProfesional } from '../../domain/profesionales/models/perfil-profesional.model';
import { EnviarSolicitudUseCase } from '../../domain/solicitudes/use-cases/enviar-solicitud.usecase';
import { VerificarSolicitudPendienteUseCase } from '../../domain/solicitudes/use-cases/verificar-solicitud-pendiente.usecase';
import { SolicitudRequest } from '../../domain/solicitudes/solicitud.model';
import { ProfessionalCardComponent } from './professional-card/professional-card.component';
import { TurnoModalComponent } from './turno-modal/turno-modal.component';

interface ServiceCard {
  id: number;
  title: string;
  oficioOriginal: string; // Original oficio name from API (uppercase)
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
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule, ReactiveFormsModule, ProfessionalCardComponent, TurnoModalComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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

  // Search functionality
  searchQuery = signal('');

  // View state
  showProfessionals = signal(false);
  selectedService = signal<ServiceCard | null>(null);
  isDropdownOpen = signal(false);

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
      image: 'assets/professionals/juan-perez.jpg'
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
      image: 'assets/professionals/roberto-silva.jpg'
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
      image: 'assets/professionals/miguel-torres.jpg'
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
      image: 'assets/professionals/juan-perez.jpg'
    }
  ]);

  // Mock data for professionals by service
  // professionalsByService: { [key: number]: any[] } = {
  //   1: [ // Plomería
  //     {
  //       id: 101,
  //       name: 'Juan Pérez',
  //       rating: 4.8,
  //       reviewCount: 127,
  //       price: 1500,
  //       location: 'San Miguel, Buenos Aires',
  //       experience: '8 años',
  //       availability: 'Disponible hoy',
  //       specialties: ['Destapaciones', 'Instalaciones', 'Reparaciones'],
  //       verified: true,
  //       image: 'assets/professionals/juan-perez.jpg'
  //     },
  //     {
  //       id: 102,
  //       name: 'Roberto Silva',
  //       rating: 4.6,
  //       reviewCount: 89,
  //       price: 1200,
  //       location: 'Villa Ballester, Buenos Aires',
  //       experience: '5 años',
  //       availability: 'Disponible mañana',
  //       specialties: ['Cañerías', 'Cloacas', 'Gas'],
  //       verified: true,
  //       image: 'assets/professionals/roberto-silva.jpg'
  //     },
  //     {
  //       id: 103,
  //       name: 'Miguel Torres',
  //       rating: 4.9,
  //       reviewCount: 156,
  //       price: 1800,
  //       location: 'San Martín, Buenos Aires',
  //       experience: '12 años',
  //       availability: 'Disponible esta semana',
  //       specialties: ['Calefones', 'Calderas', 'Emergencias'],
  //       verified: true,
  //       image: 'assets/professionals/miguel-torres.jpg'
  //     }
  //   ],
  //   2: [ // Electricidad
  //     {
  //       id: 201,
  //       name: 'María González',
  //       rating: 4.9,
  //       reviewCount: 203,
  //       price: 1400,
  //       location: 'Villa Ballester, Buenos Aires',
  //       experience: '10 años',
  //       availability: 'Disponible hoy',
  //       specialties: ['Instalaciones', 'Tableros', 'Iluminación'],
  //       verified: true,
  //       image: 'assets/professionals/maria-gonzalez.jpg'
  //     },
  //     {
  //       id: 202,
  //       name: 'Carlos Mendez',
  //       rating: 4.7,
  //       reviewCount: 121,
  //       price: 1600,
  //       location: 'San Isidro, Buenos Aires',
  //       experience: '7 años',
  //       availability: 'Disponible mañana',
  //       specialties: ['Domótica', 'Portones', 'Mantenimiento'],
  //       verified: true,
  //       image: 'assets/professionals/carlos-mendez.jpg'
  //     }
  //   ],
  //   3: [ // Pintura
  //     {
  //       id: 301,
  //       name: 'Carlos Rodríguez',
  //       rating: 4.7,
  //       reviewCount: 245,
  //       price: 2000,
  //       location: 'San Martín, Buenos Aires',
  //       experience: '15 años',
  //       availability: 'Disponible esta semana',
  //       specialties: ['Pintura exterior', 'Decorativa', 'Empapelado'],
  //       verified: true,
  //       image: 'assets/professionals/carlos-rodriguez.jpg'
  //     },
  //     {
  //       id: 302,
  //       name: 'Ana Morales',
  //       rating: 4.8,
  //       reviewCount: 189,
  //       price: 1800,
  //       location: 'Munro, Buenos Aires',
  //       experience: '9 años',
  //       availability: 'Disponible hoy',
  //       specialties: ['Pintura interior', 'Restauración', 'Texturas'],
  //       verified: true,
  //       image: 'assets/professionals/ana-morales.jpg'
  //     }
  //   ]
  // };

  ngOnInit(): void {
    this.loadServices();
    this.initSolicitudForm();
  }

  private initSolicitudForm(): void {
    // Get tomorrow's date as minimum
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    this.solicitudForm = this.fb.group({
      fechaservicio: [minDate, Validators.required],
      observacion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private loadServices(): void {
    this.isLoadingServices.set(true);
    this.listOficiosUseCase.execute().subscribe({
      next: (oficios: Oficio[]) => {
        const serviceCards = oficios.map(oficio => this.mapOficioToServiceCard(oficio));
        this.services.set(serviceCards);
        this.isLoadingServices.set(false);
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.isLoadingServices.set(false);
      }
    });
  }

  private mapOficioToServiceCard(oficio: Oficio): ServiceCard {
    // Map service name to image
    const imageMap: { [key: string]: string } = {
      'GASISTA': 'assets/services/gasista.jpg',
      'ELECTRICISTA': 'assets/services/electricista.jpg',
      'PLOMERO': 'assets/services/plomero.jpg',
      'CARPINTERO': 'assets/services/carpintero.jpg',
      'PINTOR': 'assets/services/pintura.jpg',
      'EMPLEADA DOMESTICA': 'assets/services/empleada-domestica.jpg',
      'INSTALADOR DE AIRES ACONDICIONADOS': 'assets/services/instalacion-aire-acondicionado.jpg'
    };

    return {
      id: oficio.id,
      title: this.formatOficioName(oficio.oficio),
      oficioOriginal: oficio.oficio, // Store original uppercase name for API calls
      image: imageMap[oficio.oficio] || 'assets/logos/logo.png',
      description: oficio.descripcion,
      professionalCount: 0, // This will be populated from another endpoint
      averageRating: 0,
      totalReviews: 0,
      priceRange: { min: 0, max: 0 },
      isFavorite: false
    };
  }

  private formatOficioName(oficio: string): string {
    // Convert to title case
    return oficio.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  onSearch() {
    console.log('Searching for:', this.searchQuery());
    // Implementar lógica de búsqueda aquí
  }

  toggleFavorite(serviceId: number) {
    const currentServices = this.services();
    const service = currentServices.find(s => s.id === serviceId);
    if (service) {
      service.isFavorite = !service.isFavorite;
      this.services.set([...currentServices]); // Trigger change detection
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

    // Use the original oficio name from the API (already in correct format)
    this.getProfesionalesByOficioUseCase.execute(oficio).subscribe({
      next: (profesionales: PerfilProfesional[]) => {
        this.currentProfessionals.set(profesionales);
        this.noProfessionalsFound.set(profesionales.length === 0);
        this.isLoadingProfessionals.set(false);

        // Update service card with professional count
        const currentServices = this.services();
        const selectedService = this.selectedService();
        if (selectedService) {
          const service = currentServices.find(s => s.id === selectedService.id);
          if (service) {
            service.professionalCount = profesionales.length;
            this.services.set([...currentServices]);
            this.selectedService.set({...selectedService, professionalCount: profesionales.length});
          }
        }
      },
      error: (error) => {
        console.error('Error loading professionals:', error);
        this.currentProfessionals.set([]);
        this.noProfessionalsFound.set(true);
        this.isLoadingProfessionals.set(false);
      }
    });
  }

  backToServices() {
    this.showProfessionals.set(false);
    this.selectedService.set(null);
  }

  getCurrentProfessionals() {
    return this.currentProfessionals();
  }

  // Helper method to map PerfilProfesional to display format
  getProfessionalDisplayName(professional: PerfilProfesional): string {
    return `${professional.nombre} ${professional.apellido}`;
  }

  contactProfessional(professional: PerfilProfesional) {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para contactar a un profesional');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Get current user ID
    const currentUser = this.authService.currentUser();
    if (!currentUser?.id) {
      alert('Error al obtener la información del usuario');
      return;
    }

    // Abrir modal de turnos directamente
    this.selectedProfessional.set(professional);
    this.showTurnoModal.set(true);
  }

  closeTurnoModal() {
    this.showTurnoModal.set(false);
    this.selectedProfessional.set(null);
  }

  onTurnoConfirmado(response: any) {
    console.log('Turno confirmado:', response);
    // Aquí puedes agregar lógica adicional después de confirmar el turno
    // Por ejemplo, mostrar un mensaje de éxito o redirigir
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
      observacion: this.solicitudForm.value.observacion
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
      }
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

  goToSignIn() {
    this.isDropdownOpen.set(false);
    this.router.navigate(['/auth/login']);
  }

  goToSignUp() {
    this.isDropdownOpen.set(false);
    this.router.navigate(['/auth/registro']);
  }

  goToProfile() {
    this.isDropdownOpen.set(false);
    this.router.navigate(['/usuarios/perfil']);
  }

  goToRegisterProfessional() {
    this.isDropdownOpen.set(false);
    this.router.navigate(['/profesionales/registro']);
  }

  goToDashboard() {
    this.isDropdownOpen.set(false);
    this.router.navigate(['/profesionales/dashboard']);
  }

  logout() {
    this.isDropdownOpen.set(false);
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
}
