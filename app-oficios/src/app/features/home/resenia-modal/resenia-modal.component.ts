// 📁 src/app/features/home/resenia-modal/resenia-modal.component.ts
import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, X, Star, Send, CheckCircle, AlertCircle } from 'lucide-angular';
import { ReseniaService, ReseniaRequest } from '../../../domain/resenias/resenia.service';

@Component({
  selector: 'app-resenia-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="modal-overlay" (click)="cerrarModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <h2>{{ showSuccessModal() ? 'Reseña Enviada' : 'Califica tu experiencia' }}</h2>
            <p class="professional-name">{{ nombreProfesional }}</p>
          </div>
          <button class="close-btn" (click)="showSuccessModal() ? closeSuccessModal() : cerrarModal()">
            <lucide-angular [img]="X" [size]="24"></lucide-angular>
          </button>
        </div>

        <!-- Success Message -->
        <div class="success-message" *ngIf="showSuccessModal()">
          <lucide-angular [img]="CheckCircle" [size]="48" class="success-icon"></lucide-angular>
          <h3>¡Reseña Enviada!</h3>
          <p>Tu opinión ha sido registrada exitosamente</p>
          <button class="btn btn-success-ok" (click)="closeSuccessModal()">OK</button>
        </div>

        <!-- Formulario de Reseña -->
        <div class="modal-body" *ngIf="!showSuccessModal()">
          <form [formGroup]="reseniaForm" (ngSubmit)="enviarResenia()">
            <!-- Rating Stars -->
            <div class="form-group">
              <label>Calificación *</label>
              <div class="star-rating">
                <button
                  *ngFor="let star of [1, 2, 3, 4, 5]"
                  type="button"
                  class="star-btn"
                  [class.active]="star <= puntuacionSeleccionada()"
                  (click)="seleccionarPuntuacion(star)"
                >
                  <lucide-angular [img]="Star" [size]="32"></lucide-angular>
                </button>
              </div>
              <div *ngIf="puntuacionSeleccionada() > 0" class="rating-text">
                {{ getRatingText() }}
              </div>
              <div *ngIf="reseniaForm.get('puntuacion')?.invalid && reseniaForm.get('puntuacion')?.touched" class="error-text">
                Por favor selecciona una calificación
              </div>
            </div>

            <!-- Comentario -->
            <div class="form-group">
              <label for="comentario">Comentario *</label>
              <textarea
                id="comentario"
                formControlName="comentario"
                rows="4"
                placeholder="Cuéntanos sobre tu experiencia..."
                class="form-control"
              ></textarea>
              <div *ngIf="reseniaForm.get('comentario')?.invalid && reseniaForm.get('comentario')?.touched" class="error-text">
                El comentario debe tener al menos 10 caracteres
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage()" class="error-message">
              <lucide-angular [img]="AlertCircle" [size]="20"></lucide-angular>
              <span>{{ errorMessage() }}</span>
            </div>

            <!-- Actions -->
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="cerrarModal()"
                [disabled]="isSubmitting()"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="reseniaForm.invalid || isSubmitting()"
              >
                <lucide-angular *ngIf="!isSubmitting()" [img]="Send" size="18"></lucide-angular>
                <span>{{ isSubmitting() ? 'Enviando...' : 'Enviar Reseña' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2001;
      padding: 1rem;
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 24px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 16px 16px 0 0;
    }

    .header-content h2 {
      font-size: 20px;
      font-weight: 600;
      color: white;
      margin: 0 0 4px 0;
    }

    .professional-name {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 8px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    /* Success Message - Estilo similar al turno-modal */
    .success-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      text-align: center;
    }

    .success-message .success-icon {
      color: #10b981;
      margin-bottom: 16px;
      animation: scaleIn 0.5s ease;
    }

    .success-message h3 {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    .success-message p {
      font-size: 16px;
      color: #6b7280;
      margin: 0 0 24px 0;
    }

    .btn-success-ok {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      padding: 12px 48px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-success-ok:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    /* Modal Body */
    .modal-body {
      padding: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 8px;
      color: #374151;
      font-size: 14px;
    }

    .star-rating {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin: 12px 0;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #d1d5db;
      transition: all 0.2s;
      padding: 4px;
    }

    .star-btn:hover {
      transform: scale(1.15);
    }

    .star-btn.active {
      color: #fbbf24;
    }

    .rating-text {
      text-align: center;
      font-weight: 600;
      color: #1f2937;
      margin-top: 8px;
      font-size: 16px;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      resize: vertical;
      font-family: inherit;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .error-text {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fee2e2;
      color: #991b1b;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      margin-top: 8px;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: none;
      font-size: 14px;
    }

    .btn-secondary {
      background-color: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #e5e7eb;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ReseniaModalComponent {
  @Input({ required: true }) idUsuario!: number;
  @Input({ required: true }) idProfesional!: number;
  @Input({ required: true }) idTrabajo!: number;
  @Input({ required: true }) nombreProfesional!: string;
  @Output() close = new EventEmitter<void>();
  @Output() reseniaEnviada = new EventEmitter<void>();

  readonly X = X;
  readonly Star = Star;
  readonly Send = Send;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;

  private readonly fb = inject(FormBuilder);
  private readonly reseniaService = inject(ReseniaService);

  reseniaForm: FormGroup;
  puntuacionSeleccionada = signal(0);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal(false);
  showSuccessModal = signal(false);

  constructor() {
    this.reseniaForm = this.fb.group({
      puntuacion: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  seleccionarPuntuacion(puntuacion: number): void {
    this.puntuacionSeleccionada.set(puntuacion);
    this.reseniaForm.patchValue({ puntuacion });
  }

  cerrarModal(): void {
    console.log('🔴 Cerrando modal de reseña');
    console.log('🔴 Emitiendo evento close...');
    this.close.emit();
    console.log('🔴 Evento close emitido');
  }

  getRatingText(): string {
    const ratings = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
    return ratings[this.puntuacionSeleccionada()];
  }

  enviarResenia(): void {
    console.log('🚀 Iniciando envío de reseña...');
    
    if (this.reseniaForm.invalid) {
      console.log('❌ Formulario inválido:', this.reseniaForm.errors);
      Object.keys(this.reseniaForm.controls).forEach(key => {
        const control = this.reseniaForm.get(key);
        console.log(`Campo ${key}:`, { value: control?.value, errors: control?.errors });
        control?.markAsTouched();
      });
      return;
    }

    console.log('✅ Formulario válido');
    console.log('🔍 Inputs del componente:', {
      idUsuario: this.idUsuario,
      idProfesional: this.idProfesional,
      idTrabajo: this.idTrabajo,
      nombreProfesional: this.nombreProfesional
    });

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const request: ReseniaRequest = {
      idUsuario: this.idUsuario,
      idProfesional: this.idProfesional,
      idTrabajo: this.idTrabajo,
      puntuacion: this.reseniaForm.value.puntuacion,
      comentario: this.reseniaForm.value.comentario
    };
    console.log('📤 Enviando reseña al servidor:', request);

    this.reseniaService.puntuarResenia(request).subscribe({
      next: (response) => {
        console.log('✅ Reseña enviada exitosamente:', response);
        this.isSubmitting.set(false);
        this.successMessage.set(true);
        
        console.log('🎉 Mostrando modal de éxito');
        this.showSuccessModal.set(true);
        console.log('Estado showSuccessModal:', this.showSuccessModal());
      },
      error: (error: any) => {
        console.error('❌ Error al enviar reseña:', error);
        console.error('Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.error?.message || error.message,
          error: error.error
        });
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.message || 'Error al enviar la reseña. Por favor, intenta nuevamente.');
      }
    });
  }

  closeSuccessModal(): void {
    console.log('📢 Emitiendo evento reseniaEnviada');
    this.reseniaEnviada.emit();
    this.showSuccessModal.set(false);
    this.close.emit();
  }
}
