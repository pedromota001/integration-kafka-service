import { Module } from '@nestjs/common';
import { HL7ToFhirTransformer } from './hl7-to-fhir.transformer';

/**
 * Módulo de Transformers
 *
 * Centraliza todos os transformers de dados:
 * - HL7 v2 → FHIR R4
 * - TISS XML → FHIR R4 (TODO)
 * - ERP JSON → FHIR R4 (TODO)
 */
@Module({
  providers: [HL7ToFhirTransformer],
  exports: [HL7ToFhirTransformer],
})
export class TransformersModule {}
