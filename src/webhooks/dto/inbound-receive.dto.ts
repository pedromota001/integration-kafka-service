import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class InboundReceiveDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The data to be received' })
  data: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'The source of the data' })
  source?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'The content type of the data' })
  contentType?: string;

  @IsOptional()
  @ApiProperty({ description: 'The metadata of the data' })
  metaData?: Record<string, any>;
}