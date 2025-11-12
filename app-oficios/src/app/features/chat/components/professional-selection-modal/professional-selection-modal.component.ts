import { Component, OnInit, inject, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudRepository } from '../../../../domain/solicitudes/solicitud.repository';
import { SolicitudConProfesional } from '../../../../domain/solicitudes/solicitud.model';

interface ProfessionalForChat {
  id: string;
  name: string;
  specialty?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-professional-selection-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professional-selection-modal.component.html',
  styleUrls: ['./professional-selection-modal.component.scss'],
})
export class ProfessionalSelectionModalComponent implements OnInit {
  private readonly solicitudRepository = inject(SolicitudRepository);

  @Input() userId: string | null = null;
  @Output() professionalSelected = new EventEmitter<ProfessionalForChat>();
  @Output() closed = new EventEmitter<void>();

  solicitudes: SolicitudConProfesional[] = [];
  isLoading = false;
  isVisible = false;

  ngOnInit(): void {
    // No cargamos aquí, esperamos a que se abra el modal
  }

  async loadProfessionalsFromSolicitudes(): Promise<void> {
    if (!this.userId) {
      console.error('❌ No hay userId disponible');
      return;
    }

    this.isLoading = true;
    console.log('🔍 Cargando solicitudes para usuario:', this.userId);
    
    try {
      this.solicitudRepository.getSolicitudesByUsuario(Number(this.userId)).subscribe({
        next: (solicitudes) => {
          console.log('✅ Solicitudes cargadas:', solicitudes);
          this.solicitudes = solicitudes;
          this.isLoading = false;
          
          if (solicitudes.length === 0) {
            console.log('ℹ️ No se encontraron solicitudes para este usuario');
          }
        },
        error: (error) => {
          console.error('❌ Error cargando solicitudes:', error);
          this.isLoading = false;
        },
      });
    } catch (error) {
      console.error('❌ Exception:', error);
      this.isLoading = false;
    }
  }

  selectProfessional(solicitud: SolicitudConProfesional): void {
    const professional: ProfessionalForChat = {
      id: solicitud.idProfesional.toString(),
      name: `${solicitud.nombreProfesional} ${solicitud.apellidoProfesional}`,
      specialty: solicitud.especialidad || 'Profesional',
      imageUrl: solicitud.imagenUrl,
    };
    console.log('👤 Profesional seleccionado:', professional);
    this.professionalSelected.emit(professional);
    this.close();
  }

  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }

  open(): void {
    this.isVisible = true;
    this.loadProfessionalsFromSolicitudes();
  }

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  getProfessionalName(solicitud: SolicitudConProfesional): string {
    return `${solicitud.nombreProfesional} ${solicitud.apellidoProfesional}`;
  }
}
