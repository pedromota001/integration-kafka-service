import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { KafkaTopics } from './topics.enum';
import { BaseEventDto } from './dto/base-event.dto';
import { CONSUMER_GROUPS } from './kafka-topics.config';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<KafkaTopics, Consumer> = new Map();
  private readonly logger = new Logger('KafkaService');

  constructor(private configService: ConfigService) {
    const kafkaConfig = this.configService.get('app.kafka');
    this.kafka = new Kafka({
      clientId: kafkaConfig.clientId,
      brokers: kafkaConfig.brokers,
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    for (const [topic, consumer] of this.consumers) {
      await consumer.disconnect();
      this.logger.log(`Consumer for ${topic} disconnected`);
    }
    this.logger.log('Kafka producer disconnected');
  }

  async publishEvent(topic: KafkaTopics, event: BaseEventDto): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          key: event.eventId,
          value: JSON.stringify(event),
        },
      ],
    });
    this.logger.log(`Published ${event.eventType} event to ${topic}`);
  }

  async subscribeEvent(topic: KafkaTopics, handler: (event: BaseEventDto) => Promise<void> ): Promise<void> {
    if(this.consumers.has(topic)) {
      throw new Error(`Consumer for ${topic} already exists`);
    }
    this.logger.log(`Creating consumer for ${topic}`);
    try {
      const consumer = await this.kafka.consumer( { groupId: CONSUMER_GROUPS[topic]})
      await consumer.connect();
      await consumer.subscribe( {topic} )
      await consumer.run({
        eachMessage: async ({ message}) => {
          const event = JSON.parse(message.value.toString()) as BaseEventDto
          await handler(event)
          this.logger.log(`Received ${event.eventType} event from ${topic}`);
        },
      });
      this.consumers.set(topic, consumer);
      this.logger.log(`Consumer for ${topic} created`);
    } catch (error) {
      this.logger.error(`Error creating consumer for ${topic}:`, error);
      throw error;
    }
  }
}