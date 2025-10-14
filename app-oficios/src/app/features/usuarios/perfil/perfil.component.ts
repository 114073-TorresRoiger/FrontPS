import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PerfilService } from '../../../domain/usuario/use-cases/perfil.service';
import { PerfilUsuario, PerfilUsuarioRequest } from '../../../domain/usuario/models/perfil.model';
import { AuthService } from '../../../domain/auth/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  perfilForm: FormGroup;
  isEditing = false;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor() {
    this.perfilForm = this.createForm();
  }

  ngOnInit() {
    this.cargarPerfil();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }], // Email no editable
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      documento: ['', [Validators.required, Validators.minLength(7)]],
      tipoDocumento: ['', Validators.required],
      nacimiento: ['', Validators.required],
      domicilio: this.formBuilder.group({
        calle: ['', Validators.required],
        numero: ['', Validators.required],
        piso: [''],
        depto: [''],
        barrio: ['', Validators.required],
        ciudad: ['', Validators.required],
        departamento: ['', Validators.required]
      })
    });
  }

  cargarPerfil() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'Usuario no autenticado';
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.perfilService.obtenerPerfil(currentUser.id.toString()).subscribe({
      next: (perfil: PerfilUsuario) => {
        this.perfilForm.patchValue(perfil);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el perfil. Intente nuevamente.';
        this.isLoading = false;
        console.error('Error cargando perfil:', error);
      }
    });
  }

  toggleEditar() {
    this.isEditing = !this.isEditing;
    this.error = null;
    this.success = null;

    if (!this.isEditing) {
      // Cancelar edición - recargar datos originales
      this.cargarPerfil();
    }
  }

  guardarCambios() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'Usuario no autenticado';
      return;
    }

    if (this.perfilForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.success = null;

      // Crear objeto sin el email para la actualización
      const { email, ...perfilData } = this.perfilForm.getRawValue();
      const perfilRequest: PerfilUsuarioRequest = perfilData;

      this.perfilService.actualizarPerfil(currentUser.id.toString(), perfilRequest).subscribe({
        next: () => {
          this.success = 'Perfil actualizado correctamente';
          this.isEditing = false;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Error al actualizar el perfil. Intente nuevamente.';
          this.isLoading = false;
          console.error('Error actualizando perfil:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.perfilForm.controls).forEach(key => {
      const control = this.perfilForm.get(key);
      if (control) {
        control.markAsTouched();

        // Si es un FormGroup anidado (como domicilio)
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(nestedKey => {
            control.get(nestedKey)?.markAsTouched();
          });
        }
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.perfilForm.get(fieldName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return `${this.getFieldDisplayName(fieldName)} es requerido`;
      if (control.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['pattern']) return `${this.getFieldDisplayName(fieldName)} no tiene un formato válido`;
    }
    return null;
  }

  getDomicilioFieldError(fieldName: string): string | null {
    const control = this.perfilForm.get(`domicilio.${fieldName}`);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return `${this.getFieldDisplayName(fieldName)} es requerido`;
    }
    return null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: 'Nombre',
      lastName: 'Apellido',
      telefono: 'Teléfono',
      documento: 'Documento',
      tipoDocumento: 'Tipo de Documento',
      nacimiento: 'Fecha de Nacimiento',
      calle: 'Calle',
      numero: 'Número',
      barrio: 'Barrio',
      ciudad: 'Ciudad',
      departamento: 'Departamento'
    };
    return fieldNames[fieldName] || fieldName;
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
