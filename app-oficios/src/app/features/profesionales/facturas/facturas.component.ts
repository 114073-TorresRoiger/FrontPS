import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, FileText, Download, Eye, Calendar } from 'lucide-angular';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from 'src/app/domain/auth/auth.service';
import { PDFGeneratorService } from 'src/app/domain/pago/pdf-generator.service';

interface Factura {
  nroFactura: number;
  fecha: string;
  monto: number;
  cliente: string;
}

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.scss'
})
export class FacturasComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly FileText = FileText;
  readonly Download = Download;
  readonly Eye = Eye;
  readonly Calendar = Calendar;

  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly pdfGenerator = inject(PDFGeneratorService);

  facturas: Factura[] = [];
  fechaDesde: string = '';
  fechaHasta: string = '';
  idProfesional: number | null = null;
  loading: boolean = false;

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.idProfesional = user?.idProfesional ?? null;
    // Cargar facturas inicialmente sin filtro de fecha
    if (this.idProfesional) {
      this.cargarFacturas();
    }
  }

  goBack() {
    this.router.navigate(['/profesionales/dashboard']);
  }

  cargarFacturas() {
    if (!this.idProfesional) {
      console.error('No hay profesional autenticado');
      return;
    }

    this.loading = true;
    
    // Si no hay fechas, usar rango de los últimos 30 días
    const ahora = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(ahora.getDate() - 30);
    
    const desde = this.fechaDesde ? new Date(this.fechaDesde) : hace30Dias;
    const hasta = this.fechaHasta ? new Date(this.fechaHasta) : ahora;
    
    let params = new HttpParams()
      .set('idProfesional', this.idProfesional.toString())
      .set('desde', desde.toISOString())
      .set('hasta', hasta.toISOString());

    const url = 'http://localhost:8081/api/v1/pagos/historial-ingresos';
    
    this.http.get<Factura[]>(url, { params }).subscribe({
      next: (data) => {
        // Ordenar por fecha descendente (más recientes primero)
        this.facturas = data.sort((a, b) => {
          const fechaA = new Date(a.fecha).getTime();
          const fechaB = new Date(b.fecha).getTime();
          return fechaB - fechaA;
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar facturas:', error);
        this.facturas = [];
        this.loading = false;
      }
    });
  }

  verFactura(factura: Factura) {
    console.log('Ver factura:', factura);
  }

  descargarFactura(factura: Factura) {
    console.log('Descargar factura:', factura);
  }

  descargarComprobante(nroFactura: number): void {
    this.pdfGenerator.descargarComprobante(nroFactura);
  }
}
