import { Injectable } from '@nestjs/common';
import { InboundReceiveDto } from './dto/inbound-receive.dto';
import { KafkaService } from 'src/kafka/kafka.service';
import { IntegrationLogRepository } from 'src/database/repositories/integration-log.repository';
import { IntegrationLog } from 'src/database/schemas/integration-log.schema';
@Injectable()
export class WebhooksService {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly integrationLogRepository: IntegrationLogRepository,
  ) {}

  async processInbound(data: InboundReceiveDto): Promise<any> {  
    return { message: 'Inbound received', data };
  }

  async processHl7(data: InboundReceiveDto): Promise<any> {
    //todo
  }

  async processTiss(data: InboundReceiveDto): Promise<any> {
    //todo
  }

  async processErp(data: InboundReceiveDto): Promise<any> {
    //todo
  }

  async detectIntegrationType(data: InboundReceiveDto): Promise<any> {
    //todo
  }
}
