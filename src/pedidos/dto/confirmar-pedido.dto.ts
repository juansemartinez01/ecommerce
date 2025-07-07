import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemPedidoDto {
  @IsNumber()
  productoId: number;

  @IsNumber()
  talleId: number;

  @IsNumber()
  colorId: number;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precioUnitario: number;
}

export class ConfirmarPedidoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];

  @IsNumber()
  usuarioId: number; // ya que también lo vas a mandar por body
}
