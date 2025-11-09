import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IntegrationLog } from '../database/schemas/integration-log.schema';

@Injectable()
export class HealthService {
  constructor(
    @InjectModel(IntegrationLog.name)
    private integrationLogModel: Model<IntegrationLog>,
  ) {}

  async checkHealth() {
    const checks = {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: await this.checkDatabase(),
        kafka: await this.checkKafka(),
        integration: await this.checkIntegration(),
      },
    };

    const allHealthy = Object.values(checks.checks).every(
      (check: any) => check.status === 'up',
    );
    checks.status = allHealthy ? 'ready' : 'degraded';

    return checks;
  }

  private async checkDatabase(): Promise<any> {
    try {
      const count = await this.integrationLogModel.countDocuments();
      return {
        status: 'up',
        message: `MongoDB connected. ${count} logs stored.`,
      };
    } catch (error) {
      return {
        status: 'down',
        message: `MongoDB error: ${error.message}`,
      };
    }
  }

  private async checkKafka(): Promise<any> {
    // Kafka health check would go here
    // For now, we'll assume it's up if we reached this point
    return {
      status: 'up',
      message: 'Kafka is configured',
    };
  }

  private async checkIntegration(): Promise<any> {
    try {
      const recentLogs = await this.integrationLogModel
        .find()
        .sort({ timestamp: -1 })
        .limit(1);

      if (recentLogs.length === 0) {
        return {
          status: 'up',
          message: 'Integration service ready. No events processed yet.',
        };
      }

      return {
        status: 'up',
        message: `Last event processed: ${recentLogs[0].timestamp}`,
      };
    } catch (error) {
      return {
        status: 'down',
        message: `Integration check error: ${error.message}`,
      };
    }
  }
}
