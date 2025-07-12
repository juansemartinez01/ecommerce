import { IsOptional, IsNumberString, IsBoolean } from 'class-validator';

export class FiltroProductoDto {
  @IsOptional()
  categoriaId?: number;

  @IsOptional()
  talleId?: number;

  @IsOptional()
  enOferta?: boolean;

  @IsOptional()
  @IsBoolean()
  destacado?: boolean;

}
