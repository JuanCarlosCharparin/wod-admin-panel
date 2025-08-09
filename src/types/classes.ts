export type Block = {
  id: number;
  start_time: string;
  end_time: string;
  capacity: number;
  discipline: {
    id: number;
    name: string;
  };
};

export type ScheduleTemplate = {
  id: number;
  gym_id: number;
  day: string; // 'monday', 'tuesday', etc.
  blocks?: Block[];
};

export type Class = {
  id: number;
  date: string;
  time: string;
  capacity: number;
  gym_id: number;
  discipline_id: number;
};

export type Discipline = {
  id: number;
  name: string;
  description?: string;
}; 