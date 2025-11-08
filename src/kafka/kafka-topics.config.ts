/**
 * Kafka topics configuration - internal communication
 *
 * PRIORITY: Event-driven communication between internal microservices
 *
 * Architecture:
 * - 10 microservices communicate via Kafka events
 * - Each service can PUBLISH and CONSUME events
 * - Integration Service is only ONE of the services in the ecosystem
 * - Asynchronous, decoupled and scalable communication
 */

/**
 * Kafka topics for the hospital ecosystem
 */
export const KAFKA_TOPICS = {
  /**
   * Topic: patient.events
   * Domain: Patient Management
   *
   * Examples of events:
   * - PatientRegistered: New patient registered
   * - PatientUpdated: Patient data updated
   * - PatientAdmitted: Patient admitted
   * - PatientDischarged: Patient discharged
   */
  PATIENT_EVENTS: 'patient.events',

  /**
   * Topic: appointment.events
   * Domain: Appointments
   *
   * Examples of events:
   * - AppointmentScheduled: Appointment scheduled
   * - AppointmentConfirmed: Appointment confirmed
   * - AppointmentCancelled: Appointment cancelled
   * - AppointmentCompleted: Appointment completed
   */
  APPOINTMENT_EVENTS: 'appointment.events',

  /**
   * Topic: lab.events
   * Domain: Laboratory (Exams)
   *
   * Examples of events:
   * - LabOrderCreated: Lab order created
   * - LabSpecimenCollected: Lab specimen collected
   * - LabResultAvailable: Lab result available
   * - LabResultValidated: Lab result validated by doctor
   */
  LAB_EVENTS: 'lab.events',

  /**
   * Topic: billing.events
   * Domain: Billing
   *
   * Examples of events:
   * - InvoiceGenerated: Invoice generated
   * - PaymentReceived: Payment received
   * - ClaimSubmitted: Claim submitted
   * - ClaimApproved: Claim approved
   */
  BILLING_EVENTS: 'billing.events',

  /**
   * Topic: prescription.events
   * Domain: Medical Prescriptions
   *
   * Examples of events:
   * - PrescriptionCreated: Medical prescription created
   * - PrescriptionDispensed: Medicamento dispensado
   * - PrescriptionCancelled: Prescription cancelled
   */
  PRESCRIPTION_EVENTS: 'prescription.events',

  /**
   * Topic: medical-records.events
   * Domain: Electronic Medical Record
   *
   * Examples of events:
   * - EncounterCreated: Encounter created
   * - DiagnosisRecorded: Diagnosis recorded
   * - VitalSignsRecorded: Vital signs recorded
   * - ClinicalNoteAdded: Clinical note added
   *
   */
  MEDICAL_RECORDS_EVENTS: 'medical-records.events',

  /**
   * Topic: notification.events
   * Domain: Notifications
   *
   * Examples of events:
   * - NotificationSent: Notification sent (SMS/Email/Push)
   * - NotificationDelivered: Notification delivered
   * - NotificationFailed: Notification failed
   */
  NOTIFICATION_EVENTS: 'notification.events',

  /**
   * Topic: integration.events
   * Domain: Integrations with External Systems
   *
   * Examples of events:
   * - ExternalDataReceived: Dado recebido de sistema externo
   * - ExternalDataSent: Dado enviado para sistema externo
   * - IntegrationFailed: Integration failed
   * - ExternalSystemStatusChanged: External system status changed
   */
  INTEGRATION_EVENTS: 'integration.events',

  /**
   * Topic: audit.events
   * Domain: Audit and Compliance
   *
   * Examples of events:
   * - DataAccessed: Sensitive data accessed (LGPD)
   * - DataModified: Data modified
   * - UnauthorizedAccess: Unauthorized access attempt
   */
  AUDIT_EVENTS: 'audit.events',

  /**
   * Topic: inventory.events
   * Domain: Inventory (Pharmacy, Materials)
   *
   * Examples of events:
   * - StockLevelLow: Stock level low
   * - ItemReceived: Item received in inventory
   * - ItemDispensed: Item dispensed from inventory
   *
   */
  INVENTORY_EVENTS: 'inventory.events',
} as const;

/**
 * Auxiliary type for Kafka topics
 */
export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

/**
 * Configuration of partitions and replication for each topic
 *
 * Partitions: Allow parallel consumption (multiple consumers simultaneously)
 * Replication Factor: Number of replicas (1 for dev/academic environment)
 */
export const TOPIC_CONFIGURATIONS = {
  [KAFKA_TOPICS.PATIENT_EVENTS]: {
    numPartitions: 3,
    replicationFactor: 1,
  },
  [KAFKA_TOPICS.APPOINTMENT_EVENTS]: {
    numPartitions: 2,
    replicationFactor: 1,
  },
  [KAFKA_TOPICS.LAB_EVENTS]: {
    numPartitions: 3,
    replicationFactor: 1,
  },
  [KAFKA_TOPICS.BILLING_EVENTS]: {
    numPartitions: 2,
    replicationFactor: 1,
  },
  [KAFKA_TOPICS.PRESCRIPTION_EVENTS]: {
    numPartitions: 2,
    replicationFactor: 1,
  },
  [KAFKA_TOPICS.MEDICAL_RECORDS_EVENTS]: {
    numPartitions: 3,
    replicationFactor: 1,
  },
  [KAFKA_TOPICS.NOTIFICATION_EVENTS]: {
    numPartitions: 2,
    replicationFactor: 1,
  },
  [KAFKA_TOPICS.INTEGRATION_EVENTS]: {
    numPartitions: 2,
    replicationFactor: 1,
  },
  [KAFKA_TOPICS.AUDIT_EVENTS]: {
    numPartitions: 1, // Important order for audit
    replicationFactor: 1,
  },
  [KAFKA_TOPICS.INVENTORY_EVENTS]: {
    numPartitions: 2,
    replicationFactor: 1,
  },
} as const;

/**
 * Consumer Groups
 *
 * Define the consumer groups for each topic.
 * Multiple instances of the Integration Service share the same consumer group for load balancing.
 * The same consumer group for load balancing.
 */
export const CONSUMER_GROUPS = {
  INTEGRATION_EVENTS: 'integration-service-group',
  LAB_EVENTS: 'lab-events-group',
  BILLING_EVENTS: 'billing-events-group',
  PRESCRIPTION_EVENTS: 'prescription-events-group',
  MEDICAL_RECORDS_EVENTS: 'medical-records-events-group',
  NOTIFICATION_EVENTS: 'notification-events-group',
  AUDIT_EVENTS: 'audit-events-group',
  INVENTORY_EVENTS: 'inventory-events-group',
  PATIENT_EVENTS: 'patient-events-group',
  APPOINTMENT_EVENTS: 'appointment-events-group',
} as const;

const TOPIC_SUMMARY = Object.entries(TOPIC_CONFIGURATIONS).map(
  ([topic, config]) => ({
    topic,
    partitions: config.numPartitions,
    replication: config.replicationFactor,
  }),
);

console.table(TOPIC_SUMMARY);
