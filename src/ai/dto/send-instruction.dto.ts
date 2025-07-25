import { IsString } from 'class-validator';

export class SendInstructionDto {
  @IsString()
  input: string;
}
