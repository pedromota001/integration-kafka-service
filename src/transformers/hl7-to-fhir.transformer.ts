import { Injectable } from '@nestjs/common';
import * as hl7 from 'simple-hl7';
import { FhirObservation } from '../common/interfaces/fhir.interface';
import {
  HL7_STATUS_MAP,
  HL7_INTERPRETATION_MAP,
  HL7_CODING_SYSTEM_MAP,
  FHIR_SYSTEMS,
} from './hl7-mappings';
import { parseHL7DateTime, parseReferenceRange } from './transformer.util';

/**
 * HL7 v2.5 to FHIR R4 Transformer
 *
 * Converte mensagens HL7 v2 ORU^R01 (Observation Result) em FHIR R4 Observation
 *
 * Limitações conhecidas (projeto acadêmico):
 * - Suporta apenas ORU^R01 (resultados laboratoriais)
 * - Processa um único OBX por transformação
 * - Não suporta observações hierárquicas
 * - Valores numéricos apenas (não texto, codificado, etc.)
 */
@Injectable()
export class HL7ToFhirTransformer {
  /**
   * Transforma mensagem HL7 v2 ORU^R01 em FHIR R4 Observation
   *
   * @param hl7String Mensagem HL7 v2 completa
   * @returns Recurso FHIR R4 Observation
   * @throws Error se mensagem inválida ou tipo não suportado
   */
  transform(hl7String: string): FhirObservation {
    try {
      // Normalize HL7 message: convert \n to \r (HL7 standard separator)
      const normalizedHl7 = hl7String.replace(/\n/g, '\r');

      // Parse HL7 message manually into segments
      const segments = normalizedHl7.split('\r');
      const segmentMap: { [key: string]: string[] } = {};

      for (const segment of segments) {
        if (!segment) continue;
        const fields = segment.split('|');
        const segmentName = fields[0];
        segmentMap[segmentName] = fields;
      }

      // Validate MSH segment
      if (!segmentMap['MSH']) {
        throw new Error('Segmento MSH (Message Header) não encontrado. Mensagem HL7 inválida.');
      }

      // MSH format: MSH|^~\&|field1|field2|...|field9
      // Array indices: [MSH, ^~\&, field1, field2, ..., field8] where field8 is actually MSH-9 (Message Type)
      // Note: MSH-N is at index N (due to encoding chars taking up index 1)
      const messageType = segmentMap['MSH'][8]; // MSH-9: Message Type

      if (!messageType || !messageType.startsWith('ORU^R01')) {
        throw new Error(`Tipo de mensagem não suportado: ${messageType}. Apenas ORU^R01 é aceito.`);
      }

      // Extract required segments
      const pid = segmentMap['PID']; // Patient Identification
      const obr = segmentMap['OBR']; // Observation Request
      const obx = segmentMap['OBX']; // Observation Result

      if (!obx) {
        throw new Error('Segmento OBX (Observation Result) não encontrado');
      }

      // Create segment wrapper objects that mimic the hl7.Segment interface
      const mshSegment = this.createSegmentWrapper(segmentMap['MSH']);
      const pidSegment = pid ? this.createSegmentWrapper(pid) : undefined;
      const obrSegment = obr ? this.createSegmentWrapper(obr) : undefined;
      const obxSegment = this.createSegmentWrapper(obx);

      // Construção do recurso FHIR Observation
      const observation: FhirObservation = {
        resourceType: 'Observation',
        id: this.generateId(obrSegment, obxSegment),
        status: this.mapStatus(obxSegment),
        category: this.buildCategory(),
        code: this.buildCode(obxSegment),
        subject: this.buildSubject(pidSegment),
        effectiveDateTime: this.extractDateTime(obxSegment),
        issued: new Date().toISOString(),
        valueQuantity: this.buildValue(obxSegment),
        interpretation: this.buildInterpretation(obxSegment),
        referenceRange: this.buildReferenceRange(obxSegment),
      };

      return observation;
    } catch (error) {
      throw new Error(`Erro ao transformar HL7 para FHIR: ${error.message}`);
    }
  }

  /**
   * Gera ID único para o recurso FHIR
   * Formato: LAB-{OrderID}-{ObservationID}
   */
  private generateId(obr: any, obx: any): string {
    const orderNumber = obr?.getField(2).toString() || 'UNKNOWN';
    const observationId = obx?.getField(1).toString() || '1';
    return `LAB-${orderNumber}-${observationId}`;
  }

