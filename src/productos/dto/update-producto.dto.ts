import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  precio?: number;

  @IsOptional()
  @IsNumber()
  precioOferta?: number;

  @IsOptional()
  @IsBoolean()
  enOferta?: boolean;

  @IsOptional()
  @IsNumber()
  categoriaId?: number;

  @IsOptional()
  @IsArray()
  combinaciones?: { talleId: number; colorId: number; stock: number }[];

  @IsOptional()
  @IsArray()
  imagenes?: string[]; // URLs
}
