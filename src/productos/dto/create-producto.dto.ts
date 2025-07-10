import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CombinacionDto {
  @IsNumber()
  talleId: number;

  @IsNumber()
  colorId: number;

  @IsNumber()
  stock: number;
}

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  precio: number;

  @IsBoolean()
  enOferta: boolean;

  @IsNumber()
  @IsOptional()
  precioOferta?: number;

  @IsNumber()
  categoriaId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CombinacionDto)
  combinaciones: CombinacionDto[];

  @IsArray()
  @IsString({ each: true })
  imagenes: string[];

  @IsOptional()
  @IsBoolean()
  destacado?: boolean;
}
