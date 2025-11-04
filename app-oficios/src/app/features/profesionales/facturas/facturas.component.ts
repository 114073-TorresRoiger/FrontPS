import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, FileText, Download, Eye, Calendar } from 'lucide-angular';

interface Factura {
  id: number;
  numero: string;
  cliente: string;
  fecha: string;
  monto: number;
  estado: 'pagada' | 'pendiente' | 'vencida';
}

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.scss'
})
export class FacturasComponent {
  readonly ArrowLeft = ArrowLeft;
  readonly FileText = FileText;
  readonly Download = Download;
  readonly Eye = Eye;
  readonly Calendar = Calendar;

  private readonly router = inject(Router);

  facturas: Factura[] = [
    {
      id: 1,
      numero: 'FAC-2025-001',
      cliente: 'Juan Pérez',
      fecha: '2025-11-01',
      monto: 850,
      estado: 'pagada'
    },
    {
      id: 2,
      numero: 'FAC-2025-002',
      cliente: 'María García',
      fecha: '2025-11-03',
      monto: 1200,
      estado: 'pendiente'
    },
    {
      id: 3,
      numero: 'FAC-2025-003',
      cliente: 'Carlos López',
      fecha: '2025-10-28',
      monto: 650,
      estado: 'vencida'
    }
  ];

  goBack() {
    this.router.navigate(['/profesionales/dashboard']);
  }

  verFactura(factura: Factura) {
    console.log('Ver factura:', factura);
  }

  descargarFactura(factura: Factura) {
    console.log('Descargar factura:', factura);
  }

  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'pagada': 'estado-pagada',
      'pendiente': 'estado-pendiente',
      'vencida': 'estado-vencida'
    };
    return classes[estado] || '';
  }
}
