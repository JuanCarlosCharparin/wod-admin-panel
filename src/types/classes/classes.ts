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
  day_of_week: string;
  capacity: number;
  enrolled: number;
  vacancy: number;
  gym: {
    id: number;
    name: string;
  };
  discipline: {
    id: number;
    name: string;
  };
};

export type ClassesResponse = {
  classes: Class[];
  week_start: string;
  week_end: string;
};

export type Discipline = {
  id: number;
  name: string;
  description?: string;
}; 