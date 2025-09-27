import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {
  currentStep = 1;

  // Formularios para cada paso
  datosBasicosForm!: FormGroup;
  selectedRole: 'cliente' | 'profesional' | null = null;
  datosAdicionalForm!: FormGroup;

  // Datos para los selects
  provincias = [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];

  departamentos = [
    'Departamento 1',
    'Departamento 2',
    'Departamento 3'
  ];

  oficios = [
    'Carpintero',
    'Gasista',
    'Electricista',
    'Plomero',
    'Instalador de aires acondicionados'
  ];

  constructor(private fb: FormBuilder) {
    this.initializeForms();
  }

  initializeForms() {
    this.datosBasicosForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      lastName: ['', [Validators.required, Validators.maxLength(255)]],
      mail: ['', [Validators.required, Validators.email, Validators.maxLength(150)]]
    });

    this.datosAdicionalForm = this.fb.group({
      departamento: ['', Validators.required],
      ciudad: ['', Validators.required],
      barrio: ['', Validators.required],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      oficio: [''] // Solo para profesionales
    });
  }

  nextStep() {
    if (this.currentStep === 1 && this.datosBasicosForm.valid) {
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.selectedRole) {
      this.currentStep = 3;
      // Si es profesional, agregar validación al campo oficio
      if (this.selectedRole === 'profesional') {
        this.datosAdicionalForm.get('oficio')?.setValidators(Validators.required);
      } else {
        this.datosAdicionalForm.get('oficio')?.clearValidators();
      }
      this.datosAdicionalForm.get('oficio')?.updateValueAndValidity();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  selectRole(role: 'cliente' | 'profesional') {
    this.selectedRole = role;
  }

  onSubmit() {
    if (this.datosAdicionalForm.valid) {
      const userData = {
        ...this.datosBasicosForm.value,
        role: this.selectedRole,
        ...this.datosAdicionalForm.value
      };

      console.log('Datos del usuario:', userData);
      alert('¡Registro exitoso! (Este es solo un demo)');
    }
  }

  // Métodos auxiliares para validación
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Método para debug - verificar estado del formulario
  debugFormState() {
    console.log('Form valid:', this.datosBasicosForm.valid);
    console.log('Form errors:', this.datosBasicosForm.errors);
    console.log('Form values:', this.datosBasicosForm.value);
    Object.keys(this.datosBasicosForm.controls).forEach(key => {
      const control = this.datosBasicosForm.get(key);
      console.log(`${key}: valid=${control?.valid}, errors=`, control?.errors);
    });
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }
}
