export interface IHealthService {
  /**
   * Check overall application health
   */
  checkApplicationHealth(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    checks: HealthCheck[];
  }>;

  /**
   * Check database health specifically
   */
  checkDatabaseHealth(): Promise<HealthCheck>;

  /**
   * Get a simple boolean health status
   */
  isHealthy(): Promise<boolean>;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  message?: string;
  details?: Record<string, any>;
} 