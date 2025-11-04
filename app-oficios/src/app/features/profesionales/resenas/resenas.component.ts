import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Star, User, Calendar, ThumbsUp } from 'lucide-angular';

interface Resena {
  id: number;
  cliente: string;
  calificacion: number;
  comentario: string;
  fecha: string;
  servicio: string;
}

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './resenas.component.html',
  styleUrl: './resenas.component.scss'
})
export class ResenasComponent {
  readonly ArrowLeft = ArrowLeft;
  readonly Star = Star;
  readonly User = User;
  readonly Calendar = Calendar;
  readonly ThumbsUp = ThumbsUp;

  private readonly router = inject(Router);

  promedioCalificacion = 4.8;
  totalResenas = 47;

  resenas: Resena[] = [
    {
      id: 1,
      cliente: 'María García',
      calificacion: 5,
      comentario: 'Excelente trabajo, muy profesional y puntual. Totalmente recomendado.',
      fecha: '2025-11-02',
      servicio: 'Plomería'
    },
    {
      id: 2,
      cliente: 'Juan Pérez',
      calificacion: 5,
      comentario: 'Muy satisfecho con el resultado. Trabajo de calidad y buen precio.',
      fecha: '2025-10-28',
      servicio: 'Electricidad'
    },
    {
      id: 3,
      cliente: 'Carlos López',
      calificacion: 4,
      comentario: 'Buen servicio, aunque tardó un poco más de lo esperado.',
      fecha: '2025-10-25',
      servicio: 'Pintura'
    },
    {
      id: 4,
      cliente: 'Ana Martínez',
      calificacion: 5,
      comentario: 'Impecable. Resolvió el problema rápidamente y dejó todo limpio.',
      fecha: '2025-10-20',
      servicio: 'Carpintería'
    }
  ];

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
