import { Injectable, Inject } from '@nestjs/common';
import { IHealthService, HealthCheck } from './health.service.interface';
import { IDatabaseService } from '../database/database.service.interface';
import { DATABASE_SERVICE_TOKEN } from '../index';

@Injectable()
export class HealthService implements IHealthService {
  constructor(
    @Inject(DATABASE_SERVICE_TOKEN)
    private readonly databaseService: IDatabaseService
  ) {}

  /**
   * Check overall application health
   */
  async checkApplicationHealth(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    checks: HealthCheck[];
  }> {
    const timestamp = new Date().toISOString();
    const checks: HealthCheck[] = [];

    // Check database health
    const databaseCheck = await this.checkDatabaseHealth();
    checks.push(databaseCheck);

    // Add more health checks here in the future (Redis, external APIs, etc.)
    
    // Determine overall status
    const hasUnhealthy = checks.some(check => check.status === 'unhealthy');
    const hasDegraded = checks.some(check => check.status === 'degraded');
    
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
    if (hasUnhealthy) {
      overallStatus = 'unhealthy';
    } else if (hasDegraded) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      timestamp,
      checks
    };
  }

  /**
   * Check database health specifically
   */
  async checkDatabaseHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const isHealthy = await this.databaseService.isHealthy();
      const responseTime = Date.now() - startTime;

      if (isHealthy) {
        return {
          name: 'database',
          status: 'healthy',
          responseTime,
          message: 'Database connection is healthy',
          details: {
            connectionPool: 'active',
            responseTimeMs: responseTime
          }
        };
      } else {
        return {
          name: 'database',
          status: 'unhealthy',
          responseTime,
          message: 'Database health check failed',
          details: {
            connectionPool: 'inactive',
            responseTimeMs: responseTime
          }
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        name: 'database',
        status: 'unhealthy',
        responseTime,
        message: `Database health check error: ${(error as Error).message}`,
        details: {
          error: (error as Error).message,
          responseTimeMs: responseTime
        }
      };
    }
  }

  /**
   * Get a simple boolean health status
   */
  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.checkApplicationHealth();
      return health.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', (error as Error).message);
      return false;
    }
  }

  /**
   * Check memory usage health
   */
  private checkMemoryHealth(): HealthCheck {
    const memUsage = process.memoryUsage();
    const totalMemoryMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const usedMemoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memoryUsagePercent = Math.round((usedMemoryMB / totalMemoryMB) * 100);

    let status: 'healthy' | 'unhealthy' | 'degraded';
    let message: string;

    if (memoryUsagePercent < 70) {
      status = 'healthy';
      message = 'Memory usage is normal';
    } else if (memoryUsagePercent < 90) {
      status = 'degraded';
      message = 'Memory usage is elevated';
    } else {
      status = 'unhealthy';
      message = 'Memory usage is critical';
    }

    return {
      name: 'memory',
      status,
      message,
      details: {
        heapUsedMB: usedMemoryMB,
        heapTotalMB: totalMemoryMB,
        usagePercent: memoryUsagePercent,
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024)
      }
    };
  }

  /**
   * Check process uptime health
   */
  private checkUptimeHealth(): HealthCheck {
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.round(uptimeSeconds / 3600 * 100) / 100;

    return {
      name: 'uptime',
      status: 'healthy',
      message: `Application has been running for ${uptimeHours} hours`,
      details: {
        uptimeSeconds,
        uptimeHours,
        startTime: new Date(Date.now() - uptimeSeconds * 1000).toISOString()
      }
    };
  }
} 