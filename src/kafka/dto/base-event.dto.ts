import { EventType } from "../../common/interfaces/kafka-event.interface";

export class BaseEventDto {
    eventId: string;
    eventType: EventType;
    timestamp: string;
    source: string;
    resourceType: string;
    data: any;
}