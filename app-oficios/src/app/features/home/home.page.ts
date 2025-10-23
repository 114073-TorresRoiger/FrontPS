import { ChangeDetectionStrategy, Component, signal, inject, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, MessageCircle, User, UserPlus, Star, MapPin, Clock, Heart, ArrowLeft, Users, Award, DollarSign, ChevronDown, LogIn, LogOut, Settings, Briefcase } from 'lucide-angular';
import { AuthService } from '../../domain/auth';
import { ListOficiosUseCase } from '../../domain/oficios/use-cases/list-oficios.usecase';
import { Oficio } from '../../domain/oficios/oficio.model';

interface ServiceCard {
  id: number;
  title: string;
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
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit {
  // Dependencies
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  private readonly listOficiosUseCase = inject(ListOficiosUseCase);

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
  readonly Award = Award;
  readonly DollarSign = DollarSign;
  readonly ChevronDown = ChevronDown;
  readonly LogIn = LogIn;
  readonly LogOut = LogOut;
  readonly Settings = Settings;
  readonly Briefcase = Briefcase;

  // Search functionality
  searchQuery = signal('');

  // View state
  showProfessionals = signal(false);
  selectedService = signal<ServiceCard | null>(null);
  isDropdownOpen = signal(false);

  // Services from API
  services = signal<ServiceCard[]>([]);
  isLoadingServices = signal(true);

  // Mock data for professionals by service
  professionalsByService: { [key: number]: any[] } = {
    1: [ // Plomería
      {
        id: 101,
        name: 'Juan Pérez',
        rating: 4.8,
        reviewCount: 127,
        price: 1500,
        location: 'San Miguel, Buenos Aires',
        experience: '8 años',
        availability: 'Disponible hoy',
        specialties: ['Destapaciones', 'Instalaciones', 'Reparaciones'],
        verified: true,
        image: 'assets/professionals/juan-perez.jpg'
      },
      {
        id: 102,
        name: 'Roberto Silva',
        rating: 4.6,
        reviewCount: 89,
        price: 1200,
        location: 'Villa Ballester, Buenos Aires',
        experience: '5 años',
        availability: 'Disponible mañana',
        specialties: ['Cañerías', 'Cloacas', 'Gas'],
        verified: true,
        image: 'assets/professionals/roberto-silva.jpg'
      },
      {
        id: 103,
        name: 'Miguel Torres',
        rating: 4.9,
        reviewCount: 156,
        price: 1800,
        location: 'San Martín, Buenos Aires',
        experience: '12 años',
        availability: 'Disponible esta semana',
        specialties: ['Calefones', 'Calderas', 'Emergencias'],
        verified: true,
        image: 'assets/professionals/miguel-torres.jpg'
      }
    ],
    2: [ // Electricidad
      {
        id: 201,
        name: 'María González',
        rating: 4.9,
        reviewCount: 203,
        price: 1400,
        location: 'Villa Ballester, Buenos Aires',
        experience: '10 años',
        availability: 'Disponible hoy',
        specialties: ['Instalaciones', 'Tableros', 'Iluminación'],
        verified: true,
        image: 'assets/professionals/maria-gonzalez.jpg'
      },
      {
        id: 202,
        name: 'Carlos Mendez',
        rating: 4.7,
        reviewCount: 121,
        price: 1600,
        location: 'San Isidro, Buenos Aires',
        experience: '7 años',
        availability: 'Disponible mañana',
        specialties: ['Domótica', 'Portones', 'Mantenimiento'],
        verified: true,
        image: 'assets/professionals/carlos-mendez.jpg'
      }
    ],
    3: [ // Pintura
      {
        id: 301,
        name: 'Carlos Rodríguez',
        rating: 4.7,
        reviewCount: 245,
        price: 2000,
        location: 'San Martín, Buenos Aires',
        experience: '15 años',
        availability: 'Disponible esta semana',
        specialties: ['Pintura exterior', 'Decorativa', 'Empapelado'],
        verified: true,
        image: 'assets/professionals/carlos-rodriguez.jpg'
      },
      {
        id: 302,
        name: 'Ana Morales',
        rating: 4.8,
        reviewCount: 189,
        price: 1800,
        location: 'Munro, Buenos Aires',
        experience: '9 años',
        availability: 'Disponible hoy',
        specialties: ['Pintura interior', 'Restauración', 'Texturas'],
        verified: true,
        image: 'assets/professionals/ana-morales.jpg'
      }
    ]
  };

  ngOnInit(): void {
    this.loadServices();
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

  viewServiceProfessionals(service: any) {
    this.selectedService.set(service);
    this.showProfessionals.set(true);
  }

  backToServices() {
    this.showProfessionals.set(false);
    this.selectedService.set(null);
  }

  getCurrentProfessionals() {
    const selectedService = this.selectedService();
    if (!selectedService) return [];
    return this.professionalsByService[selectedService.id] || [];
  }

  contactProfessional(professional: any) {
    console.log('Contacting professional:', professional.name);
    // Implementar lógica de contacto
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
    // Implementar navegación al chat
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
}