  /**
   * Mapeia OBX-11 (Observation Result Status) para FHIR status
   */
  private mapStatus(obx: any): 'final' | 'preliminary' | 'corrected' | 'amended' | 'cancelled' {
    const hl7Status = obx.getField(11).toString(); // OBX-11
    return HL7_STATUS_MAP[hl7Status] || 'final';
  }

  /**
   * Constrói category fixo para laboratório
   */
  private buildCategory(): FhirObservation['category'] {
    return [
      {
        coding: [
          {
            system: FHIR_SYSTEMS.OBSERVATION_CATEGORY,
            code: 'laboratory',
            display: 'Laboratory',
          },
        ],
      },
    ];
  }

  /**
   * Constrói code do exame a partir de OBX-3 (Observation Identifier)
   * OBX-3 format: code^text^coding_system
   */
  private buildCode(obx: any): FhirObservation['code'] {
    const obx3 = obx.getField(3); // OBX-3: Observation Identifier

    const code = obx3.getComponent(1).toString(); // OBX-3.1
    const display = obx3.getComponent(2).toString(); // OBX-3.2
    const codingSystem = obx3.getComponent(3).toString(); // OBX-3.3

    return {
      coding: [
        {
          system: HL7_CODING_SYSTEM_MAP[codingSystem] || FHIR_SYSTEMS.V2_CODES,
          code,
          display: display || code,
        },
      ],
      text: display || code,
    };
  }

  /**
   * Constrói referência ao paciente a partir do PID
   */
  private buildSubject(pid: any): FhirObservation['subject'] {
    if (!pid) {
      return undefined;
    }

    const patientId = pid.getField(3).toString(); // PID-3: Patient Identifier

    return {
      reference: `Patient/${patientId}`,
    };
  }

  /**
   * Extrai data/hora da observação de OBX-14 (Date/Time of Observation)
   */
  private extractDateTime(obx: any): string {
    const obx14 = obx.getField(14).toString(); // OBX-14

    if (obx14) {
      return parseHL7DateTime(obx14);
    }

    // Fallback para data/hora atual
    return new Date().toISOString();
  }

  /**
   * Constrói valueQuantity a partir de OBX-5 (Observation Value) e OBX-6 (Units)
   */
  private buildValue(obx: any): FhirObservation['valueQuantity'] {
    const value = obx.getField(5).toString(); // OBX-5: Observation Value
    const unit = obx.getField(6).toString(); // OBX-6: Units

    // Conversão para número
    const numericValue = parseFloat(value);

    if (isNaN(numericValue)) {
      throw new Error(`Valor não numérico encontrado: ${value}. Apenas valores numéricos são suportados.`);
    }

    return {
      value: numericValue,
      unit: unit || undefined,
      system: unit ? FHIR_SYSTEMS.UNITS_OF_MEASURE : undefined,
      code: unit || undefined,
    };
  }

  /**
   * Constrói interpretation a partir de OBX-8 (Interpretation Codes)
   */
  private buildInterpretation(obx: any): FhirObservation['interpretation'] {
    const code = obx.getField(8).toString(); // OBX-8

    if (!code || !HL7_INTERPRETATION_MAP[code]) {
      return undefined;
    }

    const interpretation = HL7_INTERPRETATION_MAP[code];

    return [
      {
        coding: [
          {
            system: FHIR_SYSTEMS.INTERPRETATION,
            code: interpretation.code,
            display: interpretation.display,
          },
        ],
      },
    ];
  }

  /**
   * Constrói referenceRange a partir de OBX-7 (Reference Range)
   * Formato esperado: "min-max" (ex: "70-100") ou "< max" ou "> min"
   */
  private buildReferenceRange(obx: any): FhirObservation['referenceRange'] {
    const rangeString = obx.getField(7).toString(); // OBX-7

    if (!rangeString) {
      return undefined;
    }

    const range = parseReferenceRange(rangeString);

    if (!range) {
      return undefined;
    }

    // Pega a unidade do OBX-6 para usar no range
    const unit = obx.getField(6).toString() || '';

    return [
      {
        low: range.low
          ? {
              value: range.low,
              unit,
            }
          : undefined,
        high: range.high
          ? {
              value: range.high,
              unit,
            }
          : undefined,
      },
    ];
  }

  /**
   * Helper method to create a segment wrapper that mimics hl7.Segment interface
   * This wraps a string array from manual HL7 parsing
   */
  private createSegmentWrapper(fields: string[]) {
    return {
      getField: (index: number) => ({
        toString: () => fields[index] || '',
        getComponent: (componentIndex: number) => {
          const field = fields[index] || '';
          const components = field.split('^');
          return {
            toString: () => components[componentIndex] || '',
          };
        },
      }),
    };
  }
}
