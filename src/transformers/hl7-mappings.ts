

/**
 * HL7 v2.5 to FHIR R4 Mapping Constants
 *
 * Contém dicionários de mapeamento entre códigos HL7 e FHIR
 */

/**
 * Mapeamento de status de resultado (OBX-11)
 * HL7 → FHIR Observation.status
 */
export const HL7_STATUS_MAP: Record<string, 'final' | 'preliminary' | 'corrected' | 'amended' | 'cancelled'> = {
  F: 'final',          // Final result
  P: 'preliminary',    // Preliminary result
  C: 'corrected',      // Corrected result
  A: 'amended',        // Amended result
  X: 'cancelled',      // Cancelled result
};

/**
 * Mapeamento de interpretação de resultado (OBX-8)
 * HL7 → FHIR Observation.interpretation
 */
export const HL7_INTERPRETATION_MAP: Record<string, { code: string; display: string }> = {
  N: { code: 'N', display: 'Normal' },
  H: { code: 'H', display: 'High' },
  L: { code: 'L', display: 'Low' },
  HH: { code: 'HH', display: 'Critical high' },
  LL: { code: 'LL', display: 'Critical low' },
  A: { code: 'A', display: 'Abnormal' },
  AA: { code: 'AA', display: 'Critical abnormal' },
  U: { code: 'U', display: 'Significant change up' },
  D: { code: 'D', display: 'Significant change down' },
};

/**
 * Mapeamento de sistemas de codificação (OBX-3.3)
 * HL7 → FHIR Coding.system URL
 */
export const HL7_CODING_SYSTEM_MAP: Record<string, string> = {
  LOINC: 'http://loinc.org',
  LN: 'http://loinc.org',
  SNOMED: 'http://snomed.info/sct',
  'SNOMED CT': 'http://snomed.info/sct',
  SCT: 'http://snomed.info/sct',
  ICD10: 'http://hl7.org/fhir/sid/icd-10',
  'ICD-10': 'http://hl7.org/fhir/sid/icd-10',
};

/**
 * Sistemas FHIR fixos
 */
export const FHIR_SYSTEMS = {
  OBSERVATION_CATEGORY: 'http://terminology.hl7.org/CodeSystem/observation-category',
  INTERPRETATION: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
  UNITS_OF_MEASURE: 'http://unitsofmeasure.org',
  V2_CODES: 'http://terminology.hl7.org/CodeSystem/v2-0396',
};
