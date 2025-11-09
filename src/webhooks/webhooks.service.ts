import { Injectable } from '@nestjs/common';
import { InboundReceiveDto } from './dto/inbound-receive.dto';
import { KafkaService } from 'src/kafka/kafka.service';
import { IntegrationLogRepository } from 'src/database/repositories/integration-log.repository';
import { HL7ToFhirTransformer } from 'src/transformers/hl7-to-fhir.transformer';
import { KAFKA_TOPICS } from 'src/kafka/kafka-topics.config';
import { EventType } from 'src/common/interfaces/kafka-event.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly integrationLogRepository: IntegrationLogRepository,
    private readonly hl7Transformer: HL7ToFhirTransformer,
  ) {}

  async processInbound(dto: InboundReceiveDto): Promise<any> {
    const dataType = this.detectIntegrationType(dto);

    switch (dataType) {
      case 'HL7':
        return this.processHl7(dto);
      case 'TISS':
        return this.processTiss(dto);
      case 'ERP':
        return this.processErp(dto);
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }

  async processHl7(dto: InboundReceiveDto): Promise<any> {
    try {
      // 1. Transform HL7 → FHIR
      const fhirObservation = this.hl7Transformer.transform(dto.data);

      const eventId = uuidv4();

      // 2. Save log to MongoDB
      const log = await this.integrationLogRepository.create({
        eventId,
        type: 'HL7',
        direction: 'inbound',
        source: dto.source || 'external-lab',
        payload: dto.data,
        fhirResource: fhirObservation,
        status: 'success',
        kafkaTopic: KAFKA_TOPICS.INTEGRATION_EVENTS,
      } as any);

      // 3. Publish event to Kafka
      await this.kafkaService.publishEvent(
        KAFKA_TOPICS.INTEGRATION_EVENTS as any,
        {
          eventId: log.eventId,
          eventType: EventType.INBOUND_HL7_RECEIVED,
          timestamp: new Date().toISOString(),
          source: 'integration-service',
          resourceType: 'Observation',
          data: fhirObservation,
        },
      );

      return {
        success: true,
        eventId: log.eventId,
        fhirResource: fhirObservation,
      };
    } catch (error) {
      const eventId = uuidv4();
      await this.integrationLogRepository.create({
        eventId,
        type: 'HL7',
        direction: 'inbound',
        source: dto.source || 'external-lab',
        payload: dto.data,
        status: 'error',
        error: error.message,
        errorStack: error.stack,
      } as any);
      throw error;
    }
  }

  async processTiss(dto: InboundReceiveDto): Promise<any> {
  try {
    // Create simplified TISS data object
    const tissData = {
      rawXml: dto.data,
      type: 'TISS',
      receivedAt: new Date().toISOString(),
    };

    const eventId = uuidv4();

    // Save log to MongoDB
    const log = await this.integrationLogRepository.create({
      eventId,
      type: 'TISS',
      direction: 'inbound',
      source: dto.source || 'external-insurance',
      payload: dto.data,
      status: 'success',
      kafkaTopic: KAFKA_TOPICS.INTEGRATION_EVENTS,
    } as any);

    // Publish event to Kafka
    await this.kafkaService.publishEvent(
      KAFKA_TOPICS.INTEGRATION_EVENTS as any,
      {
        eventId: log.eventId,
        eventType: EventType.INBOUND_TISS_RECEIVED,
        timestamp: new Date().toISOString(),
        source: 'integration-service',
        resourceType: 'TISS',
        data: tissData,
      },
    );

    return {
      success: true,
      eventId: log.eventId,
      data: tissData,
    };
  } catch (error) {
    const eventId = uuidv4();
    await this.integrationLogRepository.create({
      eventId,
      type: 'TISS',
      direction: 'inbound',
      source: dto.source || 'external-insurance',
      payload: dto.data,
      status: 'error',
      error: error.message,
      errorStack: error.stack,
    } as any);
    throw error;
  }
}

  async processErp(dto: InboundReceiveDto): Promise<any> {
  try {
    const erpData = JSON.parse(dto.data);

    const eventId = uuidv4();

    const log = await this.integrationLogRepository.create({
      eventId,
      type: 'ERP',
      direction: 'inbound',
      source: dto.source || 'external-erp',
      payload: dto.data,
      status: 'success',
      kafkaTopic: KAFKA_TOPICS.INTEGRATION_EVENTS,
    } as any);

    await this.kafkaService.publishEvent(
      KAFKA_TOPICS.INTEGRATION_EVENTS as any,
      {
        eventId: log.eventId,
        eventType: EventType.INBOUND_ERP_RECEIVED,
        timestamp: new Date().toISOString(),
        source: 'integration-service',
        resourceType: 'ERP',
        data: erpData,
      },
    );

    return {
      success: true,
      eventId: log.eventId,
      data: erpData,
    };
  } catch (error) {
    const eventId = uuidv4();
    await this.integrationLogRepository.create({
      eventId,
      type: 'ERP',
      direction: 'inbound',
      source: dto.source || 'external-erp',
      payload: dto.data,
      status: 'error',
      error: error.message,
      errorStack: error.stack,
    } as any);
    throw error;
  }
}

  private detectIntegrationType(
    dto: InboundReceiveDto,
  ): 'HL7' | 'TISS' | 'ERP' | 'UNKNOWN' {
    const data = dto.data;

    // HL7 messages start with MSH
    if (data.startsWith('MSH')) {
      return 'HL7';
    }

    // TISS is XML (starts with <)
    if (data.trim().startsWith('<')) {
      return 'TISS';
    }

    // ERP is JSON (try to parse)
    try {
      JSON.parse(data);
      return 'ERP';
    } catch {
      return 'UNKNOWN';
    }
  }
}
