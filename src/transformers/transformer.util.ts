/**
 * Funções utilitárias compartilhadas para transformers
 */

/**
 * Converte data/hora HL7 v2 (YYYYMMDDHHMMSS) para ISO 8601
 *
 * Formatos HL7 suportados:
 * - YYYYMMDD
 * - YYYYMMDDHHMM
 * - YYYYMMDDHHMMSS
 * - YYYYMMDDHHMMSS.SSSS
 *
 * @param hl7DateTime String de data/hora no formato HL7
 * @returns String ISO 8601 (YYYY-MM-DDTHH:MM:SS.SSSZ)
 *
 * @example
 * parseHL7DateTime('20240115103045') // '2024-01-15T10:30:45.000Z'
 * parseHL7DateTime('20240115') // '2024-01-15T00:00:00.000Z'
 */
export function parseHL7DateTime(hl7DateTime: string): string {
  if (!hl7DateTime) {
    return new Date().toISOString();
  }

  // Remove qualquer caractere não numérico (como pontos)
  const cleanedDate = hl7DateTime.replace(/[^0-9]/g, '');

  // Extrai componentes da data/hora
  const year = cleanedDate.substring(0, 4);
  const month = cleanedDate.substring(4, 6) || '01';
  const day = cleanedDate.substring(6, 8) || '01';
  const hour = cleanedDate.substring(8, 10) || '00';
  const minute = cleanedDate.substring(10, 12) || '00';
  const second = cleanedDate.substring(12, 14) || '00';
  const millisecond = cleanedDate.substring(14, 17) || '000';

  // Constrói ISO 8601
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}Z`;
}

/**
 * Interface para range de referência
 */
export interface ReferenceRange {
  low?: number;
  high?: number;
}

/**
 * Parse de string de reference range do HL7 (OBX-7)
 *
 * Formatos suportados:
 * - "min-max" (ex: "70-100")
 * - "< max" (ex: "< 100")
 * - "> min" (ex: "> 70")
 * - "<=max" (ex: "<=100")
 * - ">=min" (ex: ">=70")
 *
 * @param rangeString String de range no formato HL7
 * @returns Objeto com low e/ou high, ou undefined se inválido
 *
 * @example
 * parseReferenceRange('70-100') // { low: 70, high: 100 }
 * parseReferenceRange('< 100') // { high: 100 }
 * parseReferenceRange('> 70') // { low: 70 }
 */
export function parseReferenceRange(rangeString: string): ReferenceRange | undefined {
  if (!rangeString) {
    return undefined;
  }

  const trimmed = rangeString.trim();

  // Formato: "min-max"
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 2) {
      const low = parseFloat(parts[0].trim());
      const high = parseFloat(parts[1].trim());

      if (!isNaN(low) && !isNaN(high)) {
        return { low, high };
      }
    }
  }

  // Formato: "< max" ou "<=max"
  if (trimmed.startsWith('<')) {
    const value = trimmed.replace(/[<>=\s]/g, '');
    const high = parseFloat(value);

    if (!isNaN(high)) {
      return { high };
    }
  }

  // Formato: "> min" ou ">=min"
  if (trimmed.startsWith('>')) {
    const value = trimmed.replace(/[<>=\s]/g, '');
    const low = parseFloat(value);

    if (!isNaN(low)) {
      return { low };
    }
  }

  return undefined;
}

/**
 * Valida se uma string é uma mensagem HL7 válida
 *
 * Verifica:
 * - Começa com "MSH"
 * - Contém delimitadores válidos
 * - Tem pelo menos segmentos mínimos
 *
 * @param hl7String String para validar
 * @returns true se for HL7 válido
 */
export function isValidHL7(hl7String: string): boolean {
  if (!hl7String || typeof hl7String !== 'string') {
    return false;
  }

  // Deve começar com MSH
  if (!hl7String.startsWith('MSH')) {
    return false;
  }

  // Deve ter delimitadores (normalmente |)
  if (!hl7String.includes('|')) {
    return false;
  }

  // Deve ter pelo menos 3 segmentos (MSH, e mais 2)
  const segments = hl7String.split(/\r?\n/).filter(s => s.trim().length > 0);
  return segments.length >= 3;
}

/**
 * Extrai o tipo de mensagem de uma string HL7
 * MSH-9: Message Type (ex: "ORU^R01")
 *
 * @param hl7String Mensagem HL7 completa
 * @returns Tipo de mensagem ou undefined se inválido
 *
 * @example
 * extractMessageType('MSH|^~\\&|....|ORU^R01|...') // 'ORU^R01'
 */
export function extractMessageType(hl7String: string): string | undefined {
  if (!isValidHL7(hl7String)) {
    return undefined;
  }

  try {
    // Pega primeira linha (MSH)
    const mshLine = hl7String.split(/\r?\n/)[0];

    // Split por delimitador (normalmente |)
    const fields = mshLine.split('|');

    // MSH-9 é o campo 9 (índice 8, pois MSH conta de forma diferente)
    // MSH|^~\&|field3|field4|field5|field6|field7|field8|MESSAGE_TYPE|...
    if (fields.length > 8) {
      return fields[8].trim();
    }

    return undefined;
  } catch {
    return undefined;
  }
}
