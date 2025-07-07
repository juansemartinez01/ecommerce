import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemPedidoDto {
  @IsNumber()
  productoId: number;

  @IsNumber()
  colorId: number;

  @IsNumber()
  talleId: number;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precioUnitario: number;
}

export class ConfirmarPedidoDto {
  @IsNumber()
  usuarioId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];
}
