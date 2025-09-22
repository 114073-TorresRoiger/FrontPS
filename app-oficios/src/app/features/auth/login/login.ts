import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-angular';


@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly ArrowRight = ArrowRight;

  showPassword = signal(false);
  isLoading = signal(false);
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Login attempt:', this.loginForm.value);
      this.isLoading.set(false);
    }
  }
}
