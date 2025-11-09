import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationLog, IntegrationLogSchema } from '../database/schemas/integration-log.schema';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IntegrationLog.name, schema: IntegrationLogSchema },
    ]),
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
