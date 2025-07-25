export interface CurrentDataDto {
  currentTime: string;
  message: string;
}

// Re-export migration DTOs for convenience
export * from './migration.dto'; 