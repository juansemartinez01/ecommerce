import { Expose, Type } from 'class-transformer';

export class ProductoDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;

  @Expose()
  precio: number;
}

export class ColorDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;
}

export class TalleDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;
}

export class ProductoCombinacionDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => ProductoDto)
  producto: ProductoDto;

  @Expose()
  @Type(() => TalleDto)
  talle: TalleDto;

  @Expose()
  @Type(() => ColorDto)
  color: ColorDto;
}

export class PedidoItemDto {
  @Expose()
  id: number;

  @Expose()
  cantidad: number;

  @Expose()
  precioUnitario: number;

  @Expose()
  @Type(() => ProductoCombinacionDto)
  productoCombinacion: ProductoCombinacionDto;
}
