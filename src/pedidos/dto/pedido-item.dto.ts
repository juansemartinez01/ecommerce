import { Expose, Type } from 'class-transformer';

class ProductoSimpleDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;

  @Expose()
  precio: number;
}

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
  talle: any; //
 }