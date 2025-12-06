import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Users, Briefcase, Package, TrendingUp, Plus, Trash2, Edit, LogOut } from 'lucide-angular';
import { AuthService } from '../../../domain/auth';
import { SolicitudRepository } from '../../../domain/solicitudes/solicitud.repository';
import { EstadisticaOficio } from '../../../domain/solicitudes/solicitud.model';
import { UsuarioRepository } from '../../../domain/usuario/usuario.repository';
import { UsuarioMetrica, ProfesionalMetrica } from '../../../domain/usuario/usuario.model';
import { OficioRepository } from '../../../domain/oficios/oficio.repository';
import { Oficio } from '../../../domain/oficios/oficio.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, BaseChartDirective],
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
  readonly Edit = Edit;

  // Services
  private readonly authService = inject(AuthService);
  private readonly solicitudRepository = inject(SolicitudRepository);
  private readonly usuarioRepository = inject(UsuarioRepository);
  private readonly oficioRepository = inject(OficioRepository);

  // Chart reference
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Signals para datos
  usuarios = signal<UsuarioMetrica[]>([]);
  profesionales = signal<ProfesionalMetrica[]>([]);
  oficios = signal<Oficio[]>([]);
  oficiosMasDemandados = signal<EstadisticaOficio[]>([]);

  // Estadísticas
  totalUsuarios = signal(0);
  totalProfesionales = signal(0);
  totalOficios = signal(0);
  totalOficiosActivos = signal(0);

  // Date filters
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');

  // Chart configuration
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384'
      ]
    }]
  };
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

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

  aplicarFiltroFechas() {
    this.cargarOficiosDemandados();
  }

  limpiarFiltros() {
    this.fechaInicio.set('');
    this.fechaFin.set('');
    this.cargarOficiosDemandados();
  }

  cargarUsuarios() {
    // Cargar totales
    this.usuarioRepository.getMetricasUsuarios().subscribe({
      next: (metricas) => {
        this.totalUsuarios.set(metricas.cantClientes);
        this.totalProfesionales.set(metricas.cantProfesionales);
      },
      error: (error) => {
        console.error('Error cargando métricas de usuarios:', error);
        this.totalUsuarios.set(0);
        this.totalProfesionales.set(0);
      }
    });

    // Cargar lista de usuarios (máximo 5)
    this.usuarioRepository.getUsuariosMetrica(5).subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
      },
      error: (error) => {
        console.error('Error cargando lista de usuarios:', error);
        this.usuarios.set([]);
      }
    });
  }

  cargarProfesionales() {
    // Cargar lista de profesionales (máximo 5)
    this.usuarioRepository.getProfesionalesMetrica(5).subscribe({
      next: (profesionales) => {
        this.profesionales.set(profesionales);
      },
      error: (error) => {
        console.error('Error cargando lista de profesionales:', error);
        this.profesionales.set([]);
      }
    });
  }

  cargarOficios() {
    this.oficioRepository.list().subscribe({
      next: (oficios) => {
        this.oficios.set(oficios);
        this.totalOficios.set(oficios.length);
        this.totalOficiosActivos.set(oficios.filter(o => o.activo).length);
      },
      error: (error) => {
        console.error('Error cargando oficios:', error);
        this.oficios.set([]);
        this.totalOficios.set(0);
        this.totalOficiosActivos.set(0);
      }
    });
  }

  cargarOficiosDemandados() {
    const fechaInicio = this.fechaInicio() || undefined;
    const fechaFin = this.fechaFin() || undefined;

    this.solicitudRepository.getOficiosMasSolicitados(fechaInicio, fechaFin).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.oficiosMasDemandados.set(data);
          this.actualizarGrafico(data);
        } else {
          // Si no hay datos, limpiar
          this.oficiosMasDemandados.set([]);
          this.limpiarGrafico();
        }
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.oficiosMasDemandados.set([]);
        this.limpiarGrafico();
      }
    });
  }

  private actualizarGrafico(data: EstadisticaOficio[]) {
    const labels = data.map(item => item.oficio);
    const values = data.map(item => item.cantidadDeSolicitudes);

    this.pieChartData = {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF'
        ]
      }]
    };

    // Actualizar el chart si existe
    this.chart?.update();
  }

  private limpiarGrafico() {
    this.pieChartData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: []
      }]
    };
    this.chart?.update();
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
    const accion = oficio.activo ? 'desactivar' : 'activar';
    const mensajeConfirmacion = oficio.activo
      ? '¿Está seguro que desea desactivar este oficio?'
      : '¿Está seguro que desea activar este oficio?';

    if (confirm(mensajeConfirmacion)) {
      const observable = oficio.activo
        ? this.oficioRepository.desactivar(oficio.id)
        : this.oficioRepository.activar(oficio.id);

      observable.subscribe({
        next: (mensaje) => {
          console.log(mensaje);
          // Actualizar el estado localmente
          oficio.activo = !oficio.activo;
          // Recargar la lista para mantener sincronización
          this.cargarOficios();
        },
        error: (error) => {
          console.error(`Error al ${accion} oficio:`, error);
          alert(`Error al ${accion} el oficio. Por favor, intente nuevamente.`);
        }
      });
    }
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
