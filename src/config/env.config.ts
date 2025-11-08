import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Application
  port: parseInt(process.env.PORT, 10) || 3010,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Kafka
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['kafka:9092'],
    clientId: process.env.KAFKA_CLIENT_ID || 'integration-service',
    groupId: process.env.KAFKA_GROUP_ID || 'integration-service-group',
  },

  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/integration',
  },

  // External Systems (Mocks)
  externalSystems: {
    lab: process.env.MOCK_LAB_URL || 'http://mock-lab:4001',
    insurance: process.env.MOCK_INSURANCE_URL || 'http://mock-insurance:4002',
    erp: process.env.MOCK_ERP_URL || 'http://mock-erp:4003',
  },
}));
