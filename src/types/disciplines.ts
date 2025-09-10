export type Discipline = {
  id: number;
  name: string;
  gym: {
    id: number;
    name: string;
  };
};

export type CreateDisciplineRequest = {
  name: string;
  gym_id: number;
};

export type UpdateDisciplineRequest = {
  name?: string;
};

