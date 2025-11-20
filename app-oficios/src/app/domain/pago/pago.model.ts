export interface FacturaRequest {
  idTrabajo: number;
  titulo: string;
  descripcion: string;
  monto: number;
  cantidad?: number;
}

export interface PreferenceResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  facturaId?: number;
}

export interface MercadoPagoConfig {
  publicKey: string;
  sandbox: boolean;
}
