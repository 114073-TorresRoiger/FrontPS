export interface Domicilio {
  id?: number; // ID de la dirección en la BD
  calle: string;
  numero: string;
  piso?: string;
  depto?: string;
  barrio: string;
  ciudad: string;
  departamento: string;
}

export interface PerfilUsuario {
  avatar?: string;
  name: string;
  lastName: string;
  email: string;
  telefono: string;
  documento: string;
  tipoDocumento: string;
  nacimiento: string; // Format: YYYY-MM-DD
  domicilio: Domicilio;
}

export interface PerfilCliente {
  idCliente: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  strikes: number;
  estado: boolean;
}

export interface PerfilUsuarioRequest {
  avatar?: string;
  name: string;
  lastName: string;
  telefono: string;
  documento: string;
  tipoDocumento: string;
  nacimiento: string;
  domicilio: Domicilio;
}
