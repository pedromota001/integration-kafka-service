import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import envConfig from './config/env.config';
import { KafkaModule } from './kafka/kafka.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { DatabaseModule } from './database/database.module';
import { TransformersModule } from './transformers/transformers.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('app.mongodb.uri'),
      }),
    }),
    KafkaModule,
    WebhooksModule,
    DatabaseModule,
    TransformersModule,
    HealthModule,
  ],
})
export class AppModule {}
