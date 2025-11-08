/**
 * Tipos de Eventos Kafka - Comunicação Interna
 *
 * Define todos os tipos de eventos que circulam entre os microsserviços
 * do ecossistema hospitalar via Kafka
 */

/**
 * Eventos de Paciente (patient.events)
 */
export enum PatientEventType {
  PATIENT_REGISTERED = 'PatientRegistered',
  PATIENT_UPDATED = 'PatientUpdated',
  PATIENT_ADMITTED = 'PatientAdmitted',
  PATIENT_DISCHARGED = 'PatientDischarged',
  PATIENT_DELETED = 'PatientDeleted',
}

/**
 * Eventos de Agendamento (appointment.events)
 */
export enum AppointmentEventType {
  APPOINTMENT_SCHEDULED = 'AppointmentScheduled',
  APPOINTMENT_CONFIRMED = 'AppointmentConfirmed',
  APPOINTMENT_CANCELLED = 'AppointmentCancelled',
  APPOINTMENT_RESCHEDULED = 'AppointmentRescheduled',
  APPOINTMENT_COMPLETED = 'AppointmentCompleted',
  APPOINTMENT_NO_SHOW = 'AppointmentNoShow',
}

/**
 * Eventos de Laboratório (lab.events)
 */
export enum LabEventType {
  LAB_ORDER_CREATED = 'LabOrderCreated',
  LAB_SPECIMEN_COLLECTED = 'LabSpecimenCollected',
  LAB_RESULT_AVAILABLE = 'LabResultAvailable',
  LAB_RESULT_VALIDATED = 'LabResultValidated',
  LAB_ORDER_CANCELLED = 'LabOrderCancelled',
}

/**
 * Eventos de Faturamento (billing.events)
 */
export enum BillingEventType {
  INVOICE_GENERATED = 'InvoiceGenerated',
  PAYMENT_RECEIVED = 'PaymentReceived',
  CLAIM_SUBMITTED = 'ClaimSubmitted',
  CLAIM_APPROVED = 'ClaimApproved',
  CLAIM_REJECTED = 'ClaimRejected',
  REFUND_ISSUED = 'RefundIssued',
}

/**
 * Eventos de Prescrição Médica (prescription.events)
 */
export enum PrescriptionEventType {
  PRESCRIPTION_CREATED = 'PrescriptionCreated',
  PRESCRIPTION_DISPENSED = 'PrescriptionDispensed',
  PRESCRIPTION_CANCELLED = 'PrescriptionCancelled',
  PRESCRIPTION_RENEWED = 'PrescriptionRenewed',
}

/**
 * Eventos de Prontuário Médico (medical-records.events)
 */
export enum MedicalRecordsEventType {
  ENCOUNTER_CREATED = 'EncounterCreated',
  ENCOUNTER_COMPLETED = 'EncounterCompleted',
  DIAGNOSIS_RECORDED = 'DiagnosisRecorded',
  VITAL_SIGNS_RECORDED = 'VitalSignsRecorded',
  CLINICAL_NOTE_ADDED = 'ClinicalNoteAdded',
  PROCEDURE_PERFORMED = 'ProcedurePerformed',
}

/**
 * Eventos de Notificação (notification.events)
 */
export enum NotificationEventType {
  NOTIFICATION_SENT = 'NotificationSent',
  NOTIFICATION_DELIVERED = 'NotificationDelivered',
  NOTIFICATION_FAILED = 'NotificationFailed',
  NOTIFICATION_READ = 'NotificationRead',
}

/**
 * Eventos de Integração (integration.events)
 */
export enum IntegrationEventType {
  EXTERNAL_DATA_RECEIVED = 'ExternalDataReceived',
  EXTERNAL_DATA_SENT = 'ExternalDataSent',
  INTEGRATION_FAILED = 'IntegrationFailed',
  EXTERNAL_SYSTEM_STATUS_CHANGED = 'ExternalSystemStatusChanged',
}

/**
 * Eventos de Auditoria (audit.events)
 */
export enum AuditEventType {
  DATA_ACCESSED = 'DataAccessed',
  DATA_MODIFIED = 'DataModified',
  UNAUTHORIZED_ACCESS = 'UnauthorizedAccess',
  SENSITIVE_DATA_EXPORTED = 'SensitiveDataExported',
}

/**
 * Eventos de Estoque (inventory.events)
 */
export enum InventoryEventType {
  STOCK_LEVEL_LOW = 'StockLevelLow',
  ITEM_RECEIVED = 'ItemReceived',
  ITEM_DISPENSED = 'ItemDispensed',
  STOCK_ADJUSTED = 'StockAdjusted',
}

/**
 * União de todos os tipos de eventos
 */
