import { IsNumber, Min } from 'class-validator';

export class AddCarritoItemDto {
  @IsNumber()
  productoColorTalleId: number;

  @IsNumber()
  @Min(1)
  cantidad: number;
}
