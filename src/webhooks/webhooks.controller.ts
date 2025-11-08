import { Controller, Post, Body } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { InboundReceiveDto } from './dto/inbound-receive.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('inbound')
  @ApiOperation({ summary: 'Receive inbound data' })
  @ApiBody({ type: InboundReceiveDto })
  @ApiResponse({ status: 200, description: 'Inbound received' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async receiveInbound(@Body() data: InboundReceiveDto) {
    const result = await this.webhooksService.processInbound(data);
    return { message: 'Inbound received', result };
  }
}
