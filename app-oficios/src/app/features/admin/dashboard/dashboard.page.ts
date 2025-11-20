import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Users, Briefcase, Package, TrendingUp, Plus, Trash2, Edit, LogOut } from 'lucide-angular';
import { AuthService } from '../../../domain/auth';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  fechaRegistro: string;
  estado: 'activo' | 'inactivo';
}

interface Profesional {
  id: number;
  nombre: string;
  oficio: string;
  calificacion: number;
  serviciosCompletados: number;
}

interface Oficio {
  id: number;
  nombre: string;
  descripcion: string;
  profesionales: number;
  demanda: number;
  activo: boolean;
}

interface EstadisticasOficio {
  nombre: string;
  cantidad: number;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPage implements OnInit {
  // Icons
  readonly Users = Users;
  readonly Briefcase = Briefcase;
  readonly Package = Package;
  readonly TrendingUp = TrendingUp;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly LogOut = LogOut;

  // Services
  private readonly authService = inject(AuthService);
  readonly Edit = Edit;

  // Signals para datos
  usuarios = signal<Usuario[]>([]);
  profesionales = signal<Profesional[]>([]);
  oficios = signal<Oficio[]>([]);
  oficiosMasDemandados = signal<EstadisticasOficio[]>([]);

  // Estadísticas
  totalUsuarios = signal(0);
  totalProfesionales = signal(0);
  totalOficios = signal(0);
  totalOficiosActivos = signal(0);

  // Modal states
  showAddOficioModal = signal(false);
  showEditOficioModal = signal(false);
  selectedOficio = signal<Oficio | null>(null);

  // Form data
  nuevoOficio = {
    nombre: '',
    descripcion: ''
  };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // TODO: Reemplazar con llamadas reales al backend
    this.cargarUsuarios();
    this.cargarProfesionales();
    this.cargarOficios();
    this.cargarOficiosDemandados();
  }

  cargarUsuarios() {
    // Mock data - reemplazar con servicio real
    const mockUsuarios: Usuario[] = [
      { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', fechaRegistro: '2025-01-15', estado: 'activo' },
      { id: 2, nombre: 'María González', email: 'maria@example.com', fechaRegistro: '2025-02-20', estado: 'activo' },
      { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', fechaRegistro: '2025-03-10', estado: 'inactivo' }
    ];
    this.usuarios.set(mockUsuarios);
    this.totalUsuarios.set(mockUsuarios.length);
  }

  cargarProfesionales() {
    // Mock data - reemplazar con servicio real
    const mockProfesionales: Profesional[] = [
      { id: 1, nombre: 'Roberto Silva', oficio: 'Plomería', calificacion: 4.8, serviciosCompletados: 45 },
      { id: 2, nombre: 'Ana Morales', oficio: 'Electricidad', calificacion: 4.9, serviciosCompletados: 62 },
      { id: 3, nombre: 'Miguel Torres', oficio: 'Carpintería', calificacion: 4.7, serviciosCompletados: 38 }
    ];
    this.profesionales.set(mockProfesionales);
    this.totalProfesionales.set(mockProfesionales.length);
  }

  cargarOficios() {
    // Mock data - reemplazar con servicio real
    const mockOficios: Oficio[] = [
      { id: 1, nombre: 'Plomería', descripcion: 'Servicios de plomería general', profesionales: 12, demanda: 145, activo: true },
      { id: 2, nombre: 'Electricidad', descripcion: 'Instalaciones y reparaciones eléctricas', profesionales: 8, demanda: 128, activo: true },
      { id: 3, nombre: 'Carpintería', descripcion: 'Trabajos en madera y muebles', profesionales: 15, demanda: 98, activo: true },
      { id: 4, nombre: 'Pintura', descripcion: 'Pintura interior y exterior', profesionales: 10, demanda: 87, activo: true },
      { id: 5, nombre: 'Jardinería', descripcion: 'Mantenimiento de jardines', profesionales: 6, demanda: 54, activo: false }
    ];
    this.oficios.set(mockOficios);
    this.totalOficios.set(mockOficios.length);
    this.totalOficiosActivos.set(mockOficios.filter(o => o.activo).length);
  }

  cargarOficiosDemandados() {
    // Mock data - reemplazar con servicio real
    const mockDemanda: EstadisticasOficio[] = [
      { nombre: 'Plomería', cantidad: 145 },
      { nombre: 'Electricidad', cantidad: 128 },
      { nombre: 'Carpintería', cantidad: 98 },
      { nombre: 'Pintura', cantidad: 87 },
      { nombre: 'Jardinería', cantidad: 54 }
    ];
    this.oficiosMasDemandados.set(mockDemanda);
  }

  // Gestión de oficios
  abrirModalNuevoOficio() {
    this.nuevoOficio = { nombre: '', descripcion: '' };
    this.showAddOficioModal.set(true);
  }

  cerrarModalNuevoOficio() {
    this.showAddOficioModal.set(false);
  }

  agregarOficio() {
    if (this.nuevoOficio.nombre.trim() && this.nuevoOficio.descripcion.trim()) {
      // TODO: Implementar llamada al backend
      console.log('Agregar oficio:', this.nuevoOficio);
      this.cerrarModalNuevoOficio();
      // Recargar oficios después de agregar
      this.cargarOficios();
    }
  }

  abrirModalEditarOficio(oficio: Oficio) {
    this.selectedOficio.set(oficio);
    this.showEditOficioModal.set(true);
  }

  cerrarModalEditarOficio() {
    this.showEditOficioModal.set(false);
    this.selectedOficio.set(null);
  }

  actualizarOficio() {
    const oficio = this.selectedOficio();
    if (oficio) {
      // TODO: Implementar llamada al backend
      console.log('Actualizar oficio:', oficio);
      this.cerrarModalEditarOficio();
      // Recargar oficios después de actualizar
      this.cargarOficios();
    }
  }

  toggleEstadoOficio(oficio: Oficio) {
    // TODO: Implementar llamada al backend
    console.log('Toggle estado oficio:', oficio.id);
    oficio.activo = !oficio.activo;
    this.cargarOficios();
  }

  eliminarOficio(id: number) {
    if (confirm('¿Está seguro que desea eliminar este oficio?')) {
      // TODO: Implementar llamada al backend
      console.log('Eliminar oficio:', id);
      this.cargarOficios();
    }
  }

  logout() {
    this.authService.logout();
  }
}