export type KafkaEventType =
  | PatientEventType
  | AppointmentEventType
  | LabEventType
  | BillingEventType
  | PrescriptionEventType
  | MedicalRecordsEventType
  | NotificationEventType
  | IntegrationEventType
  | AuditEventType
  | InventoryEventType;

/**
 * Mapeamento de EventType → Tópico
 *
 * Usado para determinar automaticamente em qual tópico publicar
 * com base no tipo de evento
 */
export const EVENT_TYPE_TO_TOPIC_MAP = {
  // Patient Events
  [PatientEventType.PATIENT_REGISTERED]: 'patient.events',
  [PatientEventType.PATIENT_UPDATED]: 'patient.events',
  [PatientEventType.PATIENT_ADMITTED]: 'patient.events',
  [PatientEventType.PATIENT_DISCHARGED]: 'patient.events',
  [PatientEventType.PATIENT_DELETED]: 'patient.events',

  // Appointment Events
  [AppointmentEventType.APPOINTMENT_SCHEDULED]: 'appointment.events',
  [AppointmentEventType.APPOINTMENT_CONFIRMED]: 'appointment.events',
  [AppointmentEventType.APPOINTMENT_CANCELLED]: 'appointment.events',
  [AppointmentEventType.APPOINTMENT_RESCHEDULED]: 'appointment.events',
  [AppointmentEventType.APPOINTMENT_COMPLETED]: 'appointment.events',
  [AppointmentEventType.APPOINTMENT_NO_SHOW]: 'appointment.events',

  // Lab Events
  [LabEventType.LAB_ORDER_CREATED]: 'lab.events',
  [LabEventType.LAB_SPECIMEN_COLLECTED]: 'lab.events',
  [LabEventType.LAB_RESULT_AVAILABLE]: 'lab.events',
  [LabEventType.LAB_RESULT_VALIDATED]: 'lab.events',
  [LabEventType.LAB_ORDER_CANCELLED]: 'lab.events',

  // Billing Events
  [BillingEventType.INVOICE_GENERATED]: 'billing.events',
  [BillingEventType.PAYMENT_RECEIVED]: 'billing.events',
  [BillingEventType.CLAIM_SUBMITTED]: 'billing.events',
  [BillingEventType.CLAIM_APPROVED]: 'billing.events',
  [BillingEventType.CLAIM_REJECTED]: 'billing.events',
  [BillingEventType.REFUND_ISSUED]: 'billing.events',

  // Prescription Events
  [PrescriptionEventType.PRESCRIPTION_CREATED]: 'prescription.events',
  [PrescriptionEventType.PRESCRIPTION_DISPENSED]: 'prescription.events',
  [PrescriptionEventType.PRESCRIPTION_CANCELLED]: 'prescription.events',
  [PrescriptionEventType.PRESCRIPTION_RENEWED]: 'prescription.events',

  // Medical Records Events
  [MedicalRecordsEventType.ENCOUNTER_CREATED]: 'medical-records.events',
  [MedicalRecordsEventType.ENCOUNTER_COMPLETED]: 'medical-records.events',
  [MedicalRecordsEventType.DIAGNOSIS_RECORDED]: 'medical-records.events',
  [MedicalRecordsEventType.VITAL_SIGNS_RECORDED]: 'medical-records.events',
  [MedicalRecordsEventType.CLINICAL_NOTE_ADDED]: 'medical-records.events',
  [MedicalRecordsEventType.PROCEDURE_PERFORMED]: 'medical-records.events',

  // Notification Events
  [NotificationEventType.NOTIFICATION_SENT]: 'notification.events',
  [NotificationEventType.NOTIFICATION_DELIVERED]: 'notification.events',
  [NotificationEventType.NOTIFICATION_FAILED]: 'notification.events',
  [NotificationEventType.NOTIFICATION_READ]: 'notification.events',

  // Integration Events
  [IntegrationEventType.EXTERNAL_DATA_RECEIVED]: 'integration.events',
  [IntegrationEventType.EXTERNAL_DATA_SENT]: 'integration.events',
  [IntegrationEventType.INTEGRATION_FAILED]: 'integration.events',
  [IntegrationEventType.EXTERNAL_SYSTEM_STATUS_CHANGED]: 'integration.events',

  // Audit Events
  [AuditEventType.DATA_ACCESSED]: 'audit.events',
  [AuditEventType.DATA_MODIFIED]: 'audit.events',
  [AuditEventType.UNAUTHORIZED_ACCESS]: 'audit.events',
  [AuditEventType.SENSITIVE_DATA_EXPORTED]: 'audit.events',

  // Inventory Events
  [InventoryEventType.STOCK_LEVEL_LOW]: 'inventory.events',
  [InventoryEventType.ITEM_RECEIVED]: 'inventory.events',
  [InventoryEventType.ITEM_DISPENSED]: 'inventory.events',
  [InventoryEventType.STOCK_ADJUSTED]: 'inventory.events',
} as const;
