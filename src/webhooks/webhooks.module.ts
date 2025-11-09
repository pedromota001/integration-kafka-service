import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { DatabaseModule } from 'src/database/database.module';
import { TransformersModule } from 'src/transformers/transformers.module';

@Module({
  imports: [KafkaModule, DatabaseModule, TransformersModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
