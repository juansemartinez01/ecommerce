import { IsString } from 'class-validator';

export class CreateTalleDto {
  @IsString()
  nombre: string;
}
