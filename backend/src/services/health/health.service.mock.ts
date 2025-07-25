import { Injectable } from '@nestjs/common';
import { IHealthService, HealthCheck } from './health.service.interface';

@Injectable()
export class MockHealthService implements IHealthService {
  private mockHealthy = true;
  private mockResponseTime = 50;

  /**
   * Check overall application health - returns mock data
   */
  async checkApplicationHealth(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    checks: HealthCheck[];
  }> {
    console.log('🧪 Mock HealthService: Checking application health');
    
    const timestamp = new Date().toISOString();
    const databaseCheck = await this.checkDatabaseHealth();
    const memoryCheck = this.getMockMemoryCheck();
    const uptimeCheck = this.getMockUptimeCheck();

    const checks = [databaseCheck, memoryCheck, uptimeCheck];
    
    const status = this.mockHealthy ? 'healthy' : 'unhealthy';

    return {
      status,
      timestamp,
      checks
    };
  }

  /**
   * Check database health specifically - returns mock data
   */
  async checkDatabaseHealth(): Promise<HealthCheck> {
    console.log('🧪 Mock HealthService: Checking database health');
    
    return {
      name: 'database',
      status: this.mockHealthy ? 'healthy' : 'unhealthy',
      responseTime: this.mockResponseTime,
      message: this.mockHealthy 
        ? 'Mock database connection is healthy' 
        : 'Mock database connection failed',
      details: {
        connectionPool: this.mockHealthy ? 'active' : 'inactive',
        responseTimeMs: this.mockResponseTime,
        mockService: true
      }
    };
  }

  /**
   * Get a simple boolean health status
   */
  async isHealthy(): Promise<boolean> {
    console.log('🧪 Mock HealthService: Returning health status');
    return this.mockHealthy;
  }

  /**
   * Set mock health status (for testing purposes)
   */
  setMockHealthy(healthy: boolean): void {
    this.mockHealthy = healthy;
    console.log(`🧪 Mock HealthService: Set health status to ${healthy}`);
  }

  /**
   * Set mock response time (for testing purposes)
   */
  setMockResponseTime(responseTime: number): void {
    this.mockResponseTime = responseTime;
    console.log(`🧪 Mock HealthService: Set response time to ${responseTime}ms`);
  }

  /**
   * Get mock memory check
   */
  private getMockMemoryCheck(): HealthCheck {
    return {
      name: 'memory',
      status: 'healthy',
      message: 'Mock memory usage is normal',
      details: {
        heapUsedMB: 45,
        heapTotalMB: 128,
        usagePercent: 35,
        external: 12,
        rss: 89,
        mockService: true
      }
    };
  }

  /**
   * Get mock uptime check
   */
  private getMockUptimeCheck(): HealthCheck {
    return {
      name: 'uptime',
      status: 'healthy',
      message: 'Mock application has been running for 2.5 hours',
      details: {
        uptimeSeconds: 9000,
        uptimeHours: 2.5,
        startTime: new Date(Date.now() - 9000 * 1000).toISOString(),
        mockService: true
      }
    };
  }

  /**
   * Reset to default mock state
   */
  resetMockState(): void {
    this.mockHealthy = true;
    this.mockResponseTime = 50;
    console.log('🧪 Mock HealthService: Reset to default state');
  }
} 