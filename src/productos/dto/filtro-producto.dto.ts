import { IsOptional, IsNumberString } from 'class-validator';

export class FiltroProductoDto {
  @IsOptional()
  categoriaId?: number;

  @IsOptional()
  talleId?: number;

  @IsOptional()
  enOferta?: boolean;
}
