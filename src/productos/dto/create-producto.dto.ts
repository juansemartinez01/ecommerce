import { IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateProductoDto {
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  descripcion?: string;

  @IsNumber()
  precio: number;

  @IsBoolean()
  enOferta: boolean;

  @IsNumber()
  categoriaId: number;

  @IsArray()
  talles: {
    talleId: number;
    stock: number;
  }[];
}
