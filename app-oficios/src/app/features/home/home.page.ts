import { ChangeDetectionStrategy, Component, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, MessageCircle, User, UserPlus, Star, MapPin, Clock, Heart, ArrowLeft, Users, Award, DollarSign, ChevronDown, LogIn, LogOut, Settings } from 'lucide-angular';
import { AuthService } from '../../domain/auth';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {
  // Dependencies
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

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

  // Search functionality
  searchQuery = signal('');

  // View state
  showProfessionals = signal(false);
  selectedService = signal<any>(null);
  isDropdownOpen = signal(false);

  // Mock data for services
  services = [
    {
      id: 1,
      title: 'Plomería',
      image: 'assets/services/plomeria.jpg',
      description: 'Reparación de cañerías, instalaciones sanitarias y destapaciones',
      professionalCount: 12,
      averageRating: 4.7,
      totalReviews: 456,
      priceRange: { min: 1200, max: 2500 },
      isFavorite: false
    },
    {
      id: 2,
      title: 'Electricidad',
      image: 'assets/services/electricidad.jpg',
      description: 'Instalaciones eléctricas, reparaciones y mantenimiento',
      professionalCount: 8,
      averageRating: 4.8,
      totalReviews: 324,
      priceRange: { min: 1000, max: 2000 },
      isFavorite: true
    },
    {
      id: 3,
      title: 'Pintura',
      image: 'assets/services/pintura.jpg',
      description: 'Pintura interior y exterior, empapelado y decoración',
      professionalCount: 15,
      averageRating: 4.6,
      totalReviews: 678,
      priceRange: { min: 1500, max: 3000 },
      isFavorite: false
    },
    {
      id: 4,
      title: 'Carpintería',
      image: 'assets/services/carpinteria.jpg',
      description: 'Muebles a medida, reparaciones y restauración',
      professionalCount: 6,
      averageRating: 4.9,
      totalReviews: 234,
      priceRange: { min: 1800, max: 4000 },
      isFavorite: false
    },
    {
      id: 5,
      title: 'Jardinería',
      image: 'assets/services/jardineria.jpg',
      description: 'Mantenimiento de jardines, poda y paisajismo',
      professionalCount: 10,
      averageRating: 4.5,
      totalReviews: 345,
      priceRange: { min: 800, max: 2200 },
      isFavorite: true
    },
    {
      id: 6,
      title: 'Limpieza',
      image: 'assets/services/limpieza.jpg',
      description: 'Limpieza doméstica profunda y mantenimiento',
      professionalCount: 20,
      averageRating: 4.8,
      totalReviews: 892,
      priceRange: { min: 600, max: 1500 },
      isFavorite: false
    }
  ];

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

  onSearch() {
    console.log('Searching for:', this.searchQuery());
    // Implementar lógica de búsqueda aquí
  }

  toggleFavorite(serviceId: number) {
    const service = this.services.find(s => s.id === serviceId);
    if (service) {
      service.isFavorite = !service.isFavorite;
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
    console.log('Navigating to profile');
    // TODO: Implement profile navigation
    // this.router.navigate(['/profile']);
  }

  logout() {
    this.isDropdownOpen.set(false);
    this.authService.logout();
  }

  getUserDisplayName(): string {
    return this.authService.getUserFullName();
  }
}
