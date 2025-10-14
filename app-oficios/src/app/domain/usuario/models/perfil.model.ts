export interface Domicilio {
  calle: string;
  numero: string;
  piso?: string;
  depto?: string;
  barrio: string;
  ciudad: string;
  departamento: string;
}

export interface PerfilUsuario {
  name: string;
  lastName: string;
  email: string;
  telefono: string;
  documento: string;
  tipoDocumento: string;
  nacimiento: string; // Format: YYYY-MM-DD
  domicilio: Domicilio;
}

export interface PerfilUsuarioRequest {
  name: string;
  lastName: string;
  telefono: string;
  documento: string;
  tipoDocumento: string;
  nacimiento: string;
  domicilio: Domicilio;
}
