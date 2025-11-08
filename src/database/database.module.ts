import { Module } from '@nestjs/common';
import { IntegrationLog, IntegrationLogSchema } from './schemas/integration-log.schema';
import { IntegrationLogRepository } from './repositories/integration-log.repository';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IntegrationLog.name, schema: IntegrationLogSchema }
    ])
  ],
  providers: [IntegrationLogRepository],
  exports: [IntegrationLogRepository]
})
export class DatabaseModule {}
