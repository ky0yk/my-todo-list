export type Task = {
  id: string;
  user?: string;
  completed: boolean;
  tittle: string;
  body: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

export type TaskSummary = {
  id: string;
  tittle: string;
  priority: number;
  completed: boolean;
};
