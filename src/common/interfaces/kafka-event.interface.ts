import { FhirResource } from './fhir.interface';

/**
 * Kafka Event Envelope
 * Wraps FHIR resources with metadata for event-driven architecture
 */
export interface KafkaEvent<T extends FhirResource = FhirResource> {
  /**
   * Unique event identifier
   */
  eventId: string;

  /**
   * Type of event (create, update, delete, etc.)
   */
  eventType: string;

  /**
   * ISO 8601 timestamp
   */
  timestamp: string;

  /**
   * Source service that generated this event
   */
  source: string;

  /**
   * FHIR resource type (Patient, Observation, Claim, etc.)
   */
  resourceType: string;

  /**
   * FHIR resource ID (if applicable)
   */
  resourceId?: string;

  /**
   * FHIR resource payload
   */
  resource?: T;

  /**
   * Raw data for events that haven't been transformed yet
   */
  rawData?: any;

  /**
   * Additional metadata
   */
  metadata?: {
    correlationId?: string;
    userId?: string;
    tenantId?: string;
    [key: string]: any;
  };
}

/**
 * Event types for different operations
 */
export enum EventType {
  // Inbound events (from external systems)
  INBOUND_HL7_RECEIVED = 'InboundHL7Received',
  INBOUND_TISS_RECEIVED = 'InboundTISSReceived',
  INBOUND_ERP_RECEIVED = 'InboundERPReceived',

  // FHIR resource events
  PATIENT_CREATED = 'PatientCreated',
  PATIENT_UPDATED = 'PatientUpdated',

  OBSERVATION_CREATED = 'ObservationCreated',
  OBSERVATION_UPDATED = 'ObservationUpdated',

  CLAIM_CREATED = 'ClaimCreated',
  CLAIM_UPDATED = 'ClaimUpdated',

  APPOINTMENT_CREATED = 'AppointmentCreated',
  APPOINTMENT_UPDATED = 'AppointmentUpdated',
  APPOINTMENT_CANCELLED = 'AppointmentCancelled',

  MEDICATION_REQUEST_CREATED = 'MedicationRequestCreated',
  MEDICATION_REQUEST_UPDATED = 'MedicationRequestUpdated',

  // Error events
  INTEGRATION_ERROR = 'IntegrationError',
  TRANSFORMATION_ERROR = 'TransformationError',
}
