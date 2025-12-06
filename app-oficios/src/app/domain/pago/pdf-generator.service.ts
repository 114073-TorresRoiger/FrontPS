import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FacturaPDF } from './factura-pdf.model';

@Injectable({
  providedIn: 'root'
})
export class PDFGeneratorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/pagos`;

  obtenerDatosFacturaPDF(nroFactura: number): Observable<FacturaPDF> {
    return this.http.get<FacturaPDF>(`${this.apiUrl}/factura/${nroFactura}/pdf`);
  }

  generarPDF(factura: FacturaPDF): void {
    // Crear un canvas para generar el PDF
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Dimensiones del PDF (A4: 595 x 842 puntos)
    canvas.width = 595;
    canvas.height = 842;

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header con color azul
    ctx.fillStyle = '#0d6efd';
    ctx.fillRect(0, 0, canvas.width, 100);

    // Logo/Nombre de la app
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tu Oficio', canvas.width / 2, 55);

    // Título del comprobante
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Comprobante de Pago', canvas.width / 2, 150);

    // Número de factura
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText(`Factura N° ${factura.nroFactura}`, canvas.width / 2, 180);

    // Fecha
    const fecha = new Date(factura.fecha);
    ctx.fillText(`Fecha: ${fecha.toLocaleDateString('es-AR')}`, canvas.width / 2, 200);

    // Línea separadora
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 230);
    ctx.lineTo(canvas.width - 50, 230);
    ctx.stroke();

    // Información del cliente
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Cliente:', 50, 270);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText(factura.nombreCliente, 50, 295);

    // Información del profesional
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Profesional:', 50, 340);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText(factura.nombreProfesional, 50, 365);

    // Descripción del servicio
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Servicio:', 50, 410);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText(factura.descripcionServicio, 50, 435);

    // Medio de pago
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Medio de Pago:', 50, 480);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText(factura.medioPago, 50, 505);

    // Línea separadora
    ctx.strokeStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.moveTo(50, 540);
    ctx.lineTo(canvas.width - 50, 540);
    ctx.stroke();

    // Monto total - destacado
    ctx.fillStyle = '#0d6efd';
    ctx.fillRect(50, 560, canvas.width - 100, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MONTO TOTAL', canvas.width / 2, 590);
    
    ctx.font = 'bold 32px Arial';
    const montoFormateado = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(factura.importe);
    ctx.fillText(montoFormateado, canvas.width / 2, 625);

    // Estado del pago
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Estado: ${factura.estadoPago}`, canvas.width / 2, 680);

    // Footer
    ctx.fillStyle = '#999999';
    ctx.font = '12px Arial';
    ctx.fillText('Gracias por confiar en Tu Oficio', canvas.width / 2, 760);
    ctx.fillText('Este es un comprobante electrónico válido', canvas.width / 2, 780);

    // Convertir canvas a PDF usando jsPDF
    const imgData = canvas.toDataURL('image/png');
    
    // Crear PDF con jsPDF
    const { jsPDF } = (window as any).jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    // Agregar la imagen del canvas al PDF
    pdf.addImage(imgData, 'PNG', 0, 0, 595, 842);
    
    // Descargar el PDF
    pdf.save(`Factura_${factura.nroFactura}_${factura.nombreCliente.replace(/\s/g, '_')}.pdf`);
  }

  descargarComprobante(nroFactura: number): void {
    this.obtenerDatosFacturaPDF(nroFactura).subscribe({
      next: (factura) => {
        this.generarPDF(factura);
      },
      error: (error) => {
        console.error('Error al obtener datos de factura:', error);
        alert('Error al generar el comprobante. Por favor, intente nuevamente.');
      }
    });
  }
}
