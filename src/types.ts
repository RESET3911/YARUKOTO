export type User = 'A' | 'B';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Recurring = {
  type: 'daily' | 'weekly' | 'monthly';
  nextDue: string; // ISO date string
};

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type Comment = {
  id: string;
  author: User;
  text: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  assignee: User | 'both';
  createdBy: User;
  priority: Priority;
  category: string;
  dueDate?: string;
  status: 'todo' | 'done';
  pinned: boolean;
  points: number;
  completedBy?: User;
  completedAt?: string;
  createdAt: string;
  recurring?: Recurring;
  subtasks: Subtask[];
  comments: Comment[];
};

export type Settings = {
  userA: { name: string };
  userB: { name: string };
  ntfyTopic: string;
  appIcon: string;
};
