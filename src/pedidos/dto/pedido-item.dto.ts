import { Expose, Type } from 'class-transformer';

export class ProductoCombinacionDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => ProductoSimpleDto)
  producto: ProductoSimpleDto;

  @Expose()
  @Type(() => TalleDto)
  talle: TalleDto;

  @Expose()
  @Type(() => ColorDto)
  color: ColorDto;
}

class ProductoSimpleDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;

  @Expose()
  precio: number;
}

class TalleDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;
}

class ColorDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;
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
