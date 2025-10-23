import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterProfesionalUseCase } from '../../../domain/profesionales/use-cases/register-profesional.usecase';
import { ListOficiosUseCase } from '../../../domain/oficios/use-cases/list-oficios.usecase';
import { Oficio } from '../../../domain/oficios/oficio.model';
import { AuthService } from '../../../domain/auth';
import { ProfesionalRequest } from '../../../domain/profesionales/profesional-request.model';

@Component({
  selector: 'app-registro-profesional',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registro-profesional.html',
  styleUrl: './registro-profesional.scss'
})
export class RegistroProfesional implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly registerUseCase = inject(RegisterProfesionalUseCase);
  private readonly listOficiosUseCase = inject(ListOficiosUseCase);
  private readonly authService = inject(AuthService);

  registroForm!: FormGroup;
  oficios = signal<Oficio[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
    this.loadOficios();
  }

  private initForm(): void {
    const currentUser = this.authService.getCurrentUser();

    this.registroForm = this.fb.group({
      idUsuario: [currentUser?.id || null, [Validators.required]],
      fechaDesde: ['', [Validators.required]],
      fechaHasta: ['', [Validators.required]],
      idOficio: ['', [Validators.required]]
    });
  }

  private loadOficios(): void {
    this.listOficiosUseCase.execute().subscribe({
      next: (oficios) => {
        this.oficios.set(oficios);
      },
      error: (error) => {
        console.error('Error loading oficios:', error);
        this.errorMessage.set('Error al cargar los oficios disponibles');
      }
    });
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.markFormGroupTouched(this.registroForm);
      this.errorMessage.set('Por favor, complete todos los campos requeridos');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const request: ProfesionalRequest = this.registroForm.value;

    this.registerUseCase.execute(request).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('¡Registro exitoso! Serás redirigido al inicio...');

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error registering professional:', error);
        this.errorMessage.set(
          error.error?.message || 'Error al registrar como profesional. Por favor, intente nuevamente.'
        );
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registroForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.registroForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    return '';
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
