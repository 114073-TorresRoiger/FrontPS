export interface DisponibilidadHorario {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

export interface PerfilProfesional {
  idProfesional: number;
  nombre: string;
  apellido: string;
  oficio: string;
  telefono: string;
  rangoPrecio: string;
  disponibilidad?: DisponibilidadHorario[]; // Opcional
  especialidades: string[];
}
