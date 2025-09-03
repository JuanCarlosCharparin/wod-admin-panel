export interface Discipline {
  id: number;
  name: string;
  gym: {
    id: number;
    name: string;
  };
}

export interface Block {
  id: number;
  start_time: string;
  end_time: string;
  capacity: number;
  discipline: Discipline;
}

export interface Template {
  id: number;
  day: string;
  gym: {
    id: number;
    name: string;
  };
  blocks: Block[];
}

export interface Clase {
  id: string;
  hora: string;
  disciplina: string;
  capacidad: number;
  seleccionada: boolean;
  start_time?: string;
  end_time?: string;
  discipline_id?: number;
}
