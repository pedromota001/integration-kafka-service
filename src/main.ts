import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Integration Service API')
    .setDescription(
      'Microservice bridge between external systems (HL7, TISS, ERP) and internal hospital ecosystem using FHIR R4',
    )
    .setVersion('1.0')
    .addTag('webhooks', 'Endpoints to receive data from external systems')
    .addTag('health', 'Health check endpoints')
    .addServer('http://localhost:3010', 'Local Development')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Integration Service API',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = configService.get('app.port');
  const host = configService.get('app.host');

  await app.listen(port, host);
  console.log(`🚀 Integration Service running on http://${host}:${port}`);
  console.log(`📚 Swagger documentation available at http://${host}:${port}/api`);
}

bootstrap();
