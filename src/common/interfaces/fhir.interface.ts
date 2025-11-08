/**
 * FHIR R4 Interface Definitions
 * Simplified for academic project - add more resources as needed
 */

export interface FhirResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    source?: string;
  };
}

export interface FhirIdentifier {
  system: string;
  value: string;
  use?: 'usual' | 'official' | 'temp' | 'secondary';
}

export interface FhirHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  family: string;
  given: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface FhirPatient extends FhirResource {
  resourceType: 'Patient';
  identifier?: FhirIdentifier[];
  active?: boolean;
  name?: FhirHumanName[];
  telecom?: Array<{
    system: 'phone' | 'email' | 'fax' | 'pager' | 'url' | 'sms' | 'other';
    value: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string; // YYYY-MM-DD
  address?: Array<{
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

export interface FhirObservation extends FhirResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
    text?: string;
  };
  subject?: {
    reference: string; // e.g., "Patient/123"
    display?: string;
  };
  effectiveDateTime?: string; // ISO 8601
  issued?: string; // ISO 8601
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  valueBoolean?: boolean;
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  }>;
  referenceRange?: Array<{
    low?: { value: number; unit: string };
    high?: { value: number; unit: string };
    text?: string;
  }>;
}

export interface FhirClaim extends FhirResource {
  resourceType: 'Claim';
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type: {
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  };
  use: 'claim' | 'preauthorization' | 'predetermination';
  patient: {
    reference: string; // e.g., "Patient/123"
  };
  created: string; // ISO 8601
  provider: {
    reference: string; // e.g., "Organization/456"
  };
  priority?: {
    coding: Array<{
      code: string;
    }>;
  };
  insurance: Array<{
    sequence: number;
    focal: boolean;
    coverage: {
      reference: string; // e.g., "Coverage/789"
    };
  }>;
  item?: Array<{
    sequence: number;
    productOrService: {
      coding: Array<{
        system: string;
        code: string;
        display?: string;
      }>;
    };
    quantity?: {
      value: number;
    };
    unitPrice?: {
      value: number;
      currency: string;
    };
  }>;
  total?: {
    value: number;
    currency: string;
  };
}

export interface FhirAppointment extends FhirResource {
  resourceType: 'Appointment';
  status: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow';
  serviceType?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  }>;
  priority?: number;
  description?: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  created?: string; // ISO 8601
  participant: Array<{
    actor: {
      reference: string; // e.g., "Patient/123" or "Practitioner/456"
    };
    required?: 'required' | 'optional' | 'information-only';
    status: 'accepted' | 'declined' | 'tentative' | 'needs-action';
  }>;
}

export interface FhirMedicationRequest extends FhirResource {
  resourceType: 'MedicationRequest';
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  medicationCodeableConcept?: {
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string; // e.g., "Patient/123"
  };
  authoredOn?: string; // ISO 8601
  requester?: {
    reference: string; // e.g., "Practitioner/456"
  };
  dosageInstruction?: Array<{
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: 'h' | 'day' | 'wk' | 'mo';
      };
    };
    doseAndRate?: Array<{
      doseQuantity?: {
        value: number;
        unit: string;
      };
    }>;
  }>;
}

// TODO: Adicionar mais recursos conforme necessário:
// - Practitioner
// - Organization
// - DiagnosticReport
// - ImagingStudy
// - Invoice
// - etc.
