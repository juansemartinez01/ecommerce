import { IsNumber } from 'class-validator';

export class AgregarItemDto {
  @IsNumber()
  productoId: number;

  @IsNumber()
  talleId: number;

  @IsNumber()
  cantidad: number;
}
