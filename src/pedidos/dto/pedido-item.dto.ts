import { Expose, Type } from 'class-transformer';

export class PedidoItemDto {
  @Expose()
  id: number;

  @Expose()
  cantidad: number;

  @Expose()
  precioUnitario: number;

  @Expose()
  @Type(() => ProductoSimpleDto)
  producto: ProductoSimpleDto;

  @Expose()
  talle: any; // Si querés podés hacer también un TalleDto
}

class ProductoSimpleDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;

  @Expose()
  precio: number;
}
