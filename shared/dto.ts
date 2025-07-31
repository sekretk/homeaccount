export interface CurrentDataDto {
  currentTime: string;
  message: string;
}

// Expense DTOs
export interface ExpenseDto {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO date string
}

export interface ExpensesListResponseDto {
  expenses: ExpenseDto[];
  total: number;
  timestamp: string;
}

// Re-export migration DTOs for convenience
export * from './migration.dto'; 