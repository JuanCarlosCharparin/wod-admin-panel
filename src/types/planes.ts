export type Plan = {
  id: number;
  pack_name: string;
  price: number;
  class_quantity: number;
  months: number;
  gym: {
    id: number;
    name: string;
  };
};

export type CreatePlanRequest = {
  pack_name: string;
  price: number;
  class_quantity: number;
  months: number;
  gym_id: number;
};

export type UpdatePlanRequest = {
  pack_name?: string;
  price?: number;
  class_quantity?: number;
  months?: number;
};

