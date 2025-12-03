
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Star, User, Calendar, ThumbsUp } from 'lucide-angular';
import { ResenaHttpRepository, Resena } from '../../../data/profesionales/resena.http.repository';
import { AuthService } from '../../../domain/auth/auth.service';

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, LucideAngularModule],
  templateUrl: './resenas.component.html',
  styleUrl: './resenas.component.scss'
})
export class ResenasComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Star = Star;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly ThumbsUp = ThumbsUp;

  private readonly router = inject(Router);

  promedioCalificacion: number = 0;
  totalResenas: number = 0;
  resenas: Resena[] = [];
  loading: boolean = true;
  error: string | null = null;

  private readonly resenaRepo = inject(ResenaHttpRepository);
  private readonly authService = inject(AuthService);


  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    const idProfesional = user?.idProfesional;
    if (!idProfesional) {
      this.error = 'No se encontró el profesional.';
      this.loading = false;
      return;
    }
    this.resenaRepo.getPromedioProfesional(idProfesional).subscribe({
      next: promedio => {
        this.promedioCalificacion = promedio;
      },
      error: () => {
        this.error = 'Error al obtener el promedio de calificaciones.';
      }
    });
    this.resenaRepo.getReseniasDeProfesional(idProfesional).subscribe({
      next: resenas => {
        this.resenas = resenas;
        this.totalResenas = resenas.length;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al obtener las reseñas.';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/profesionales/dashboard']);
  }

  getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  // Helper for templates: floors a decimal rating before building stars
  getStarsArrayFromRating(rating: number): boolean[] {
    return this.getStarsArray(Math.floor(rating));
  }
}
