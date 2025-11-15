export type Priority = "high" | "medium" | "low";
export type completed = "completed" | "not completed";
export type Memo = "memo" | "no memo"; 

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  date: Date | null;
  memo?: string;
  bool_memo?: Memo;
}
