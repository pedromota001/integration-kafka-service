export class MappedFhirDto {
    resourceType: string;
    status: string;
    code: {
        coding: [
            {
                system: string;
                code: string;
                display: string;
            }
        ];
    };
    valueQuantity: {
        value: number;
        unit: string;
    };
    interpretation: {
        coding: [
            {
                system: string;
                code: string;
                display: string;
            }
        ];
    };
    referenceRange: [
        {
            low: {
                value: number;
                unit: string;
            };
            high: {
                value: number;
                unit: string;
            };
        }
    ];
}