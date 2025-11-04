import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  FileText,
  MessageSquare,
  CreditCard,
  Calendar,
  ArrowLeft,
  Award,
  Clock,
  CheckCircle
} from 'lucide-angular';
import { AuthService } from '../../../domain/auth';

interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
}

interface RecentActivity {
  type: string;
  description: string;
  time: string;
  icon: any;
}

@Component({
  selector: 'app-professional-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class ProfessionalDashboardComponent implements OnInit {
  readonly TrendingUp = TrendingUp;
  readonly DollarSign = DollarSign;
  readonly Users = Users;
  readonly Star = Star;
  readonly FileText = FileText;
  readonly MessageSquare = MessageSquare;
  readonly CreditCard = CreditCard;
  readonly Calendar = Calendar;
  readonly ArrowLeft = ArrowLeft;
  readonly Award = Award;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  userName = signal<string>('');

  metrics = signal<Metric[]>([
    {
      title: 'Ingresos del Mes',
      value: '$12,450',
      change: '+12.5%',
      trend: 'up',
      icon: this.DollarSign
    },
    {
      title: 'Trabajos Completados',
      value: '24',
      change: '+8.3%',
      trend: 'up',
      icon: this.CheckCircle
    },
    {
      title: 'Clientes Activos',
      value: '18',
      change: '+15.2%',
      trend: 'up',
      icon: this.Users
    },
    {
      title: 'Calificación Promedio',
      value: '4.8',
      change: '+0.2',
      trend: 'up',
      icon: this.Star
    }
  ]);

  recentActivities = signal<RecentActivity[]>([
    {
      type: 'payment',
      description: 'Pago recibido de Juan Pérez - $850',
      time: 'Hace 2 horas',
      icon: this.DollarSign
    },
    {
      type: 'review',
      description: 'Nueva reseña de María García - 5 estrellas',
      time: 'Hace 5 horas',
      icon: this.Star
    },
    {
      type: 'message',
      description: 'Nuevo mensaje de Carlos López',
      time: 'Hace 1 día',
      icon: this.MessageSquare
    },
    {
      type: 'booking',
      description: 'Nueva reserva para el 15 de Nov',
      time: 'Hace 2 días',
      icon: this.Calendar
    }
  ]);

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName.set(`${user.name} ${user.lastName}`);
    }
  }

  goToInvoices() {
    this.router.navigate(['/profesionales/facturas']);
  }

  goToReviews() {
    this.router.navigate(['/profesionales/resenas']);
  }

  goToMessages() {
    this.router.navigate(['/chat']);
  }

  goToPaymentMethods() {
    this.router.navigate(['/profesionales/metodos-pago']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
