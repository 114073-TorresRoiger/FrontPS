import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Bell, X, CheckCircle, FileText, MessageSquare, Trash2 } from 'lucide-angular';
import { NotificacionService } from '../../../data/notificaciones/notificacion.service';
import { Notificacion } from '../../../domain/notificaciones/notificacion.model';

@Component({
  selector: 'app-notificaciones-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notificaciones-modal.component.html',
  styleUrl: './notificaciones-modal.component.scss'
})
export class NotificacionesModalComponent implements OnInit {
  // Icons
  readonly Bell = Bell;
  readonly X = X;
  readonly CheckCircle = CheckCircle;
  readonly FileText = FileText;
  readonly MessageSquare = MessageSquare;
  readonly Trash2 = Trash2;

  // Services
  readonly notificacionService = inject(NotificacionService);
  private router = inject(Router);

  // State
  isVisible = signal(false);
  notificaciones = this.notificacionService.notificaciones;

  ngOnInit(): void {}

  /**
   * Mostrar/ocultar modal
   */
  toggle(): void {
    this.isVisible.set(!this.isVisible());
  }

  /**
   * Cerrar modal
   */
  close(): void {
    this.isVisible.set(false);
  }

  /**
   * Manejar clic en notificación
   */
  onNotificacionClick(notificacion: Notificacion): void {
    // Marcar como leída
    this.notificacionService.marcarComoLeida(notificacion.id).subscribe();

    // Navegar a la URL de acción si existe
    if (notificacion.urlAccion) {
      this.router.navigate([notificacion.urlAccion]);
      this.close();
    }
  }

  /**
   * Marcar todas como leídas
   */
  marcarTodasLeidas(): void {
    this.notificacionService.marcarTodasComoLeidas().subscribe();
  }

  /**
   * Eliminar notificación
   */
  eliminarNotificacion(event: Event, idNotificacion: number): void {
    event.stopPropagation();
    this.notificacionService.eliminarNotificacion(idNotificacion).subscribe();
  }

  /**
   * Obtener icono según tipo de notificación
   */
  getIconoNotificacion(tipo: string): any {
    switch (tipo) {
      case 'NUEVA_SOLICITUD':
        return this.FileText;
      case 'TRABAJO_FINALIZADO':
        return this.CheckCircle;
      case 'MENSAJE_NUEVO':
        return this.MessageSquare;
      default:
        return this.Bell;
    }
  }

  /**
   * Obtener clase CSS según tipo de notificación
   */
  getClaseNotificacion(tipo: string): string {
    switch (tipo) {
      case 'NUEVA_SOLICITUD':
        return 'notificacion-solicitud';
      case 'TRABAJO_FINALIZADO':
        return 'notificacion-trabajo';
      case 'MENSAJE_NUEVO':
        return 'notificacion-mensaje';
      default:
        return '';
    }
  }

  /**
   * Formatear fecha de notificación
   */
  formatearFecha(fecha: Date): string {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Justo ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    
    return fecha.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
}
