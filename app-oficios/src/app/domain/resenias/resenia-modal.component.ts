// 📁 src/app/features/home/resenia-modal/resenia-modal.component.ts
import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, X, Star, Send, CheckCircle } from 'lucide-angular';
import { ReseniaService, ReseniaRequest } from '../../domain/resenias/resenia.service';

@Component({
  selector: 'app-resenia-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <!-- Modal Principal -->
    <div class="modal-overlay" (click)="!showSuccessModal() && close.emit()">
      
      <!-- Contenido: Formulario de Reseña -->
      <div *ngIf="!showSuccessModal()" class="modal-content resenia-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Califica tu experiencia</h2>
          <button class="close-btn" (click)="close.emit()">
            <lucide-angular [img]="X" size="24"></lucide-angular>
          </button>
        </div>

        <div class="modal-body">
          <div class="professional-info">
            <h3>{{ nombreProfesional }}</h3>
            <p class="subtitle">¿Cómo fue tu experiencia con este profesional?</p>
          </div>

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
              <div *ngIf="reseniaForm.get('puntuacion')?.invalid && reseniaForm.get('puntuacion')?.touched" class="error-message">
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
              <div *ngIf="reseniaForm.get('comentario')?.invalid && reseniaForm.get('comentario')?.touched" class="error-message">
                El comentario debe tener al menos 10 caracteres
              </div>
            </div>

            <!-- Error/Success Messages -->
            <div *ngIf="errorMessage()" class="alert alert-error">
              {{ errorMessage() }}
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="close.emit()"
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

      <!-- Contenido: Modal de Éxito -->
      <div *ngIf="showSuccessModal()" class="modal-content success-modal" (click)="$event.stopPropagation()">
        <div class="success-header">
          <div class="success-icon">
            <lucide-angular [img]="CheckCircle" [size]="48" color="#10b981"></lucide-angular>
          </div>
          <button type="button" class="close-btn-success" (click)="closeSuccessModal()">×</button>
        </div>
        <div class="success-body">
          <h3 class="success-title">¡Éxito!</h3>
          <p class="success-message">¡Gracias por tu reseña!</p>
          <p class="success-submessage">Tu opinión ha sido enviada correctamente y ayudará a otros usuarios.</p>
        </div>
        <div class="success-footer">
          <button type="button" class="btn-success-full" (click)="closeSuccessModal()">
            Aceptar
          </button>
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
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .resenia-modal {
      max-width: 500px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      transition: color 0.2s;
      padding: 0.25rem;
    }

    .close-btn:hover {
      color: #1f2937;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .professional-info {
      text-align: center;
      margin-bottom: 2rem;
    }

    .professional-info h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #6b7280;
      font-size: 0.95rem;
    }

    .star-rating {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin: 1rem 0;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #d1d5db;
      transition: all 0.2s;
      padding: 0.25rem;
    }

    .star-btn:hover {
      transform: scale(1.1);
    }

    .star-btn.active {
      color: #fbbf24;
    }

    .star-btn.active :host ::ng-deep svg {
      fill: currentColor;
    }

    .rating-text {
      text-align: center;
      font-weight: 600;
      color: #1f2937;
      margin-top: 0.5rem;
      font-size: 1.1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      resize: vertical;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .alert-error {
      background-color: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .alert-success {
      background-color: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
    }

    .btn-secondary {
      background-color: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #e5e7eb;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Modal de Éxito - Estilos Simplificados */
    .success-modal {
      max-width: 400px;
      border-radius: 16px;
      overflow: hidden;
      text-align: center;
    }

    .success-header {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      padding: 2rem 1.5rem 1rem;
      position: relative;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .close-btn-success {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.5);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      font-size: 1.5rem;
      font-weight: bold;
      color: #065f46;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .close-btn-success:hover {
      background: rgba(255, 255, 255, 0.8);
      transform: scale(1.1);
    }

    .success-body {
      padding: 1.5rem;
      background: white;
    }

    .success-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #10b981;
      margin: 0 0 0.5rem 0;
    }

    .success-message {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }

    .success-submessage {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
      line-height: 1.5;
    }

    .success-footer {
      padding: 0 1.5rem 1.5rem;
      background: white;
    }

    .btn-success-full {
      width: 100%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-success-full:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }
  `]
})
export class ReseniaModalComponent {
  @Input({ required: true }) idUsuario!: number;
  @Input({ required: true }) idProfesional!: number;
  @Input({ required: true }) idTrabajo!: number;
  @Input({ required: true }) nombreProfesional!: string;
  @Output() close = new EventEmitter<void>();
  @Output() reseniaEnviada = new EventEmitter<void>;

  readonly X = X;
  readonly Star = Star;
  readonly Send = Send;
  readonly CheckCircle = CheckCircle;

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
        console.log('📢 Emitiendo evento reseniaEnviada');
        this.reseniaEnviada.emit();
        
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
    this.showSuccessModal.set(false);
    this.close.emit();
  }
}
