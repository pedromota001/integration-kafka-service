import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Integration Log Schema
 * Stores audit trail of all integration events (inbound/outbound)
 */
@Schema({ timestamps: true })
export class IntegrationLog extends Document {
  /**
   * Unique event identifier
   */
  @Prop({ required: true, unique: true, index: true })
  eventId: string;

  /**
   * Type of integration: 'hl7', 'tiss', 'erp', 'fhir'
   */
  @Prop({ required: true, index: true })
  type: string;

  /**
   * Direction: 'inbound' (external → internal) or 'outbound' (internal → external)
   */
  @Prop({ required: true, index: true })
  direction: string;

  /**
   * Source system identifier
   */
  @Prop({ required: true })
  source: string;

  /**
   * Target system identifier (optional for inbound)
   */
  @Prop()
  target?: string;

  /**
   * Original payload (can be string for HL7 or object for JSON/XML)
   */
  @Prop({ type: Object, required: true })
  payload: any;

  /**
   * Transformed FHIR resource (if transformation was successful)
   */
  @Prop({ type: Object })
  fhirResource?: any;

  /**
   * Status: 'success', 'error', 'pending', 'processing'
   */
  @Prop({ required: true, default: 'pending', index: true })
  status: string;

  /**
   * Error message (if status is 'error')
   */
  @Prop()
  error?: string;

  /**
   * Error stack trace (for debugging)
   */
  @Prop()
  errorStack?: string;

  /**
   * Kafka topic where event was published (if applicable)
   */
  @Prop()
  kafkaTopic?: string;

  /**
   * Kafka message ID (if applicable)
   */
  @Prop()
  kafkaMessageId?: string;

  /**
   * Processing time in milliseconds
   */
  @Prop()
  processingTimeMs?: number;

  /**
   * Event timestamp
   */
  @Prop({ type: Date, index: true, default: Date.now })
  timestamp: Date;

  /**
   * Additional metadata
   */
  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const IntegrationLogSchema = SchemaFactory.createForClass(IntegrationLog);

// Create compound indexes for common queries
IntegrationLogSchema.index({ type: 1, status: 1, timestamp: -1 });
IntegrationLogSchema.index({ source: 1, timestamp: -1 });
IntegrationLogSchema.index({ direction: 1, timestamp: -1 });
