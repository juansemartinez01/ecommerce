import { IsString } from 'class-validator';

export class CreateColorDto {
  @IsString()
  nombre: string;
}
