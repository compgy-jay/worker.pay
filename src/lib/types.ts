export type PayStatus = "paid" | "unpaid";

export interface Worker {
  id: number;
  name: string;
  contact: string;
  department: string;
  created_at: string;
}

export interface SalaryRecord {
  id: number;
  worker_id: number;
  worker_name?: string;
  worker_contact?: string;
  worker_department?: string;
  week_start: string;
  amount: number;
  status: PayStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectSettings {
  id: number;
  project_name: string;
  pm_name: string;
  pm_contact: string;
  foreman_name: string;
  foreman_contact: string;
  currency: string;
  budget: number;
}

export interface Material {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  date: string;
  category: string;
  supplier: string;
  notes: string;
  created_at?: string;
}

export interface Summary {
  salaryTotal: number;
  paidTotal: number;
  unpaidTotal: number;
  materialTotal: number;
  grandTotal: number;
  workerCount: number;
  recordCount: number;
  materialCount: number;
  unpaidRecordCount: number;
  budget: number;
  budgetRemaining: number;
  budgetUsedPercent: number;
}

export interface SalaryFilters {
  workerId: string;
  status: "all" | PayStatus;
  from: string;
  to: string;
  query: string;
}

export interface MaterialFilters {
  category: string;
  from: string;
  to: string;
  query: string;
}
